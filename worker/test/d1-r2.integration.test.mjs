import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { getPlatformProxy } from "wrangler";
import { createApp } from "../dist/app.js";
import { sha256Base64Url } from "../dist/crypto.js";
import { runMaintenance } from "../dist/maintenance.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workerRoot = path.resolve(__dirname, "..");

test("worker routes persist document metadata in D1 and Markdown content in R2", async () => {
  await withRuntimeHarness(async ({ app, env, proxy }) => {
    const group = await createGroup(app, env, {
      name: "Runtime workspace",
      description: "Backed by local D1",
    });
    const document = await createDocument(app, env, group.id, {
      title: "Runtime document",
      content: "# Stored in R2\n\nThis came through the Worker API.",
    });

    const documentRow = await proxy.env.DB.prepare(
      `SELECT id, group_id, title, content_key, revision
      FROM documents
      WHERE id = ?`,
    )
      .bind(document.id)
      .first();
    const storedObject = await proxy.env.CONTENT.get(documentRow.content_key);
    const fetchedDocument = await json(
      await app.request(
        `https://example.downwrite.test/api/v1/documents/${document.id}`,
        { headers: authHeaders("owner-token") },
        env,
      ),
    );

    assert.equal(documentRow.group_id, group.id);
    assert.equal(documentRow.title, "Runtime document");
    assert.equal(documentRow.revision, 0);
    assert.equal(
      await storedObject.text(),
      "# Stored in R2\n\nThis came through the Worker API.",
    );
    assert.equal(
      fetchedDocument.document.content,
      "# Stored in R2\n\nThis came through the Worker API.",
    );
  });
});

test("D1/R2 document writes enforce revision preconditions without changing stored content", async () => {
  await withRuntimeHarness(async ({ app, env, proxy }) => {
    const group = await createGroup(app, env);
    const document = await createDocument(app, env, group.id, {
      title: "Revisioned runtime document",
      content: "original runtime content",
    });

    const missingRevision = await patchDocument(app, env, document.id, {
      content: "missing revision should not write",
    });
    const updated = await json(
      await patchDocument(app, env, document.id, {
        content: "accepted runtime update",
        baseRevision: document.revision,
      }),
    );
    const staleRevision = await patchDocument(app, env, document.id, {
      content: "stale revision should not write",
      baseRevision: document.revision,
    });
    const documentRow = await proxy.env.DB.prepare(
      `SELECT content_key, revision FROM documents WHERE id = ?`,
    )
      .bind(document.id)
      .first();
    const storedObject = await proxy.env.CONTENT.get(documentRow.content_key);

    assert.equal(missingRevision.status, 428);
    assert.equal((await missingRevision.json()).code, "precondition_required");
    assert.equal(updated.document.revision, 1);
    assert.equal(staleRevision.status, 409);
    assert.equal((await staleRevision.json()).code, "conflict");
    assert.equal(documentRow.revision, 1);
    assert.equal(await storedObject.text(), "accepted runtime update");
  });
});

test("D1/R2 comment rows cascade and checkpoint objects are cleaned up", async () => {
  await withRuntimeHarness(async ({ app, env, proxy }) => {
    const group = await createGroup(app, env);
    const document = await createDocument(app, env, group.id, {
      title: "Checkpointed runtime document",
      content: "checkpoint source",
    });
    await json(
      await app.request(
        `https://example.downwrite.test/api/v1/documents/${document.id}/comment-threads`,
        {
          method: "POST",
          headers: authHeaders("owner-token"),
          body: JSON.stringify({
            anchor: { type: "document" },
            body: "Runtime comment.",
          }),
        },
        env,
      ),
    );
    const version = await json(
      await app.request(
        `https://example.downwrite.test/api/v1/documents/${document.id}/versions`,
        {
          method: "POST",
          headers: authHeaders("owner-token"),
          body: JSON.stringify({
            name: "Runtime checkpoint",
            baseRevision: document.revision,
          }),
        },
        env,
      ),
    );
    const versionRow = await proxy.env.DB.prepare(
      `SELECT content_key FROM document_versions WHERE id = ?`,
    )
      .bind(version.version.id)
      .first();
    const versionObject = await proxy.env.CONTENT.get(versionRow.content_key);

    const deleted = await json(
      await app.request(
        `https://example.downwrite.test/api/v1/documents/${document.id}`,
        {
          method: "DELETE",
          headers: authHeaders("owner-token"),
        },
        env,
      ),
    );
    const deletedVersionObject = await proxy.env.CONTENT.get(
      versionRow.content_key,
    );

    assert.equal(await versionObject.text(), "checkpoint source");
    assert.equal(deleted.ok, true);
    assert.equal(await countRows(proxy.env.DB, "comment_threads"), 0);
    assert.equal(await countRows(proxy.env.DB, "comment_messages"), 0);
    assert.equal(await countRows(proxy.env.DB, "document_versions"), 0);
    assert.equal(deletedVersionObject, null);
  });
});

test("D1/R2 workspace and document lists preserve cursor pagination", async () => {
  await withRuntimeHarness(async ({ app, env }) => {
    const firstGroup = await createGroup(app, env, { name: "Runtime A" });
    await createGroup(app, env, { name: "Runtime B" });
    await createGroup(app, env, { name: "Runtime C" });
    const firstDocument = await createDocument(app, env, firstGroup.id, {
      title: "Runtime one",
      content: "one",
    });
    const secondDocument = await createDocument(app, env, firstGroup.id, {
      title: "Runtime two",
      content: "two",
    });
    const thirdDocument = await createDocument(app, env, firstGroup.id, {
      title: "Runtime three",
      content: "three",
    });

    const groupsPageOne = await json(
      await app.request(
        "https://example.downwrite.test/api/v1/groups?limit=2",
        { headers: authHeaders("owner-token") },
        env,
      ),
    );
    const groupsPageTwo = await json(
      await app.request(
        `https://example.downwrite.test/api/v1/groups?limit=2&cursor=${encodeURIComponent(groupsPageOne.nextCursor)}`,
        { headers: authHeaders("owner-token") },
        env,
      ),
    );
    const documentsPageOne = await json(
      await app.request(
        `https://example.downwrite.test/api/v1/groups/${firstGroup.id}/documents?limit=2`,
        { headers: authHeaders("owner-token") },
        env,
      ),
    );
    const documentsPageTwo = await json(
      await app.request(
        `https://example.downwrite.test/api/v1/groups/${firstGroup.id}/documents?limit=2&cursor=${encodeURIComponent(documentsPageOne.nextCursor)}`,
        { headers: authHeaders("owner-token") },
        env,
      ),
    );

    assert.equal(groupsPageOne.groups.length, 2);
    assert.equal(typeof groupsPageOne.nextCursor, "string");
    assert.equal(groupsPageTwo.groups.length, 1);
    assert.equal(groupsPageTwo.nextCursor, undefined);
    assert.deepEqual(
      documentsPageOne.documents.map((item) => item.id),
      [firstDocument.id, secondDocument.id],
    );
    assert.equal(typeof documentsPageOne.nextCursor, "string");
    assert.deepEqual(
      documentsPageTwo.documents.map((item) => item.id),
      [thirdDocument.id],
    );
    assert.equal(documentsPageTwo.nextCursor, undefined);
  });
});

test("D1/R2 public links can be read anonymously and revoked", async () => {
  await withRuntimeHarness(async ({ app, env }) => {
    const group = await createGroup(app, env);
    const document = await createDocument(app, env, group.id, {
      title: "Runtime public link",
      content: "public runtime content",
    });
    const link = await json(
      await app.request(
        `https://example.downwrite.test/api/v1/documents/${document.id}/public-links`,
        {
          method: "POST",
          headers: authHeaders("owner-token"),
          body: JSON.stringify({ label: "Runtime review" }),
        },
        env,
      ),
    );
    const publicRead = await json(
      await app.request(
        `https://example.downwrite.test/api/v1/public-links/${link.publicLink.token}`,
        {},
        env,
      ),
    );
    const revoked = await json(
      await app.request(
        `https://example.downwrite.test/api/v1/public-links/${link.publicLink.id}`,
        {
          method: "PATCH",
          headers: authHeaders("owner-token"),
          body: JSON.stringify({ active: false }),
        },
        env,
      ),
    );
    const afterRevoke = await app.request(
      `https://example.downwrite.test/api/v1/public-links/${link.publicLink.token}`,
      {},
      env,
    );

    assert.equal(link.publicLink.active, true);
    assert.equal(publicRead.document.id, document.id);
    assert.equal(publicRead.document.content, "public runtime content");
    assert.equal(revoked.publicLink.active, false);
    assert.equal(afterRevoke.status, 404);
  });
});

test("D1-backed OAuth approval persists authorization transactions and issues tokens", async () => {
  await withRuntimeHarness(async ({ app, env, proxy }) => {
    const cookie = await createSessionCookie(proxy.env.DB, "runtime-owner");
    const token = await oauthToken(app, env, cookie, {
      scope: "workspaces:read documents:read",
    });
    const groups = await json(
      await app.request(
        "https://example.downwrite.test/api/v1/groups",
        { headers: { authorization: `Bearer ${token.access_token}` } },
        env,
      ),
    );
    const requestCount = await countRows(
      proxy.env.DB,
      "oauth_authorization_requests",
    );
    const codeCount = await countRows(
      proxy.env.DB,
      "oauth_authorization_codes",
    );
    const accessCount = await countRows(proxy.env.DB, "oauth_access_tokens");
    const refreshCount = await countRows(proxy.env.DB, "oauth_refresh_tokens");

    assert.equal(token.token_type, "Bearer");
    assert.equal(token.scope, "workspaces:read documents:read");
    assert.equal(Array.isArray(groups.groups), true);
    assert.equal(requestCount, 1);
    assert.equal(codeCount, 1);
    assert.equal(accessCount, 1);
    assert.equal(refreshCount, 1);
  });
});

test("scheduled maintenance removes expired D1 operational records", async () => {
  await withRuntimeHarness(async ({ proxy }) => {
    await seedExpiredOperationalRows(proxy.env.DB);

    const result = await runMaintenance({
      env: proxy.env,
      now: new Date("2026-01-01T00:00:00.000Z"),
    });

    assert.deepEqual(result, {
      sessions: 1,
      webauthnChallenges: 1,
      oauthAuthorizationCodes: 1,
      oauthAuthorizationRequests: 1,
      oauthAccessTokens: 1,
      oauthRefreshTokens: 1,
      rateLimits: 1,
    });
    assert.equal(await countRows(proxy.env.DB, "sessions"), 0);
    assert.equal(await countRows(proxy.env.DB, "webauthn_challenges"), 0);
    assert.equal(await countRows(proxy.env.DB, "oauth_authorization_codes"), 0);
    assert.equal(
      await countRows(proxy.env.DB, "oauth_authorization_requests"),
      0,
    );
    assert.equal(await countRows(proxy.env.DB, "oauth_access_tokens"), 0);
    assert.equal(await countRows(proxy.env.DB, "oauth_refresh_tokens"), 0);
    assert.equal(await countRows(proxy.env.DB, "rate_limits"), 0);
  });
});

async function withRuntimeHarness(run) {
  const proxy = await getPlatformProxy({
    configPath: path.join(workerRoot, "wrangler.toml"),
    envFiles: [],
    persist: false,
    remoteBindings: false,
  });

  try {
    await applyMigrations(proxy.env.DB);
    const app = createApp();
    const env = {
      ...proxy.env,
      DEVELOPMENT_API_TOKENS:
        "dev-owner:owner-token,dev-editor:editor-token,outsider:outsider-token",
    };

    await run({ app, env, proxy });
  } finally {
    await proxy.dispose();
  }
}

async function applyMigrations(db) {
  const migrationsDir = path.join(workerRoot, "migrations");
  const migrationFiles = (await readdir(migrationsDir))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of migrationFiles) {
    const sql = await readFile(path.join(migrationsDir, file), "utf8");
    for (const statement of sqlStatements(sql)) {
      await db.prepare(statement).run();
    }
  }
}

function sqlStatements(sql) {
  return sql
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);
}

async function json(response) {
  const body = await response.json();
  assert.ok(
    response.ok,
    `Expected ${response.url} to succeed, got ${response.status}: ${JSON.stringify(body)}`,
  );
  return body;
}

async function createGroup(app, env, overrides = {}) {
  const response = await app.request(
    "https://example.downwrite.test/api/v1/groups",
    {
      method: "POST",
      headers: authHeaders("owner-token"),
      body: JSON.stringify({
        name: "Runtime workspace",
        description: "Backed by local D1",
        accentColor: "#566f5f",
        ...overrides,
      }),
    },
    env,
  );
  return (await json(response)).group;
}

async function createDocument(
  app,
  env,
  groupId,
  input = { title: "Runtime document", content: "runtime content" },
) {
  const response = await app.request(
    `https://example.downwrite.test/api/v1/groups/${groupId}/documents`,
    {
      method: "POST",
      headers: authHeaders("owner-token"),
      body: JSON.stringify(input),
    },
    env,
  );
  return (await json(response)).document;
}

async function patchDocument(app, env, documentId, input) {
  return app.request(
    `https://example.downwrite.test/api/v1/documents/${documentId}`,
    {
      method: "PATCH",
      headers: authHeaders("owner-token"),
      body: JSON.stringify(input),
    },
    env,
  );
}

function authHeaders(token) {
  return {
    authorization: `Bearer ${token}`,
    "content-type": "application/json",
  };
}

function formHeaders(extra = {}) {
  return {
    "content-type": "application/x-www-form-urlencoded",
    ...extra,
  };
}

async function createSessionCookie(db, identityId) {
  const token = `session-${identityId}-${crypto.randomUUID()}`;
  await db
    .prepare(
      `INSERT INTO identities (id, display_name) VALUES (?, ?)
      ON CONFLICT(id) DO UPDATE SET display_name = excluded.display_name`,
    )
    .bind(identityId, identityId)
    .run();
  await db
    .prepare(
      `INSERT INTO sessions (id, identity_id, token_hash, expires_at)
      VALUES (?, ?, ?, ?)`,
    )
    .bind(
      crypto.randomUUID(),
      identityId,
      await sha256Base64Url(token),
      new Date(Date.now() + 86_400_000).toISOString(),
    )
    .run();

  return `dw_session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax`;
}

async function oauthToken(
  app,
  env,
  cookie,
  {
    scope,
    state = "client-state",
    resource = "https://example.downwrite.test/api/v1",
  },
) {
  const verifier = `verifier-${crypto.randomUUID()}`;
  const challenge = await sha256Base64Url(verifier);
  const authorizeUrl = new URL(
    "https://example.downwrite.test/oauth/authorize",
  );
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("client_id", "downwrite-mcp");
  authorizeUrl.searchParams.set(
    "redirect_uri",
    "http://127.0.0.1:49152/callback",
  );
  authorizeUrl.searchParams.set("code_challenge", challenge);
  authorizeUrl.searchParams.set("code_challenge_method", "S256");
  authorizeUrl.searchParams.set("scope", scope);
  authorizeUrl.searchParams.set("resource", resource);
  authorizeUrl.searchParams.set("state", state);

  const consent = await app.request(
    authorizeUrl.toString(),
    { headers: { cookie } },
    env,
  );
  const consentHtml = await consent.text();
  assert.equal(consent.status, 200);
  const authorizationRequest = hiddenInputValue(
    consentHtml,
    "authorization_request",
  );

  const approve = await app.request(
    "https://example.downwrite.test/oauth/authorize/approve",
    {
      method: "POST",
      headers: formHeaders({
        cookie,
        origin: "https://example.downwrite.test",
      }),
      body: new URLSearchParams({
        authorization_request: authorizationRequest,
      }),
    },
    env,
  );
  const redirect = new URL(approve.headers.get("location"));
  const code = redirect.searchParams.get("code");
  assert.equal(approve.status, 302);
  assert.equal(redirect.searchParams.get("state"), state);
  assert.equal(typeof code, "string");

  const tokenResponse = await app.request(
    "https://example.downwrite.test/oauth/token",
    {
      method: "POST",
      headers: formHeaders(),
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: "downwrite-mcp",
        redirect_uri: "http://127.0.0.1:49152/callback",
        code,
        code_verifier: verifier,
      }),
    },
    env,
  );
  const token = await tokenResponse.json();
  assert.equal(tokenResponse.status, 200);
  return token;
}

function hiddenInputValue(html, name) {
  const pattern = new RegExp(
    `<input[^>]+name="${name}"[^>]+value="([^"]+)"`,
    "i",
  );
  const match = html.match(pattern);
  assert.ok(match, `Expected hidden input ${name}`);
  return match[1];
}

async function seedExpiredOperationalRows(db) {
  const expiredAt = "2025-01-01T00:00:00.000Z";
  await db
    .prepare(
      `INSERT INTO identities (id, display_name) VALUES ('cleanup', 'Cleanup')`,
    )
    .run();
  await db
    .prepare(
      `INSERT INTO sessions (id, identity_id, token_hash, expires_at)
      VALUES ('session-expired', 'cleanup', ?, ?)`,
    )
    .bind(await sha256Base64Url("expired-session"), expiredAt)
    .run();
  await db
    .prepare(
      `INSERT INTO webauthn_challenges (id, identity_id, type, challenge, created_at)
      VALUES ('challenge-expired', 'cleanup', 'login', 'challenge', ?)`,
    )
    .bind(expiredAt)
    .run();
  await db
    .prepare(
      `INSERT INTO oauth_authorization_codes
        (id, code_hash, identity_id, client_id, redirect_uri, code_challenge,
          code_challenge_method, scopes, resource, expires_at)
      VALUES ('code-expired', ?, 'cleanup', 'downwrite-ios',
        'downwrite://oauth/callback', 'challenge', 'S256', '[]',
        'https://example.downwrite.test/api/v1', ?)`,
    )
    .bind(await sha256Base64Url("expired-code"), expiredAt)
    .run();
  await db
    .prepare(
      `INSERT INTO oauth_authorization_requests
        (id, request_hash, identity_id, client_id, redirect_uri, code_challenge,
          code_challenge_method, scopes, resource, state, expires_at)
      VALUES ('request-expired', ?, 'cleanup', 'downwrite-ios',
        'downwrite://oauth/callback', 'challenge', 'S256', '[]',
        'https://example.downwrite.test/api/v1', 'state', ?)`,
    )
    .bind(await sha256Base64Url("expired-request"), expiredAt)
    .run();
  await db
    .prepare(
      `INSERT INTO oauth_access_tokens
        (token_hash, identity_id, client_id, scopes, resource, expires_at)
      VALUES (?, 'cleanup', 'downwrite-ios', '[]',
        'https://example.downwrite.test/api/v1', ?)`,
    )
    .bind(await sha256Base64Url("expired-access"), expiredAt)
    .run();
  await db
    .prepare(
      `INSERT INTO oauth_refresh_tokens
        (token_hash, identity_id, client_id, scopes, resource, expires_at)
      VALUES (?, 'cleanup', 'downwrite-ios', '[]',
        'https://example.downwrite.test/api/v1', ?)`,
    )
    .bind(await sha256Base64Url("expired-refresh"), expiredAt)
    .run();
  await db
    .prepare(
      `INSERT INTO rate_limits (key, count, reset_at)
      VALUES ('rate-expired', 1, ?)`,
    )
    .bind(expiredAt)
    .run();
}

async function countRows(db, table) {
  const row = await db
    .prepare(`SELECT COUNT(*) AS count FROM ${table}`)
    .first();
  return row.count;
}

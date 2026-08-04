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

    const createdGroup = await json(
      await app.request(
        "https://example.downwrite.test/api/v1/groups",
        {
          method: "POST",
          headers: authHeaders("owner-token"),
          body: JSON.stringify({
            name: "Runtime workspace",
            description: "Backed by local D1",
          }),
        },
        env,
      ),
    );
    const groupId = createdGroup.group.id;

    const createdDocument = await json(
      await app.request(
        `https://example.downwrite.test/api/v1/groups/${groupId}/documents`,
        {
          method: "POST",
          headers: authHeaders("owner-token"),
          body: JSON.stringify({
            title: "Runtime document",
            content: "# Stored in R2\n\nThis came through the Worker API.",
          }),
        },
        env,
      ),
    );
    const documentId = createdDocument.document.id;

    const documentRow = await proxy.env.DB.prepare(
      `SELECT id, group_id, title, content_key, revision
      FROM documents
      WHERE id = ?`,
    )
      .bind(documentId)
      .first();
    const storedObject = await proxy.env.CONTENT.get(documentRow.content_key);
    const fetchedDocument = await json(
      await app.request(
        `https://example.downwrite.test/api/v1/documents/${documentId}`,
        { headers: authHeaders("owner-token") },
        env,
      ),
    );

    assert.equal(documentRow.group_id, groupId);
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
  } finally {
    await proxy.dispose();
  }
});

test("scheduled maintenance removes expired D1 operational records", async () => {
  const proxy = await getPlatformProxy({
    configPath: path.join(workerRoot, "wrangler.toml"),
    envFiles: [],
    persist: false,
    remoteBindings: false,
  });

  try {
    await applyMigrations(proxy.env.DB);
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
  } finally {
    await proxy.dispose();
  }
});

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

function authHeaders(token) {
  return {
    authorization: `Bearer ${token}`,
    "content-type": "application/json",
  };
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

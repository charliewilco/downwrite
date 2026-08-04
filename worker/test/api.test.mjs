import assert from "node:assert/strict";
import test from "node:test";
import { createApp } from "../dist/app.js";
import { sha256Base64Url } from "../dist/crypto.js";
import { MemoryStorage } from "./support/memory-storage.mjs";

const TOKENS =
  "dev-owner:owner-token,dev-editor:editor-token,outsider:outsider-token";

test("health reports the versioned API", async () => {
  const { app, env } = createHarness();
  const response = await app.request("/api/v1/health", {}, env);

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), {
    ok: true,
    name: "downwrite-api",
    version: "v1",
  });
});

test("discovery reports instance metadata for public native clients", async () => {
  const { app, env } = createHarness();
  const response = await app.request(
    "https://example.downwrite.test/.well-known/downwrite",
    {},
    env,
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.name, "downwrite-api");
  assert.equal(body.instanceUrl, "https://example.downwrite.test");
  assert.equal(body.api.currentVersion, "v1");
  assert.deepEqual(body.api.supportedVersions, ["v1"]);
  assert.equal(body.api.baseUrl, "https://example.downwrite.test/api/v1");
  assert.equal(body.api.basePath, "/api/v1");
  assert.equal(
    body.api.openApiUrl,
    "https://example.downwrite.test/api/v1/openapi.json",
  );
  assert.equal(
    body.api.documentationUrl,
    "https://example.downwrite.test/api/v1/docs",
  );
  assert.equal(body.clients.native.publicIosAppSupported, true);
  assert.equal(body.clients.native.deploymentSpecificIosAppRequired, false);
  assert.equal(body.clients.mcp.supportedAsExternalClient, true);
  assert.equal(body.clients.mcp.privilegedBackdoor, false);
  assert.deepEqual(body.clients.mcp.expectedTools, [
    "list_workspaces",
    "list_documents",
    "read_document",
    "create_document",
    "update_document",
  ]);
  assert.equal(
    body.auth.futureBoundary,
    "OAuth 2.1 authorization code with PKCE for future native clients",
  );
  assert.equal(
    body.auth.web,
    "passkeys-webauthn-http-only-server-side-session",
  );
  assert.equal(body.auth.native.pkce, true);
  assert.equal(body.auth.native.browserSignInRequired, true);
});

test("serves an OpenAPI contract for the implemented API", async () => {
  const { app, env } = createHarness();
  const response = await app.request(
    "https://example.downwrite.test/api/v1/openapi.json",
    {},
    env,
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.openapi, "3.1.0");
  assert.equal(body.info.title, "Downwrite Worker API");
  assert.equal(body.info.version, "v1");
  assert.ok(body.components.schemas.DocumentRecord);
  assert.ok(body.components.securitySchemes.sessionCookie);
  assert.ok(body.components.securitySchemes.developmentBearer);
  assert.ok(body.components.securitySchemes.oauthPkcePlanned);
  assert.equal(body.paths["/oauth/authorize"], undefined);
  assert.equal(
    body["x-downwrite-api-roadmap"].proposed.nativeClientAuth.some((item) =>
      item.includes("/oauth/authorize"),
    ),
    true,
  );
  assert.equal(
    body.paths["/api/v1/documents/{documentId}"].patch["x-downwrite-scope"],
    "documents:write",
  );
  assert.equal(
    body.components.schemas.DocumentRecord.allOf[1].properties.content
      .mediaType,
    "text/markdown",
  );
});

test("OpenAPI method and path set matches registered Hono routes", async () => {
  const { app, env } = createHarness();
  const response = await app.request(
    "https://example.downwrite.test/api/v1/openapi.json",
    {},
    env,
  );
  const spec = await response.json();
  const registered = new Set(
    app.routes
      .filter((route) => route.method !== "ALL")
      .map((route) => `${route.method} ${normalizeHonoPath(route.path)}`),
  );
  const documented = new Set(
    Object.entries(spec.paths).flatMap(([path, methods]) =>
      Object.keys(methods).map((method) => `${method.toUpperCase()} ${path}`),
    ),
  );

  assert.deepEqual([...documented].sort(), [...registered].sort());
});

test("serves a local HTML API documentation view", async () => {
  const { app, env } = createHarness();
  const response = await app.request(
    "https://example.downwrite.test/api/v1/docs",
    {},
    env,
  );
  const body = await response.text();

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /text\/html/);
  assert.match(body, /Downwrite API v1/);
  assert.equal(body.includes("/api/v1/openapi.json"), true);
  assert.equal(body.includes("/api/v1/documents/{documentId}"), true);
});

test("authenticated identity can create a group and document", async () => {
  const { app, env } = createHarness();
  const group = await createGroup(app, env);
  const document = await createDocument(app, env, group.id);

  assert.equal(group.role, "owner");
  assert.equal(document.title, "Launch notes");
  assert.equal(document.content, "# Ship it");
  assert.equal(document.position, 1000);
  assert.equal(document.revision, 0);

  const response = await app.request(
    "/api/v1/groups",
    { headers: authHeaders("owner-token") },
    env,
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.groups.length, 1);
  assert.equal(body.groups[0].documents[0].id, document.id);
  assert.equal(body.groups[0].documents[0].position, 1000);
  assert.equal(body.groups[0].documents[0].revision, 0);
});

test("document writes can reject stale revisions", async () => {
  const { app, env } = createHarness();
  const group = await createGroup(app, env);
  const document = await createDocument(app, env, group.id);

  const saved = await app.request(
    `/api/v1/documents/${document.id}`,
    {
      method: "PATCH",
      headers: authHeaders("owner-token"),
      body: JSON.stringify({
        title: "Launch notes v2",
        baseRevision: document.revision,
      }),
    },
    env,
  );
  const savedBody = await saved.json();
  const stale = await app.request(
    `/api/v1/documents/${document.id}`,
    {
      method: "PATCH",
      headers: authHeaders("owner-token"),
      body: JSON.stringify({
        content: "stale edit",
        baseRevision: document.revision,
      }),
    },
    env,
  );

  assert.equal(saved.status, 200);
  assert.equal(savedBody.document.revision, document.revision + 1);
  assert.equal(stale.status, 409);
});

test("documents can be reordered within a workspace", async () => {
  const { app, env } = createHarness();
  const group = await createGroup(app, env);
  const first = await createDocument(app, env, group.id);
  const second = await createDocument(app, env, group.id, {
    title: "Second",
    content: "second",
  });

  const reorder = await app.request(
    `/api/v1/documents/${second.id}/position`,
    {
      method: "PATCH",
      headers: authHeaders("owner-token"),
      body: JSON.stringify({
        position: first.position - 100,
        baseRevision: second.revision,
      }),
    },
    env,
  );
  const list = await app.request(
    "/api/v1/groups",
    { headers: authHeaders("owner-token") },
    env,
  );
  const listBody = await list.json();

  assert.equal(reorder.status, 200);
  assert.equal(listBody.groups[0].documents[0].id, second.id);
  assert.equal(listBody.groups[0].documents[1].id, first.id);
});

test("documents can move between authorized workspaces", async () => {
  const { app, env } = createHarness();
  const source = await createGroup(app, env);
  const targetResponse = await app.request(
    "/api/v1/groups",
    {
      method: "POST",
      headers: authHeaders("owner-token"),
      body: JSON.stringify({ name: "Archive" }),
    },
    env,
  );
  const target = (await targetResponse.json()).group;
  const document = await createDocument(app, env, source.id);

  const move = await app.request(
    `/api/v1/documents/${document.id}/move`,
    {
      method: "PATCH",
      headers: authHeaders("owner-token"),
      body: JSON.stringify({
        groupId: target.id,
        position: 50,
        baseRevision: document.revision,
      }),
    },
    env,
  );
  const moveBody = await move.json();
  const list = await app.request(
    "/api/v1/groups",
    { headers: authHeaders("owner-token") },
    env,
  );
  const listBody = await list.json();

  assert.equal(move.status, 200);
  assert.equal(moveBody.document.groupId, target.id);
  assert.equal(moveBody.document.position, 50);
  assert.equal(moveBody.document.revision, document.revision + 1);
  assert.deepEqual(
    listBody.groups.find((group) => group.id === source.id).documents,
    [],
  );
  assert.equal(
    listBody.groups.find((group) => group.id === target.id).documents[0].id,
    document.id,
  );
});

test("owners can update group organization fields", async () => {
  const { app, env } = createHarness();
  const group = await createGroup(app, env);

  const response = await app.request(
    `/api/v1/groups/${group.id}`,
    {
      method: "PATCH",
      headers: authHeaders("owner-token"),
      body: JSON.stringify({
        name: "Field notes",
        description: "Shared Markdown organized by launch area.",
        accentColor: "#2f6f5e",
      }),
    },
    env,
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.group.name, "Field notes");
  assert.equal(
    body.group.description,
    "Shared Markdown organized by launch area.",
  );
  assert.equal(body.group.accentColor, "#2f6f5e");
});

test("only group owners can delete groups", async () => {
  const { app, env } = createHarness();
  const group = await createGroup(app, env);
  const document = await createDocument(app, env, group.id);

  await app.request(
    `/api/v1/documents/${document.id}/collaborators`,
    {
      method: "POST",
      headers: authHeaders("owner-token"),
      body: JSON.stringify({ identityId: "dev-editor", role: "editor" }),
    },
    env,
  );

  const denied = await app.request(
    `/api/v1/groups/${group.id}`,
    {
      method: "DELETE",
      headers: authHeaders("editor-token"),
    },
    env,
  );
  const deleted = await app.request(
    `/api/v1/groups/${group.id}`,
    {
      method: "DELETE",
      headers: authHeaders("owner-token"),
    },
    env,
  );

  assert.equal(denied.status, 403);
  assert.equal(deleted.status, 200);
});

test("anonymous requests cannot read or write private documents", async () => {
  const { app, env } = createHarness();
  const group = await createGroup(app, env);
  const document = await createDocument(app, env, group.id);

  const readResponse = await app.request(
    `/api/v1/documents/${document.id}`,
    {},
    env,
  );
  const writeResponse = await app.request(
    `/api/v1/documents/${document.id}`,
    {
      method: "PATCH",
      body: JSON.stringify({ content: "anonymous edit" }),
    },
    env,
  );

  assert.equal(readResponse.status, 401);
  assert.equal(writeResponse.status, 401);
});

test("explicitly invited editors may write a document", async () => {
  const { app, env } = createHarness();
  const group = await createGroup(app, env);
  const document = await createDocument(app, env, group.id);

  const inviteResponse = await app.request(
    `/api/v1/documents/${document.id}/collaborators`,
    {
      method: "POST",
      headers: authHeaders("owner-token"),
      body: JSON.stringify({ identityId: "dev-editor", role: "editor" }),
    },
    env,
  );

  assert.equal(inviteResponse.status, 200);

  const editResponse = await app.request(
    `/api/v1/documents/${document.id}`,
    {
      method: "PATCH",
      headers: authHeaders("editor-token"),
      body: JSON.stringify({ content: "edited by invite" }),
    },
    env,
  );
  const body = await editResponse.json();

  assert.equal(editResponse.status, 200);
  assert.equal(body.document.content, "edited by invite");
});

test("public links allow anonymous read but not anonymous edit", async () => {
  const { app, env } = createHarness();
  const group = await createGroup(app, env);
  const document = await createDocument(app, env, group.id);

  const linkResponse = await app.request(
    `/api/v1/documents/${document.id}/public-links`,
    {
      method: "POST",
      headers: authHeaders("owner-token"),
      body: JSON.stringify({ label: "Review copy" }),
    },
    env,
  );
  const linkBody = await linkResponse.json();
  const token = linkBody.publicLink.token;

  assert.equal(linkResponse.status, 201);
  assert.equal(typeof token, "string");

  const publicResponse = await app.request(
    `/api/v1/public-links/${token}`,
    {},
    env,
  );
  const publicBody = await publicResponse.json();

  assert.equal(publicResponse.status, 200);
  assert.equal(publicBody.document.title, "Launch notes");
  assert.equal(publicBody.document.content, "# Ship it");

  const editResponse = await app.request(
    `/api/v1/documents/${document.id}`,
    {
      method: "PATCH",
      body: JSON.stringify({ content: "anonymous edit" }),
    },
    env,
  );

  assert.equal(editResponse.status, 401);
});

test("owners can inspect share state, invite collaborators, and invited identities can accept", async () => {
  const { app, env } = createHarness();
  const group = await createGroup(app, env);
  const document = await createDocument(app, env, group.id);

  const inviteResponse = await app.request(
    `/api/v1/documents/${document.id}/invitations`,
    {
      method: "POST",
      headers: authHeaders("owner-token"),
      body: JSON.stringify({ identityId: "dev-editor", role: "editor" }),
    },
    env,
  );
  const inviteBody = await inviteResponse.json();

  assert.equal(inviteResponse.status, 201);
  assert.equal(inviteBody.invitation.status, "pending");

  const acceptResponse = await app.request(
    `/api/v1/invitations/${inviteBody.invitation.token}/accept`,
    {
      method: "POST",
      headers: authHeaders("editor-token"),
    },
    env,
  );
  const acceptBody = await acceptResponse.json();

  assert.equal(acceptResponse.status, 200);
  assert.equal(acceptBody.invitation.status, "accepted");

  const editResponse = await app.request(
    `/api/v1/documents/${document.id}`,
    {
      method: "PATCH",
      headers: authHeaders("editor-token"),
      body: JSON.stringify({ content: "accepted invite edit" }),
    },
    env,
  );

  assert.equal(editResponse.status, 200);

  const shareResponse = await app.request(
    `/api/v1/documents/${document.id}/share`,
    { headers: authHeaders("owner-token") },
    env,
  );
  const shareBody = await shareResponse.json();

  assert.equal(shareResponse.status, 200);
  assert.equal(shareBody.share.invitations[0].status, "accepted");
  assert.equal(
    shareBody.share.collaborators.some(
      (collaborator) => collaborator.identityId === "dev-editor",
    ),
    true,
  );
});

test("public links can be revoked by owners", async () => {
  const { app, env } = createHarness();
  const group = await createGroup(app, env);
  const document = await createDocument(app, env, group.id);

  const linkResponse = await app.request(
    `/api/v1/documents/${document.id}/public-links`,
    {
      method: "POST",
      headers: authHeaders("owner-token"),
      body: JSON.stringify({ label: "Published" }),
    },
    env,
  );
  const linkBody = await linkResponse.json();

  const revokeResponse = await app.request(
    `/api/v1/public-links/${linkBody.publicLink.id}`,
    {
      method: "PATCH",
      headers: authHeaders("owner-token"),
      body: JSON.stringify({ active: false }),
    },
    env,
  );
  const publicResponse = await app.request(
    `/api/v1/public-links/${linkBody.publicLink.token}`,
    {},
    env,
  );

  assert.equal(revokeResponse.status, 200);
  assert.equal(publicResponse.status, 404);
});

test("session cookies authenticate after passkey login verification", async () => {
  const storage = new MemoryStorage();
  await storage.createIdentityWithCredential({
    identityId: "session-owner",
    displayName: "Session Owner",
    credentialId: "credential-id",
    publicKey: new Uint8Array([1, 2, 3]),
    counter: 0,
    transports: [],
  });
  const authService = new FakeAuthService("session-owner");
  const app = createApp({ createStorage: () => storage, authService });
  const env = { DEVELOPMENT_API_TOKENS: TOKENS };

  const loginOptions = await app.request(
    "/api/v1/auth/passkeys/login/options",
    {
      method: "POST",
      body: JSON.stringify({ identityId: "session-owner" }),
    },
    env,
  );
  const verifyResponse = await app.request(
    "/api/v1/auth/passkeys/login/verify",
    {
      method: "POST",
      body: JSON.stringify({ challengeId: "fake", response: {} }),
    },
    env,
  );
  const cookie = verifyResponse.headers.get("set-cookie");
  const groupResponse = await app.request(
    "/api/v1/groups",
    { headers: { cookie } },
    env,
  );

  assert.equal(loginOptions.status, 200);
  assert.equal(verifyResponse.status, 200);
  assert.match(cookie, /dw_session=/);
  assert.equal(groupResponse.status, 200);
});

test("cookie-authenticated writes require a same-origin request", async () => {
  const storage = new MemoryStorage();
  await storage.createIdentityWithCredential({
    identityId: "session-owner",
    displayName: "Session Owner",
    credentialId: "credential-id",
    publicKey: new Uint8Array([1, 2, 3]),
    counter: 0,
    transports: [],
  });
  const authService = new FakeAuthService("session-owner");
  const app = createApp({ createStorage: () => storage, authService });
  const env = { DEVELOPMENT_API_TOKENS: TOKENS };

  const verifyResponse = await app.request(
    "http://localhost/api/v1/auth/passkeys/login/verify",
    {
      method: "POST",
      body: JSON.stringify({ challengeId: "fake", response: {} }),
    },
    env,
  );
  const cookie = verifyResponse.headers.get("set-cookie");
  const blocked = await app.request(
    "http://localhost/api/v1/groups",
    {
      method: "POST",
      headers: { cookie, "content-type": "application/json" },
      body: JSON.stringify({ name: "Blocked" }),
    },
    env,
  );
  const allowed = await app.request(
    "http://localhost/api/v1/groups",
    {
      method: "POST",
      headers: {
        cookie,
        "content-type": "application/json",
        origin: "http://localhost",
      },
      body: JSON.stringify({ name: "Allowed" }),
    },
    env,
  );

  assert.equal(blocked.status, 403);
  assert.equal(allowed.status, 201);
});

test("auth status reports setup configuration without exposing secrets", async () => {
  const { app, env } = createHarness();
  const response = await app.request(
    "https://example.downwrite.test/api/v1/auth/status",
    {},
    {
      ...env,
      AUTH_BOOTSTRAP_TOKEN: "secret",
      INSTANCE_PUBLIC_URL: "https://example.downwrite.test",
      WEBAUTHN_RP_ID: "example.downwrite.test",
      WEBAUTHN_RP_NAME: "Example Downwrite",
    },
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.authenticated, false);
  assert.deepEqual(body.configuration, {
    bootstrapTokenConfigured: true,
    instancePublicUrl: "https://example.downwrite.test",
    webauthnRpId: "example.downwrite.test",
    webauthnRpName: "Example Downwrite",
  });
  assert.equal(JSON.stringify(body).includes("secret"), false);
});

test("auth challenge creation is rate limited per identity and client", async () => {
  const storage = new MemoryStorage();
  const app = createApp({
    createStorage: () => storage,
    authService: new FakeAuthService("owner"),
  });
  const env = { DEVELOPMENT_API_TOKENS: TOKENS };

  let response;
  for (let index = 0; index < 13; index += 1) {
    response = await app.request(
      "http://localhost/api/v1/auth/passkeys/login/options",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ identityId: "owner" }),
      },
      env,
    );
  }

  assert.equal(response?.status, 429);
});

test("owner bootstrap remains available until a passkey credential exists", async () => {
  const { app, env } = createHarness();
  await createGroup(app, env);

  const statusResponse = await app.request(
    "/api/v1/auth/status",
    { headers: authHeaders("owner-token") },
    env,
  );
  const optionsResponse = await app.request(
    "http://localhost/api/v1/auth/bootstrap/options",
    {
      method: "POST",
      body: JSON.stringify({
        setupToken: "bootstrap-token",
        identityId: "owner",
        displayName: "Owner",
      }),
    },
    { ...env, AUTH_BOOTSTRAP_TOKEN: "bootstrap-token" },
  );

  assert.equal(statusResponse.status, 200);
  assert.equal((await statusResponse.json()).bootstrapRequired, true);
  assert.equal(optionsResponse.status, 200);
});

test("authenticated writers can delete a document", async () => {
  const { app, env } = createHarness();
  const group = await createGroup(app, env);
  const document = await createDocument(app, env, group.id);

  const deleteResponse = await app.request(
    `/api/v1/documents/${document.id}`,
    {
      method: "DELETE",
      headers: authHeaders("owner-token"),
    },
    env,
  );

  assert.equal(deleteResponse.status, 200);

  const readResponse = await app.request(
    `/api/v1/documents/${document.id}`,
    { headers: authHeaders("owner-token") },
    env,
  );
  const readBody = await readResponse.json();

  assert.equal(readResponse.status, 404);
  assert.deepEqual(readBody, { error: "Document not found" });
});

function createHarness() {
  const storage = new MemoryStorage();
  return {
    app: createApp({ createStorage: () => storage }),
    env: { DEVELOPMENT_API_TOKENS: TOKENS },
  };
}

async function createGroup(app, env) {
  const response = await app.request(
    "/api/v1/groups",
    {
      method: "POST",
      headers: authHeaders("owner-token"),
      body: JSON.stringify({
        name: "Downwrite",
        description: "Self-hosted Markdown",
        accentColor: "#566f5f",
      }),
    },
    env,
  );
  const body = await response.json();

  assert.equal(response.status, 201);
  return body.group;
}

async function createDocument(
  app,
  env,
  groupId,
  input = { title: "Launch notes", content: "# Ship it" },
) {
  const response = await app.request(
    `/api/v1/groups/${groupId}/documents`,
    {
      method: "POST",
      headers: authHeaders("owner-token"),
      body: JSON.stringify(input),
    },
    env,
  );
  const body = await response.json();

  assert.equal(response.status, 201);
  return body.document;
}

class FakeAuthService {
  #identityId;

  constructor(identityId) {
    this.#identityId = identityId;
  }

  async beginOwnerBootstrap() {
    return { challengeId: "fake", options: { challenge: "fake" } };
  }

  async finishOwnerBootstrap({ storage }) {
    return this.#session(storage);
  }

  async beginLogin() {
    return { challengeId: "fake", options: { challenge: "fake" } };
  }

  async finishLogin({ storage }) {
    return this.#session(storage);
  }

  async logout({ storage, sessionToken }) {
    if (sessionToken) {
      await storage.deleteSessionByTokenHash(
        await sha256Base64Url(sessionToken),
      );
    }
  }

  async #session(storage) {
    const token = "test-session-token";
    const expiresAt = new Date(Date.now() + 86_400_000).toISOString();
    const session = await storage.createSession({
      identityId: this.#identityId,
      tokenHash: await sha256Base64Url(token),
      expiresAt,
    });

    return {
      identityId: this.#identityId,
      session,
      cookie: `dw_session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax`,
    };
  }
}

function authHeaders(token) {
  return {
    authorization: `Bearer ${token}`,
    "content-type": "application/json",
  };
}

function normalizeHonoPath(path) {
  return path.replace(/:([A-Za-z0-9_]+)/g, "{$1}");
}

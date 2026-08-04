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
    "OAuth 2.1 authorization code with PKCE for external clients",
  );
  assert.equal(
    body.auth.web,
    "passkeys-webauthn-http-only-server-side-session",
  );
  assert.equal(body.auth.native.pkce, true);
  assert.equal(body.auth.native.browserSignInRequired, true);
  assert.equal(body.auth.native.status, "implemented");
  assert.equal(
    body.auth.native.protectedResourceMetadataUrl,
    "https://example.downwrite.test/.well-known/oauth-protected-resource",
  );
  assert.equal(
    body.auth.native.authorizationServerMetadataUrl,
    "https://example.downwrite.test/.well-known/oauth-authorization-server",
  );
  assert.equal(
    body.auth.native.resource,
    "https://example.downwrite.test/api/v1",
  );
  assert.equal(body.clients.mcp.resource, "https://example.downwrite.test/mcp");
});

test("OAuth metadata is public and advertises instance-local PKCE clients", async () => {
  const { app, env } = createHarness();
  const resourceResponse = await app.request(
    "https://example.downwrite.test/.well-known/oauth-protected-resource",
    {},
    env,
  );
  const resourceBody = await resourceResponse.json();
  const serverResponse = await app.request(
    "https://example.downwrite.test/.well-known/oauth-authorization-server",
    {},
    env,
  );
  const serverBody = await serverResponse.json();

  assert.equal(resourceResponse.status, 200);
  assert.equal(resourceBody.resource, "https://example.downwrite.test/mcp");
  assert.deepEqual(resourceBody.authorization_servers, [
    "https://example.downwrite.test",
  ]);
  assert.equal(resourceBody.scopes_supported.includes("documents:write"), true);
  assert.equal(resourceBody.bearer_methods_supported.includes("header"), true);
  assert.equal(JSON.stringify(resourceBody).includes("owner-token"), false);
  assert.equal(
    resourceBody["x-downwrite-token-model"],
    "instance-local-opaque-bearer-tokens",
  );

  assert.equal(serverResponse.status, 200);
  assert.equal(serverBody.issuer, "https://example.downwrite.test");
  assert.equal(
    serverBody.authorization_endpoint,
    "https://example.downwrite.test/oauth/authorize",
  );
  assert.equal(
    serverBody.token_endpoint,
    "https://example.downwrite.test/oauth/token",
  );
  assert.equal(
    serverBody.revocation_endpoint,
    "https://example.downwrite.test/oauth/revoke",
  );
  assert.equal(
    serverBody.code_challenge_methods_supported.includes("S256"),
    true,
  );
  assert.equal(serverBody["x-downwrite-status"], "implemented");
  assert.equal(
    serverBody.grant_types_supported.includes("refresh_token"),
    true,
  );
  assert.equal(
    serverBody["x-downwrite-public-clients"].some(
      (client) => client.clientId === "downwrite-ios",
    ),
    true,
  );
  assert.equal(JSON.stringify(serverBody).includes("owner-token"), false);
});

test("OAuth authorization code with PKCE issues scoped bearer tokens", async () => {
  const { app, env, storage } = createHarness();
  const group = await createGroup(app, env);
  const cookie = await createSessionCookie(storage, "dev-owner");
  const token = await oauthToken(app, env, cookie, {
    scope: "workspaces:read documents:read",
  });

  const listResponse = await app.request(
    "https://example.downwrite.test/api/v1/groups",
    { headers: authHeaders(token.access_token) },
    env,
  );
  const createResponse = await app.request(
    "https://example.downwrite.test/api/v1/groups",
    {
      method: "POST",
      headers: authHeaders(token.access_token),
      body: JSON.stringify({ name: "Blocked by scope" }),
    },
    env,
  );

  assert.equal(token.token_type, "Bearer");
  assert.equal(token.scope, "workspaces:read documents:read");
  assert.equal(token.resource, "https://example.downwrite.test/api/v1");
  assert.equal(listResponse.status, 200);
  assert.equal((await listResponse.json()).groups[0].id, group.id);
  assert.equal(createResponse.status, 403);
  assert.equal((await createResponse.json()).code, "forbidden");
});

test("OAuth refresh rotates tokens and revoke invalidates access", async () => {
  const { app, env, storage } = createHarness();
  await createGroup(app, env);
  const cookie = await createSessionCookie(storage, "dev-owner");
  const first = await oauthToken(app, env, cookie, {
    scope: "workspaces:read",
  });
  const refreshResponse = await app.request(
    "https://example.downwrite.test/oauth/token",
    {
      method: "POST",
      headers: formHeaders(),
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: "downwrite-mcp",
        refresh_token: first.refresh_token,
      }),
    },
    env,
  );
  const refreshed = await refreshResponse.json();
  const reusedResponse = await app.request(
    "https://example.downwrite.test/oauth/token",
    {
      method: "POST",
      headers: formHeaders(),
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: "downwrite-mcp",
        refresh_token: first.refresh_token,
      }),
    },
    env,
  );
  const revokeResponse = await app.request(
    "https://example.downwrite.test/oauth/revoke",
    {
      method: "POST",
      headers: formHeaders(),
      body: new URLSearchParams({ token: refreshed.access_token }),
    },
    env,
  );
  const readResponse = await app.request(
    "https://example.downwrite.test/api/v1/groups",
    { headers: authHeaders(refreshed.access_token) },
    env,
  );

  assert.equal(refreshResponse.status, 200);
  assert.equal(refreshed.access_token !== first.access_token, true);
  assert.equal(reusedResponse.status, 400);
  assert.equal(revokeResponse.status, 200);
  assert.equal(readResponse.status, 401);
});

test("OAuth bearer tokens are rejected for the wrong instance resource", async () => {
  const { app, env, storage } = createHarness();
  const accessToken = `wrong-resource-${crypto.randomUUID()}`;
  await storage.ensureIdentity({
    identityId: "dev-owner",
    displayName: "Development Owner",
  });
  await storage.createOAuthAccessToken({
    tokenHash: await sha256Base64Url(accessToken),
    identityId: "dev-owner",
    clientId: "downwrite-mcp",
    scopes: ["workspaces:read"],
    resource: "https://other.downwrite.test/api/v1",
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
  });

  const response = await app.request(
    "https://example.downwrite.test/api/v1/groups",
    { headers: authHeaders(accessToken) },
    env,
  );
  const body = await response.json();

  assert.equal(response.status, 401);
  assert.equal(body.code, "unauthorized");
});

test("MCP accepts only OAuth tokens with the MCP resource and document scope", async () => {
  const { app, env, storage } = createHarness();
  const group = await createGroup(app, env);
  await createDocument(app, env, group.id);
  const cookie = await createSessionCookie(storage, "dev-owner");
  const apiToken = await oauthToken(app, env, cookie, {
    scope: "workspaces:read documents:read",
    resource: "https://example.downwrite.test/api/v1",
  });
  const wrongScopeToken = `wrong-mcp-scope-${crypto.randomUUID()}`;
  await storage.createOAuthAccessToken({
    tokenHash: await sha256Base64Url(wrongScopeToken),
    identityId: "dev-owner",
    clientId: "downwrite-mcp",
    scopes: ["workspaces:read"],
    resource: "https://example.downwrite.test/mcp",
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
  });
  const mcpToken = await oauthToken(app, env, cookie, {
    scope: "mcp:documents",
    resource: "https://example.downwrite.test/mcp",
    state: "mcp-state",
  });

  const wrongAudience = await mcpToolResponseWithToken(
    app,
    env,
    apiToken.access_token,
    "list_workspaces",
    {},
  );
  const insufficientScope = await mcpToolResponseWithToken(
    app,
    env,
    wrongScopeToken,
    "list_workspaces",
    {},
  );
  const allowed = await mcpToolWithToken(
    app,
    env,
    mcpToken.access_token,
    "list_workspaces",
    {},
  );

  assert.equal(wrongAudience.status, 401);
  assert.equal((await wrongAudience.response.json()).code, "unauthorized");
  assert.equal(insufficientScope.status, 403);
  assert.equal((await insufficientScope.response.json()).code, "forbidden");
  assert.equal(allowed.workspaces[0].id, group.id);
});

test("MCP endpoint challenges unauthenticated clients with resource metadata", async () => {
  const { app, env } = createHarness();
  const response = await app.request(
    "https://example.downwrite.test/mcp",
    {
      method: "POST",
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/list",
      }),
    },
    env,
  );
  const body = await response.json();

  assert.equal(response.status, 401);
  assert.equal(body.code, "unauthorized");
  assert.match(
    response.headers.get("www-authenticate") ?? "",
    /resource_metadata="https:\/\/example\.downwrite\.test\/\.well-known\/oauth-protected-resource"/,
  );
  assert.match(response.headers.get("www-authenticate") ?? "", /mcp:documents/);
});

test("MCP tools use derived local identity for document reads and writes", async () => {
  const { app, env } = createHarness();
  const group = await createGroup(app, env);
  const document = await createDocument(app, env, group.id);

  const tools = await mcpCall(app, env, "tools/list", undefined);
  const workspaces = await mcpTool(app, env, "list_workspaces", {});
  const documents = await mcpTool(app, env, "list_documents", {
    groupId: group.id,
  });
  const read = await mcpTool(app, env, "read_document", {
    documentId: document.id,
  });
  const created = await mcpTool(app, env, "create_document", {
    groupId: group.id,
    title: "MCP draft",
    content: "# MCP",
  });
  const updated = await mcpTool(app, env, "update_document", {
    documentId: document.id,
    content: "# Updated through MCP",
    baseRevision: document.revision,
  });
  const stale = await mcpToolResponse(app, env, "update_document", {
    documentId: document.id,
    content: "stale",
    baseRevision: document.revision,
  });
  const missingPrecondition = await mcpToolResponse(
    app,
    env,
    "update_document",
    {
      documentId: document.id,
      content: "missing precondition",
    },
  );

  assert.equal(tools.result.tools.length, 5);
  assert.equal(workspaces.workspaces[0].id, group.id);
  assert.equal(workspaces.workspaces[0].documentCount, 1);
  assert.equal(documents.documents[0].id, document.id);
  assert.equal(read.document.content, "# Ship it");
  assert.equal(created.document.title, "MCP draft");
  assert.equal(updated.document.content, "# Updated through MCP");
  assert.equal(stale.error.data.code, "conflict");
  assert.equal(missingPrecondition.error.data.code, "precondition_required");
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
  assert.ok(body.components.schemas.OAuthProtectedResourceMetadata);
  assert.ok(body.components.securitySchemes.sessionCookie);
  assert.ok(body.components.securitySchemes.developmentBearer);
  assert.ok(body.components.securitySchemes.oauthPkce);
  assert.equal(
    body.paths["/oauth/authorize"].get["x-downwrite-status"],
    "implemented",
  );
  assert.equal(
    body.paths["/oauth/authorize/approve"].post["x-downwrite-status"],
    "implemented",
  );
  assert.equal(
    body.paths["/oauth/token"].post["x-downwrite-status"],
    "implemented",
  );
  assert.equal(
    body.paths["/oauth/revoke"].post["x-downwrite-status"],
    "implemented",
  );
  assert.equal(
    body.paths["/.well-known/oauth-protected-resource"].get.operationId,
    "getOAuthProtectedResourceMetadata",
  );
  assert.equal(body.paths["/mcp"].post.operationId, "invokeMcp");
  assert.equal(
    body.paths["/api/v1/auth/development/session"].post.operationId,
    "createDevelopmentSession",
  );
  assert.equal(body.paths["/mcp"].post["x-downwrite-scope"], "mcp:documents");
  assert.equal(
    body["x-downwrite-client-contract"].errors.envelope,
    "{ error: string, code: string, status: number }",
  );
  assert.equal(
    body["x-downwrite-client-contract"].externalAuth.pkceRequired,
    true,
  );
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

test("document writes require explicit revision preconditions", async () => {
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

  const update = await app.request(
    `/api/v1/documents/${document.id}`,
    {
      method: "PATCH",
      headers: authHeaders("owner-token"),
      body: JSON.stringify({ title: "No revision" }),
    },
    env,
  );
  const move = await app.request(
    `/api/v1/documents/${document.id}/move`,
    {
      method: "PATCH",
      headers: authHeaders("owner-token"),
      body: JSON.stringify({ groupId: target.id }),
    },
    env,
  );
  const position = await app.request(
    `/api/v1/documents/${document.id}/position`,
    {
      method: "PATCH",
      headers: authHeaders("owner-token"),
      body: JSON.stringify({ position: 10 }),
    },
    env,
  );
  const current = await app.request(
    `/api/v1/documents/${document.id}`,
    { headers: authHeaders("owner-token") },
    env,
  );
  const currentBody = await current.json();

  assert.equal(update.status, 428);
  assert.equal((await update.json()).code, "precondition_required");
  assert.equal(move.status, 428);
  assert.equal(position.status, 428);
  assert.equal(currentBody.document.title, document.title);
  assert.equal(currentBody.document.groupId, source.id);
  assert.equal(currentBody.document.position, document.position);
  assert.equal(currentBody.document.revision, document.revision);
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

test("clients can fetch focused workspace detail and document list", async () => {
  const { app, env } = createHarness();
  const group = await createGroup(app, env);
  const document = await createDocument(app, env, group.id);

  const detailResponse = await app.request(
    `/api/v1/groups/${group.id}`,
    { headers: authHeaders("owner-token") },
    env,
  );
  const documentsResponse = await app.request(
    `/api/v1/groups/${group.id}/documents`,
    { headers: authHeaders("owner-token") },
    env,
  );
  const deniedResponse = await app.request(
    `/api/v1/groups/${group.id}`,
    { headers: authHeaders("outsider-token") },
    env,
  );
  const detail = await detailResponse.json();
  const documents = await documentsResponse.json();

  assert.equal(detailResponse.status, 200);
  assert.equal(detail.group.id, group.id);
  assert.equal(detail.group.documents[0].id, document.id);
  assert.equal(documentsResponse.status, 200);
  assert.deepEqual(documents.documents, detail.group.documents);
  assert.equal(deniedResponse.status, 404);
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

  const readBody = await readResponse.json();
  assert.equal(readBody.error, "Missing session or bearer token");
  assert.equal(readBody.code, "unauthorized");
  assert.equal(readBody.status, 401);
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
      body: JSON.stringify({
        content: "edited by invite",
        baseRevision: document.revision,
      }),
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

  const previewResponse = await app.request(
    `/api/v1/invitations/${inviteBody.invitation.token}`,
    {},
    env,
  );
  const previewBody = await previewResponse.json();

  assert.equal(previewResponse.status, 200);
  assert.equal(previewBody.invitation.document.title, document.title);
  assert.equal(previewBody.invitation.invitedIdentityId, "dev-editor");

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
      body: JSON.stringify({
        content: "accepted invite edit",
        baseRevision: document.revision,
      }),
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

test("collaborators can self-remove but the final owner is protected", async () => {
  const { app, env } = createHarness();
  const group = await createGroup(app, env);
  const document = await createDocument(app, env, group.id);

  const removeOnlyOwner = await app.request(
    `/api/v1/documents/${document.id}/collaborators/dev-owner`,
    {
      method: "DELETE",
      headers: authHeaders("owner-token"),
    },
    env,
  );

  await app.request(
    `/api/v1/documents/${document.id}/collaborators`,
    {
      method: "POST",
      headers: authHeaders("owner-token"),
      body: JSON.stringify({ identityId: "dev-editor", role: "editor" }),
    },
    env,
  );
  const editorSelfRemoval = await app.request(
    `/api/v1/documents/${document.id}/collaborators/dev-editor`,
    {
      method: "DELETE",
      headers: authHeaders("editor-token"),
    },
    env,
  );

  assert.equal(removeOnlyOwner.status, 403);
  assert.equal(editorSelfRemoval.status, 200);
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

test("owners can inspect one managed public link without affecting anonymous reads", async () => {
  const { app, env } = createHarness();
  const group = await createGroup(app, env);
  const document = await createDocument(app, env, group.id);

  const linkResponse = await app.request(
    `/api/v1/documents/${document.id}/public-links`,
    {
      method: "POST",
      headers: authHeaders("owner-token"),
      body: JSON.stringify({ label: "Managed" }),
    },
    env,
  );
  const link = (await linkResponse.json()).publicLink;
  const manageResponse = await app.request(
    `/api/v1/public-links/${link.id}/manage`,
    { headers: authHeaders("owner-token") },
    env,
  );
  const publicResponse = await app.request(
    `/api/v1/public-links/${link.token}`,
    {},
    env,
  );

  assert.equal(manageResponse.status, 200);
  assert.equal((await manageResponse.json()).publicLink.id, link.id);
  assert.equal(publicResponse.status, 200);
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

test("local development session is localhost-only and creates a normal session", async () => {
  const { app, env } = createHarness();
  const blocked = await app.request(
    "https://example.downwrite.test/api/v1/auth/development/session",
    {
      method: "POST",
      body: JSON.stringify({ identityId: "local-owner" }),
    },
    { ...env, DOWNWRITE_LOCAL_AUTH: "1" },
  );
  const disabled = await app.request(
    "http://localhost/api/v1/auth/development/session",
    {
      method: "POST",
      body: JSON.stringify({ identityId: "local-owner" }),
    },
    env,
  );
  const sessionResponse = await app.request(
    "http://localhost/api/v1/auth/development/session",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        identityId: "local-owner",
        displayName: "Local Owner",
      }),
    },
    { ...env, DOWNWRITE_LOCAL_AUTH: "1" },
  );
  const cookie = sessionResponse.headers.get("set-cookie");
  const groupResponse = await app.request(
    "http://localhost/api/v1/groups",
    {
      method: "POST",
      headers: {
        cookie,
        "content-type": "application/json",
        origin: "http://localhost",
      },
      body: JSON.stringify({ name: "Local workspace" }),
    },
    env,
  );
  const group = (await groupResponse.json()).group;
  const documentResponse = await app.request(
    `http://localhost/api/v1/groups/${group.id}/documents`,
    {
      method: "POST",
      headers: {
        cookie,
        "content-type": "application/json",
        origin: "http://localhost",
      },
      body: JSON.stringify({ title: "Local note", content: "# Local" }),
    },
    env,
  );

  assert.equal(blocked.status, 404);
  assert.equal(disabled.status, 404);
  assert.equal(sessionResponse.status, 200);
  assert.match(cookie, /dw_session=/);
  assert.equal(groupResponse.status, 201);
  assert.equal(documentResponse.status, 201);
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
    localDevelopmentAuthEnabled: false,
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
  assert.deepEqual(readBody, {
    error: "Document not found",
    code: "not_found",
    status: 404,
  });
});

function createHarness() {
  const storage = new MemoryStorage();
  return {
    app: createApp({ createStorage: () => storage }),
    env: { DEVELOPMENT_API_TOKENS: TOKENS },
    storage,
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

function formHeaders(extra = {}) {
  return {
    "content-type": "application/x-www-form-urlencoded",
    ...extra,
  };
}

async function createSessionCookie(storage, identityId) {
  await storage.ensureIdentity({ identityId, displayName: identityId });
  const token = `session-${identityId}-${crypto.randomUUID()}`;
  const expiresAt = new Date(Date.now() + 86_400_000).toISOString();
  await storage.createSession({
    identityId,
    tokenHash: await sha256Base64Url(token),
    expiresAt,
  });
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
  assert.match(consentHtml, /Authorize downwrite-mcp/i);

  const approve = await app.request(
    "https://example.downwrite.test/oauth/authorize/approve",
    {
      method: "POST",
      headers: formHeaders({
        cookie,
        origin: "https://example.downwrite.test",
      }),
      body: new URLSearchParams({
        client_id: "downwrite-mcp",
        redirect_uri: "http://127.0.0.1:49152/callback",
        code_challenge: challenge,
        code_challenge_method: "S256",
        scope,
        resource,
        state,
      }),
    },
    env,
  );
  const location = approve.headers.get("location");
  const redirect = new URL(location);
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

async function mcpCall(app, env, method, params) {
  return mcpCallWithToken(app, env, "owner-token", method, params);
}

async function mcpCallWithToken(app, env, token, method, params) {
  const response = await app.request(
    "https://example.downwrite.test/mcp",
    {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "request-id",
        method,
        ...(typeof params === "undefined" ? {} : { params }),
      }),
    },
    env,
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  return body;
}

async function mcpToolResponse(app, env, name, args) {
  return mcpCall(app, env, "tools/call", {
    name,
    arguments: args,
  });
}

async function mcpTool(app, env, name, args) {
  const body = await mcpToolResponse(app, env, name, args);
  assert.equal(body.error, undefined);
  return JSON.parse(body.result.content[0].text);
}

async function mcpToolResponseWithToken(app, env, token, name, args) {
  const response = await app.request(
    "https://example.downwrite.test/mcp",
    {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "request-id",
        method: "tools/call",
        params: {
          name,
          arguments: args,
        },
      }),
    },
    env,
  );

  return { status: response.status, response };
}

async function mcpToolWithToken(app, env, token, name, args) {
  const body = await mcpCallWithToken(app, env, token, "tools/call", {
    name,
    arguments: args,
  });
  assert.equal(body.error, undefined);
  return JSON.parse(body.result.content[0].text);
}

function normalizeHonoPath(path) {
  return path.replace(/:([A-Za-z0-9_]+)/g, "{$1}");
}

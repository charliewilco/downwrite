import { Hono } from "hono";
import {
  WebAuthnAuthService,
  createSession,
  type AuthService,
} from "./auth.js";
import {
  HttpError,
  jsonError,
  optionalBoolean,
  optionalNumber,
  optionalString,
  optionalText,
  readJsonObject,
  requireString,
} from "./http.js";
import {
  clearSessionCookie,
  readIdentity,
  readSessionCookie,
} from "./identity.js";
import {
  assertSameOriginForSessionWrites,
  assertLocalDevelopmentAuth,
  authConfiguration,
  enforceRateLimit,
  securityHeaders,
} from "./security.js";
import { createOpaqueToken } from "./domain/tokens.js";
import { handleMcpRequest } from "./mcp.js";
import {
  OAUTH_SCOPES,
  assertScope,
  exchangeToken,
  oauthClientPolicy,
  approveAuthorizationRequest,
  renderAuthorizationPage,
  revokeToken,
} from "./oauth.js";
import { createOpenApiDocument, createOpenApiHtml } from "./openapi.js";
import { D1Storage } from "./storage/d1.js";
import type { Env, Role, Storage } from "./types.js";

type AppBindings = { Bindings: Env };
type StorageFactory = (env: Env) => Storage;

const VALID_ROLES = new Set<Role>(["owner", "editor"]);
export interface AppOptions {
  createStorage?: StorageFactory;
  authService?: AuthService;
}

export function createApp(options: AppOptions = {}) {
  const app = new Hono<AppBindings>();
  const createStorage =
    options.createStorage ?? ((env) => new D1Storage(env.DB, env.CONTENT));
  const authService = options.authService ?? new WebAuthnAuthService();

  function storage(env: Env) {
    return createStorage(env);
  }

  function assertCurrentRevision(
    current: { revision: number },
    body: Record<string, unknown>,
  ) {
    const baseRevision = optionalNumber(body, "baseRevision");
    if (
      typeof baseRevision !== "undefined" &&
      Math.trunc(baseRevision) !== current.revision
    ) {
      throw new HttpError(409, "Document has changed since it was loaded");
    }
  }

  function canWrite(role: Role) {
    return role === "owner" || role === "editor";
  }

  app.onError((error, c) => jsonError(c, error));

  app.notFound((c) => jsonError(c, new HttpError(404, "Not found")));

  app.use("*", securityHeaders);
  app.use("*", async (c, next) => {
    assertSameOriginForSessionWrites(c);
    await next();
  });

  function discovery(url: string) {
    const instanceUrl = new URL(url).origin;

    return {
      name: "downwrite-api",
      instanceUrl,
      api: {
        currentVersion: "v1",
        supportedVersions: ["v1"],
        baseUrl: `${instanceUrl}/api/v1`,
        basePath: "/api/v1",
        discoveryUrl: `${instanceUrl}/.well-known/downwrite`,
        openApiUrl: `${instanceUrl}/api/v1/openapi.json`,
        documentationUrl: `${instanceUrl}/api/v1/docs`,
      },
      auth: {
        current: "passkeys-webauthn-session-and-oauth-pkce",
        futureBoundary:
          "OAuth 2.1 authorization code with PKCE for external clients",
        web: "passkeys-webauthn-http-only-server-side-session",
        native: {
          status: "implemented",
          authorizationEndpoint: `${instanceUrl}/oauth/authorize`,
          tokenEndpoint: `${instanceUrl}/oauth/token`,
          revocationEndpoint: `${instanceUrl}/oauth/revoke`,
          protectedResourceMetadataUrl: `${instanceUrl}/.well-known/oauth-protected-resource`,
          authorizationServerMetadataUrl: `${instanceUrl}/.well-known/oauth-authorization-server`,
          resource: `${instanceUrl}/api/v1`,
          scopesSupported: OAUTH_SCOPES,
          grant: "authorization_code",
          pkce: true,
          browserSignInRequired: true,
          publicClients: oauthClientPolicy(),
        },
      },
      clients: {
        native: {
          publicIosAppSupported: true,
          deploymentSpecificIosAppRequired: false,
        },
        mcp: {
          supportedAsExternalClient: true,
          privilegedBackdoor: false,
          expectedTools: [
            "list_workspaces",
            "list_documents",
            "read_document",
            "create_document",
            "update_document",
          ],
        },
      },
    };
  }

  function oauthProtectedResourceMetadata(url: string) {
    const instanceUrl = new URL(url).origin;

    return {
      resource: `${instanceUrl}/api/v1`,
      authorization_servers: [instanceUrl],
      scopes_supported: OAUTH_SCOPES,
      bearer_methods_supported: ["header"],
      resource_documentation: `${instanceUrl}/api/v1/docs`,
      "x-downwrite-status": "resource-server-metadata-implemented",
      "x-downwrite-token-model": "instance-local-opaque-bearer-tokens",
    };
  }

  function oauthAuthorizationServerMetadata(url: string) {
    const instanceUrl = new URL(url).origin;

    return {
      issuer: instanceUrl,
      authorization_endpoint: `${instanceUrl}/oauth/authorize`,
      token_endpoint: `${instanceUrl}/oauth/token`,
      revocation_endpoint: `${instanceUrl}/oauth/revoke`,
      response_types_supported: ["code"],
      grant_types_supported: ["authorization_code", "refresh_token"],
      code_challenge_methods_supported: ["S256"],
      token_endpoint_auth_methods_supported: ["none"],
      revocation_endpoint_auth_methods_supported: ["none"],
      scopes_supported: OAUTH_SCOPES,
      "x-downwrite-status": "implemented",
      "x-downwrite-public-clients": oauthClientPolicy(),
      "x-downwrite-resource-indicators-required": true,
      "x-downwrite-note":
        "OAuth credentials are issued by this self-hosted instance only.",
    };
  }

  app.get("/api/v1/health", (c) =>
    c.json({
      ok: true,
      name: "downwrite-api",
      version: "v1",
    }),
  );

  app.get("/api/v1/openapi.json", (c) =>
    c.json(createOpenApiDocument(c.req.url)),
  );

  app.get("/api/v1/docs", (c) =>
    c.html(createOpenApiHtml(c.req.url), 200, {
      "content-type": "text/html; charset=utf-8",
    }),
  );

  app.get("/api/v1/discovery", (c) => c.json(discovery(c.req.url)));

  app.get("/.well-known/downwrite", (c) => c.json(discovery(c.req.url)));

  app.get("/.well-known/oauth-protected-resource", (c) =>
    c.json(oauthProtectedResourceMetadata(c.req.url)),
  );

  app.get("/.well-known/oauth-authorization-server", (c) =>
    c.json(oauthAuthorizationServerMetadata(c.req.url)),
  );

  app.get("/oauth/authorize", async (c) =>
    renderAuthorizationPage({ c, storage: storage(c.env) }),
  );

  app.post("/oauth/authorize/approve", async (c) =>
    approveAuthorizationRequest({ c, storage: storage(c.env) }),
  );

  app.post("/oauth/token", async (c) =>
    exchangeToken({ c, storage: storage(c.env) }),
  );

  app.post("/oauth/revoke", async (c) =>
    revokeToken({ c, storage: storage(c.env) }),
  );

  app.post("/mcp", async (c) => handleMcpRequest(c, storage(c.env)));

  app.get("/api/v1/auth/status", async (c) => {
    const store = storage(c.env);
    const bootstrapRequired = !(await store.hasAnyIdentity());
    const configuration = authConfiguration(c.env, c.req.url);

    try {
      const identity = await readIdentity(c, store);
      return c.json({
        authenticated: true,
        identity,
        bootstrapRequired,
        configuration,
      });
    } catch {
      return c.json({ authenticated: false, bootstrapRequired, configuration });
    }
  });

  app.post("/api/v1/auth/development/session", async (c) => {
    assertLocalDevelopmentAuth(c);
    const store = storage(c.env);
    const body = await readJsonObject(c).catch(() => ({}));
    const identityId = optionalString(body, "identityId") ?? "local-owner";
    const displayName = optionalString(body, "displayName") ?? "Local Owner";
    const identity = await store.ensureIdentity({ identityId, displayName });
    const session = await createSession(store, identity.id, c.req.url);

    c.header("set-cookie", session.cookie);
    return c.json({ ok: true, identity: { id: identity.id } });
  });

  app.post("/api/v1/auth/bootstrap/options", async (c) => {
    const store = storage(c.env);
    const body = await readJsonObject(c);
    const identityId = requireString(body, "identityId");
    await enforceRateLimit({
      c,
      storage: store,
      purpose: "bootstrap",
      subject: identityId,
      limit: 8,
      windowSeconds: 300,
    });
    const result = await authService.beginOwnerBootstrap({
      env: c.env,
      storage: store,
      requestUrl: c.req.url,
      setupToken: requireString(body, "setupToken"),
      identityId,
      displayName: requireString(body, "displayName"),
    });

    return c.json(result);
  });

  app.post("/api/v1/auth/bootstrap/verify", async (c) => {
    const body = await readJsonObject(c);
    const session = await authService.finishOwnerBootstrap({
      env: c.env,
      storage: storage(c.env),
      requestUrl: c.req.url,
      setupToken: requireString(body, "setupToken"),
      challengeId: requireString(body, "challengeId"),
      response: body.response as never,
    });

    c.header("set-cookie", session.cookie);
    return c.json({ ok: true, identity: { id: session.identityId } });
  });

  app.post("/api/v1/auth/passkeys/login/options", async (c) => {
    const store = storage(c.env);
    const body = await readJsonObject(c);
    const identityId = requireString(body, "identityId");
    await enforceRateLimit({
      c,
      storage: store,
      purpose: "login",
      subject: identityId,
      limit: 12,
      windowSeconds: 300,
    });
    const result = await authService.beginLogin({
      env: c.env,
      storage: store,
      requestUrl: c.req.url,
      identityId,
    });

    return c.json(result);
  });

  app.post("/api/v1/auth/passkeys/login/verify", async (c) => {
    const body = await readJsonObject(c);
    const session = await authService.finishLogin({
      env: c.env,
      storage: storage(c.env),
      requestUrl: c.req.url,
      challengeId: requireString(body, "challengeId"),
      response: body.response as never,
    });

    c.header("set-cookie", session.cookie);
    return c.json({ ok: true, identity: { id: session.identityId } });
  });

  app.delete("/api/v1/auth/session", async (c) => {
    await authService.logout({
      storage: storage(c.env),
      sessionToken: readSessionCookie(c.req.header("cookie") ?? ""),
    });
    c.header("set-cookie", clearSessionCookie(c.req.url));
    return c.json({ ok: true });
  });

  app.get("/api/v1/groups", async (c) => {
    const store = storage(c.env);
    const identity = await readIdentity(c, store);
    assertScope(identity, "workspaces:read");
    const groups = await store.listGroupsForIdentity(identity.id);

    return c.json({ groups });
  });

  app.get("/api/v1/groups/:groupId", async (c) => {
    const store = storage(c.env);
    const identity = await readIdentity(c, store);
    assertScope(identity, "workspaces:read");
    const group = await store.getGroupForIdentity({
      identityId: identity.id,
      groupId: c.req.param("groupId"),
    });

    if (!group) {
      throw new HttpError(404, "Workspace not found");
    }

    return c.json({ group });
  });

  app.post("/api/v1/groups", async (c) => {
    const store = storage(c.env);
    const identity = await readIdentity(c, store);
    assertScope(identity, "workspaces:write");
    const body = await readJsonObject(c);
    const name = requireString(body, "name", "Untitled Group");
    const group = await store.createGroup({
      identityId: identity.id,
      name,
      description: optionalString(body, "description"),
      accentColor: optionalString(body, "accentColor"),
    });

    return c.json({ group }, 201);
  });

  app.patch("/api/v1/groups/:groupId", async (c) => {
    const store = storage(c.env);
    const identity = await readIdentity(c, store);
    assertScope(identity, "workspaces:write");
    const body = await readJsonObject(c);
    const group = await store.updateGroup({
      identityId: identity.id,
      groupId: c.req.param("groupId"),
      name: optionalString(body, "name") ?? undefined,
      description:
        "description" in body ? optionalString(body, "description") : undefined,
      accentColor:
        "accentColor" in body ? optionalString(body, "accentColor") : undefined,
    });

    if (!group) {
      throw new HttpError(403, "You cannot edit this group");
    }

    return c.json({ group });
  });

  app.delete("/api/v1/groups/:groupId", async (c) => {
    const store = storage(c.env);
    const identity = await readIdentity(c, store);
    assertScope(identity, "workspaces:write");
    const deleted = await store.deleteGroup({
      identityId: identity.id,
      groupId: c.req.param("groupId"),
    });

    if (!deleted) {
      throw new HttpError(403, "You cannot delete this group");
    }

    return c.json({ ok: true });
  });

  app.post("/api/v1/groups/:groupId/documents", async (c) => {
    const store = storage(c.env);
    const identity = await readIdentity(c, store);
    assertScope(identity, "documents:write");
    const body = await readJsonObject(c);
    const document = await store.createDocument({
      identityId: identity.id,
      groupId: c.req.param("groupId"),
      title: requireString(body, "title", "Untitled Document"),
      content: optionalString(body, "content") ?? "",
    });

    if (!document) {
      throw new HttpError(403, "You cannot create documents in this group");
    }

    return c.json({ document }, 201);
  });

  app.get("/api/v1/groups/:groupId/documents", async (c) => {
    const store = storage(c.env);
    const identity = await readIdentity(c, store);
    assertScope(identity, "workspaces:read");
    const group = await store.getGroupForIdentity({
      identityId: identity.id,
      groupId: c.req.param("groupId"),
    });

    if (!group) {
      throw new HttpError(404, "Workspace not found");
    }

    return c.json({ documents: group.documents });
  });

  app.get("/api/v1/documents/:documentId", async (c) => {
    const store = storage(c.env);
    const identity = await readIdentity(c, store);
    assertScope(identity, "documents:read");
    const document = await store.getDocumentForIdentity({
      identityId: identity.id,
      documentId: c.req.param("documentId"),
    });

    if (!document) {
      throw new HttpError(404, "Document not found");
    }

    return c.json({ document });
  });

  app.patch("/api/v1/documents/:documentId", async (c) => {
    const store = storage(c.env);
    const identity = await readIdentity(c, store);
    assertScope(identity, "documents:write");
    const body = await readJsonObject(c);
    const title = optionalString(body, "title") ?? undefined;
    const content = optionalText(body, "content");
    const documentId = c.req.param("documentId");

    if (!title && typeof content === "undefined") {
      throw new HttpError(400, "Expected title or content");
    }

    const current = await store.getDocumentForIdentity({
      identityId: identity.id,
      documentId,
    });
    if (!current || !canWrite(current.role)) {
      throw new HttpError(403, "You cannot edit this document");
    }
    assertCurrentRevision(current, body);

    const document = await store.updateDocument({
      identityId: identity.id,
      documentId,
      title,
      content,
    });

    if (!document) {
      throw new HttpError(403, "You cannot edit this document");
    }

    return c.json({ document });
  });

  app.patch("/api/v1/documents/:documentId/move", async (c) => {
    const store = storage(c.env);
    const identity = await readIdentity(c, store);
    assertScope(identity, "documents:write");
    const body = await readJsonObject(c);
    const documentId = c.req.param("documentId");
    const current = await store.getDocumentForIdentity({
      identityId: identity.id,
      documentId,
    });

    if (!current || !canWrite(current.role)) {
      throw new HttpError(403, "You cannot move this document");
    }
    assertCurrentRevision(current, body);

    const document = await store.moveDocument({
      identityId: identity.id,
      documentId,
      groupId: requireString(body, "groupId"),
      position: optionalNumber(body, "position"),
    });

    if (!document) {
      throw new HttpError(403, "You cannot move this document there");
    }

    return c.json({ document });
  });

  app.patch("/api/v1/documents/:documentId/position", async (c) => {
    const store = storage(c.env);
    const identity = await readIdentity(c, store);
    assertScope(identity, "documents:write");
    const body = await readJsonObject(c);
    const position = optionalNumber(body, "position");
    const documentId = c.req.param("documentId");

    if (typeof position === "undefined") {
      throw new HttpError(400, "Expected position");
    }

    const current = await store.getDocumentForIdentity({
      identityId: identity.id,
      documentId,
    });
    if (!current || !canWrite(current.role)) {
      throw new HttpError(403, "You cannot reorder this document");
    }
    assertCurrentRevision(current, body);

    const document = await store.positionDocument({
      identityId: identity.id,
      documentId,
      position,
    });

    if (!document) {
      throw new HttpError(403, "You cannot reorder this document");
    }

    return c.json({ document });
  });

  app.delete("/api/v1/documents/:documentId", async (c) => {
    const store = storage(c.env);
    const identity = await readIdentity(c, store);
    assertScope(identity, "documents:write");
    const deleted = await store.deleteDocument({
      identityId: identity.id,
      documentId: c.req.param("documentId"),
    });

    if (!deleted) {
      throw new HttpError(403, "You cannot delete this document");
    }

    return c.json({ ok: true });
  });

  app.post("/api/v1/documents/:documentId/collaborators", async (c) => {
    const store = storage(c.env);
    const identity = await readIdentity(c, store);
    assertScope(identity, "sharing:write");
    const body = await readJsonObject(c);
    const role = requireString(body, "role") as Role;

    if (!VALID_ROLES.has(role)) {
      throw new HttpError(400, "Role must be owner or editor");
    }

    const added = await store.addDocumentCollaborator({
      identityId: identity.id,
      documentId: c.req.param("documentId"),
      collaboratorIdentityId: requireString(body, "identityId"),
      role,
    });

    if (!added) {
      throw new HttpError(403, "You cannot add this collaborator");
    }

    return c.json({ ok: true });
  });

  app.delete(
    "/api/v1/documents/:documentId/collaborators/:identityId",
    async (c) => {
      const store = storage(c.env);
      const identity = await readIdentity(c, store);
      assertScope(identity, "sharing:write");
      const removed = await store.removeDocumentCollaborator({
        identityId: identity.id,
        documentId: c.req.param("documentId"),
        collaboratorIdentityId: c.req.param("identityId"),
      });

      if (!removed) {
        throw new HttpError(403, "You cannot remove collaborators");
      }

      return c.json({ ok: true });
    },
  );

  app.get("/api/v1/documents/:documentId/share", async (c) => {
    const store = storage(c.env);
    const identity = await readIdentity(c, store);
    assertScope(identity, "sharing:write");
    const share = await store.getDocumentShareState({
      identityId: identity.id,
      documentId: c.req.param("documentId"),
    });

    if (!share) {
      throw new HttpError(403, "You cannot manage sharing for this document");
    }

    return c.json({ share });
  });

  app.post("/api/v1/documents/:documentId/invitations", async (c) => {
    const store = storage(c.env);
    const identity = await readIdentity(c, store);
    assertScope(identity, "sharing:write");
    const body = await readJsonObject(c);
    const role = requireString(body, "role") as Role;

    if (!VALID_ROLES.has(role)) {
      throw new HttpError(400, "Role must be owner or editor");
    }

    const invitation = await store.createDocumentInvitation({
      identityId: identity.id,
      documentId: c.req.param("documentId"),
      invitedIdentityId: requireString(body, "identityId"),
      role,
      token: createOpaqueToken(),
    });

    if (!invitation) {
      throw new HttpError(403, "You cannot invite collaborators");
    }

    return c.json({ invitation }, 201);
  });

  app.post("/api/v1/invitations/:token/accept", async (c) => {
    const store = storage(c.env);
    const identity = await readIdentity(c, store);
    assertScope(identity, "sharing:write");
    const invitation = await store.acceptDocumentInvitation({
      identityId: identity.id,
      token: c.req.param("token"),
    });

    if (!invitation) {
      throw new HttpError(403, "You cannot accept this invitation");
    }

    return c.json({ invitation });
  });

  app.get("/api/v1/invitations/:token", async (c) => {
    const invitation = await storage(c.env).getDocumentInvitationByToken(
      c.req.param("token"),
    );

    if (!invitation) {
      throw new HttpError(404, "Invitation not found");
    }

    return c.json({ invitation });
  });

  app.delete("/api/v1/invitations/:invitationId", async (c) => {
    const store = storage(c.env);
    const identity = await readIdentity(c, store);
    assertScope(identity, "sharing:write");
    const revoked = await store.revokeDocumentInvitation({
      identityId: identity.id,
      invitationId: c.req.param("invitationId"),
    });

    if (!revoked) {
      throw new HttpError(403, "You cannot revoke this invitation");
    }

    return c.json({ ok: true });
  });

  app.post("/api/v1/documents/:documentId/public-links", async (c) => {
    const store = storage(c.env);
    const identity = await readIdentity(c, store);
    assertScope(identity, "sharing:write");
    const body = await readJsonObject(c);
    const publicLink = await store.createPublicLink({
      identityId: identity.id,
      documentId: c.req.param("documentId"),
      label: optionalString(body, "label"),
      token: createOpaqueToken(),
    });

    if (!publicLink) {
      throw new HttpError(403, "You cannot share this document");
    }

    return c.json({ publicLink }, 201);
  });

  app.patch("/api/v1/public-links/:publicLinkId", async (c) => {
    const store = storage(c.env);
    const identity = await readIdentity(c, store);
    assertScope(identity, "sharing:write");
    const body = await readJsonObject(c);
    const publicLink = await store.updatePublicLink({
      identityId: identity.id,
      publicLinkId: c.req.param("publicLinkId"),
      label: "label" in body ? optionalString(body, "label") : undefined,
      active: optionalBoolean(body, "active"),
    });

    if (!publicLink) {
      throw new HttpError(403, "You cannot update this public link");
    }

    return c.json({ publicLink });
  });

  app.get("/api/v1/public-links/:publicLinkId/manage", async (c) => {
    const store = storage(c.env);
    const identity = await readIdentity(c, store);
    assertScope(identity, "sharing:write");
    const publicLink = await store.getPublicLinkForIdentity({
      identityId: identity.id,
      publicLinkId: c.req.param("publicLinkId"),
    });

    if (!publicLink) {
      throw new HttpError(404, "Public link not found");
    }

    return c.json({ publicLink });
  });

  app.get("/api/v1/public-links/:token", async (c) => {
    const store = storage(c.env);
    const token = c.req.param("token");
    await enforceRateLimit({
      c,
      storage: store,
      purpose: "public-link",
      subject: token.slice(0, 8),
      limit: 120,
      windowSeconds: 60,
    });
    const document = await store.getDocumentByPublicToken(token);

    if (!document) {
      throw new HttpError(404, "Public document not found");
    }

    return c.json({ document });
  });

  return app;
}

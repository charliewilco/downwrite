type JsonSchema = Record<string, unknown>;

interface OpenApiOperation {
  tags: string[];
  summary: string;
  description?: string;
  operationId: string;
  security?: Array<Record<string, string[]>>;
  parameters?: Array<Record<string, unknown>>;
  requestBody?: Record<string, unknown>;
  responses: Record<string, unknown>;
  "x-downwrite-scope"?: string;
  "x-downwrite-status"?: "implemented" | "planned";
}

interface OpenApiDocument {
  openapi: string;
  info: Record<string, unknown>;
  servers: Array<Record<string, unknown>>;
  tags: Array<Record<string, unknown>>;
  paths: Record<string, Record<string, OpenApiOperation>>;
  components: {
    schemas: Record<string, JsonSchema>;
    securitySchemes: Record<string, Record<string, unknown>>;
    responses: Record<string, unknown>;
    parameters: Record<string, unknown>;
  };
  "x-downwrite-conventions": Record<string, unknown>;
  "x-downwrite-api-roadmap": Record<string, unknown>;
}

const API_VERSION = "v1";

export function createOpenApiDocument(requestUrl: string): OpenApiDocument {
  const origin = new URL(requestUrl).origin;

  return {
    openapi: "3.1.0",
    info: {
      title: "Downwrite Worker API",
      version: API_VERSION,
      summary: "Self-hosted Markdown workspace and sharing API.",
      description:
        "Versioned API for a self-hosted Downwrite Cloudflare Worker. The current implemented auth boundary is passkeys/WebAuthn for browser sessions plus an instance-local development bearer adapter. OAuth authorization-code-with-PKCE is documented as the planned future native-client boundary only; OAuth endpoints are not implemented in this version.",
      license: {
        name: "MIT",
      },
    },
    servers: [
      {
        url: `${origin}/api/v1`,
        description: "This self-hosted Downwrite instance.",
      },
    ],
    tags: [
      { name: "Discovery" },
      { name: "Auth" },
      { name: "Workspaces" },
      { name: "Documents" },
      { name: "Sharing" },
      { name: "Public links" },
      { name: "Contract" },
    ],
    paths: paths(origin),
    components: {
      schemas,
      securitySchemes: {
        sessionCookie: {
          type: "apiKey",
          in: "cookie",
          name: "dw_session",
          description:
            "Opaque httpOnly server-side session cookie issued after passkey login or owner bootstrap. Unsafe cookie-authenticated writes require a same-origin Origin header.",
        },
        developmentBearer: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "instance-local-development-token",
          description:
            "Instance-local development/API token from DEVELOPMENT_API_TOKENS. This is not a central Downwrite account system.",
        },
        oauthPkcePlanned: {
          type: "oauth2",
          description:
            "Planned future native-client boundary for the public iOS app. Authorization-code-with-PKCE is reserved but /oauth/authorize and /oauth/token are not implemented in v1.",
          flows: {
            authorizationCode: {
              authorizationUrl: `${origin}/oauth/authorize`,
              tokenUrl: `${origin}/oauth/token`,
              scopes: {
                "workspaces:read": "Read authorized workspaces.",
                "workspaces:write": "Create and manage authorized workspaces.",
                "documents:read": "Read authorized Markdown documents.",
                "documents:write":
                  "Create and update authorized Markdown documents.",
                "sharing:write":
                  "Manage collaborators, invitations, and public links.",
              },
            },
          },
        },
      },
      responses: {
        BadRequest: errorResponse(400, "Invalid request body or parameter."),
        Unauthorized: errorResponse(
          401,
          "Authentication is missing or invalid.",
        ),
        Forbidden: errorResponse(
          403,
          "The authenticated identity is not authorized.",
        ),
        NotFound: errorResponse(404, "The requested resource was not found."),
        TooManyRequests: errorResponse(429, "Rate limit exceeded."),
      },
      parameters: {
        groupId: pathParameter("groupId", "Workspace/group identifier."),
        documentId: pathParameter("documentId", "Document identifier."),
        identityId: pathParameter(
          "identityId",
          "Instance-local identity identifier.",
        ),
        invitationId: pathParameter("invitationId", "Invitation identifier."),
        invitationToken: pathParameter("token", "Opaque invitation token."),
        publicLinkId: pathParameter("publicLinkId", "Public-link identifier."),
        publicToken: pathParameter("token", "Opaque public-link read token."),
      },
    },
    "x-downwrite-conventions": {
      versioning:
        "All product API operations are rooted under /api/v1. Future breaking changes should add a new /api/vN base path while preserving discovery metadata.",
      pagination:
        "Current collection responses are intentionally unpaginated for the small self-hosted slice. Future list endpoints should add cursor and limit query parameters and return a nextCursor field without changing item schemas.",
      markdown:
        "Document content is UTF-8 Markdown stored as text/markdown. The API returns Markdown source, not rendered HTML. Clients are responsible for preview rendering.",
      authorization:
        "Authenticated operations accept either the passkey session cookie or the instance-local development bearer token. Public-link reads are anonymous and read-only. Owner role is required for workspace settings and sharing management; owner or editor may write documents.",
      mcp: "Future MCP tools must be normal API clients using scoped credentials. Planned mappings are list_workspaces, list_documents, read_document, create_document, and update_document; no MCP backdoor is implemented in v1.",
    },
    "x-downwrite-api-roadmap": apiRoadmap(),
  };
}

export function createOpenApiHtml(requestUrl: string) {
  const origin = new URL(requestUrl).origin;
  const specUrl = `${origin}/api/v1/openapi.json`;
  const spec = createOpenApiDocument(requestUrl);
  const rows = Object.entries(spec.paths)
    .flatMap(([path, methods]) =>
      Object.entries(methods).map(
        ([method, operation]) =>
          `<tr><td><code>${escapeHtml(method.toUpperCase())}</code></td><td><code>${escapeHtml(path)}</code></td><td>${escapeHtml(operation.summary)}</td></tr>`,
      ),
    )
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Downwrite API ${API_VERSION}</title>
    <style>
      body { margin: 0; font: 16px/1.5 system-ui, sans-serif; color: #191919; background: #f7f5f0; }
      main { width: min(100% - 32px, 1040px); margin: 0 auto; padding: 32px 0; }
      table { width: 100%; border-collapse: collapse; background: #fffefb; }
      th, td { border-bottom: 1px solid #d8d1c6; padding: 10px; text-align: left; vertical-align: top; }
      code { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; }
      a { color: #2f5f7d; }
    </style>
  </head>
  <body>
    <main>
      <h1>Downwrite API ${API_VERSION}</h1>
      <p>This local documentation view is generated from the served OpenAPI contract. Download the JSON specification at <a href="${specUrl}">${specUrl}</a>.</p>
      <p>Implemented operations appear in the OpenAPI <code>paths</code> object. Proposed endpoint gaps are documented separately under the <code>x-downwrite-api-roadmap</code> extension so future iOS and MCP needs are visible without being advertised as implemented.</p>
      <table>
        <thead><tr><th>Method</th><th>Path</th><th>Summary</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </main>
  </body>
</html>`;
}

function apiRoadmap() {
  return {
    purpose:
      "Endpoint-gap audit for keeping the Worker API as Downwrite's product core. Proposed operations are not implemented in v1 unless they also appear under paths.",
    implemented: {
      workspaceLifecycle: [
        "GET /api/v1/groups",
        "POST /api/v1/groups",
        "PATCH /api/v1/groups/{groupId}",
        "DELETE /api/v1/groups/{groupId}",
      ],
      documents: [
        "POST /api/v1/groups/{groupId}/documents",
        "GET /api/v1/documents/{documentId}",
        "PATCH /api/v1/documents/{documentId}",
        "PATCH /api/v1/documents/{documentId}/move",
        "PATCH /api/v1/documents/{documentId}/position",
        "DELETE /api/v1/documents/{documentId}",
      ],
      sharing: [
        "GET /api/v1/documents/{documentId}/share",
        "POST /api/v1/documents/{documentId}/collaborators",
        "DELETE /api/v1/documents/{documentId}/collaborators/{identityId}",
        "POST /api/v1/documents/{documentId}/invitations",
        "POST /api/v1/invitations/{token}/accept",
        "DELETE /api/v1/invitations/{invitationId}",
        "POST /api/v1/documents/{documentId}/public-links",
        "PATCH /api/v1/public-links/{publicLinkId}",
        "GET /api/v1/public-links/{token}",
      ],
      discoveryAndAuth: [
        "GET /.well-known/downwrite",
        "GET /api/v1/discovery",
        "GET /api/v1/auth/status",
        "POST /api/v1/auth/bootstrap/options",
        "POST /api/v1/auth/bootstrap/verify",
        "POST /api/v1/auth/passkeys/login/options",
        "POST /api/v1/auth/passkeys/login/verify",
        "DELETE /api/v1/auth/session",
      ],
      contract: ["GET /api/v1/openapi.json", "GET /api/v1/docs"],
    },
    proposed: {
      blocksNextInteractiveScreens: [
        "GET /api/v1/groups/{groupId}: focused workspace detail without fetching every workspace.",
        "GET /api/v1/groups/{groupId}/documents: explicit document list endpoint with future cursor pagination and ordering.",
        "GET /api/v1/invitations/{token}: preview invitation before accepting.",
        "GET /api/v1/public-links/{publicLinkId}: inspect one public link for management screens.",
      ],
      documentsAndContent: [
        "PUT /api/v1/documents/{documentId}/content: content-focused update separate from title/metadata.",
        "GET /api/v1/documents/{documentId}/revisions: list saved content revisions.",
        "GET /api/v1/documents/{documentId}/revisions/{revisionId}: read a historical Markdown revision.",
        "POST /api/v1/groups/{groupId}/imports: import Markdown files into a workspace.",
        "GET /api/v1/groups/{groupId}/export: export workspace Markdown as an archive.",
        "GET /api/v1/documents/{documentId}/export: export one Markdown document.",
      ],
      concurrency: [
        "Current document writes accept optional baseRevision and return 409 Conflict on stale revisions.",
        "Future ETag/If-Match support may be added for cache-native clients without replacing revision.",
      ],
      sharingAndRoles: [
        "GET /api/v1/groups/{groupId}/members and PATCH/DELETE member endpoints if workspace-level collaboration becomes productized.",
        "Optional viewer role if private read-only invitations become a requirement.",
        "Public-link expiration and last-used metadata if link lifecycle screens need it.",
      ],
      nativeClientAuth: [
        "GET /oauth/authorize planned for system-browser OAuth authorization code with PKCE.",
        "POST /oauth/token planned for short-lived access tokens and refresh-token rotation.",
        "GET /api/v1/me planned for native/web account profile once broad account UX exists.",
      ],
      mcpSafeOperations: [
        "Use existing/proposed list workspaces, list documents, read document, create document, update document endpoints with scoped credentials.",
        "Add narrowly scoped token issuance/revocation before exposing MCP tools.",
        "Avoid any all-instance search/list endpoint by default.",
      ],
    },
    longerTerm:
      "iOS and MCP primarily need stable discovery, OAuth/PKCE, scoped credentials, cursor pagination, conflict semantics, import/export, and document movement. They do not require a different backend or privileged route family.",
  };
}

function paths(origin: string): OpenApiDocument["paths"] {
  return {
    "/api/v1/health": {
      get: operation({
        tags: ["Discovery"],
        summary: "Check API health and version.",
        operationId: "getHealth",
        security: [],
        responses: {
          "200": jsonResponse("Health status.", "Health"),
        },
      }),
    },
    "/api/v1/discovery": {
      get: operation({
        tags: ["Discovery"],
        summary: "Read instance discovery metadata.",
        operationId: "getDiscovery",
        security: [],
        responses: {
          "200": jsonResponse("Discovery metadata.", "Discovery"),
        },
      }),
    },
    "/.well-known/downwrite": {
      get: operation({
        tags: ["Discovery"],
        summary: "Read well-known instance discovery metadata.",
        operationId: "getWellKnownDownwrite",
        security: [],
        responses: {
          "200": jsonResponse("Discovery metadata.", "Discovery"),
        },
      }),
    },
    "/api/v1/openapi.json": {
      get: operation({
        tags: ["Contract"],
        summary: "Read the OpenAPI contract for this instance.",
        operationId: "getOpenApiJson",
        security: [],
        responses: {
          "200": {
            description: "OpenAPI 3.1 JSON document.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  additionalProperties: true,
                },
              },
            },
          },
        },
      }),
    },
    "/api/v1/docs": {
      get: operation({
        tags: ["Contract"],
        summary: "Read a local human-oriented API documentation view.",
        operationId: "getApiDocs",
        security: [],
        responses: {
          "200": {
            description: "HTML documentation view.",
            content: {
              "text/html": {
                schema: { type: "string" },
              },
            },
          },
        },
      }),
    },
    "/api/v1/auth/status": {
      get: operation({
        tags: ["Auth"],
        summary: "Read current authentication and setup status.",
        operationId: "getAuthStatus",
        security: [sessionSecurity(), bearerSecurity(), {}],
        "x-downwrite-scope": "auth:read",
        responses: {
          "200": jsonResponse("Authentication status.", "AuthStatus"),
        },
      }),
    },
    "/api/v1/auth/bootstrap/options": {
      post: operation({
        tags: ["Auth"],
        summary: "Begin one-time owner passkey bootstrap.",
        operationId: "beginOwnerBootstrap",
        security: [],
        "x-downwrite-scope": "auth:bootstrap",
        requestBody: jsonRequest("BootstrapOptionsRequest"),
        responses: {
          "200": jsonResponse(
            "WebAuthn registration options.",
            "WebAuthnOptions",
          ),
          "401": refResponse("Unauthorized"),
          "409": errorResponse(409, "Owner bootstrap has already completed."),
          "429": refResponse("TooManyRequests"),
        },
      }),
    },
    "/api/v1/auth/bootstrap/verify": {
      post: operation({
        tags: ["Auth"],
        summary:
          "Verify owner bootstrap passkey registration and create a session.",
        operationId: "verifyOwnerBootstrap",
        security: [],
        "x-downwrite-scope": "auth:bootstrap",
        requestBody: jsonRequest("VerifyBootstrapRequest"),
        responses: {
          "200": jsonResponse("Session created.", "AuthResult"),
          "400": refResponse("BadRequest"),
          "401": refResponse("Unauthorized"),
          "409": errorResponse(409, "Owner bootstrap has already completed."),
        },
      }),
    },
    "/api/v1/auth/passkeys/login/options": {
      post: operation({
        tags: ["Auth"],
        summary: "Begin passkey login.",
        operationId: "beginPasskeyLogin",
        security: [],
        "x-downwrite-scope": "auth:login",
        requestBody: jsonRequest("PasskeyLoginOptionsRequest"),
        responses: {
          "200": jsonResponse(
            "WebAuthn authentication options.",
            "WebAuthnOptions",
          ),
          "400": refResponse("BadRequest"),
          "404": refResponse("NotFound"),
          "429": refResponse("TooManyRequests"),
        },
      }),
    },
    "/api/v1/auth/passkeys/login/verify": {
      post: operation({
        tags: ["Auth"],
        summary: "Verify passkey login and create a session.",
        operationId: "verifyPasskeyLogin",
        security: [],
        "x-downwrite-scope": "auth:login",
        requestBody: jsonRequest("VerifyPasskeyLoginRequest"),
        responses: {
          "200": jsonResponse("Session created.", "AuthResult"),
          "400": refResponse("BadRequest"),
        },
      }),
    },
    "/api/v1/auth/session": {
      delete: operation({
        tags: ["Auth"],
        summary: "Delete the current session.",
        operationId: "deleteSession",
        security: [sessionSecurity()],
        "x-downwrite-scope": "auth:logout",
        responses: {
          "200": jsonResponse("Session deleted.", "Ok"),
        },
      }),
    },
    "/api/v1/groups": {
      get: operation({
        tags: ["Workspaces"],
        summary: "List authorized workspaces.",
        operationId: "listGroups",
        security: authenticatedSecurity(),
        "x-downwrite-scope": "workspaces:read",
        responses: {
          "200": jsonResponse("Authorized workspaces.", "GroupList"),
          "401": refResponse("Unauthorized"),
        },
      }),
      post: operation({
        tags: ["Workspaces"],
        summary: "Create a workspace.",
        operationId: "createGroup",
        security: authenticatedSecurity(),
        "x-downwrite-scope": "workspaces:write",
        requestBody: jsonRequest("GroupCreate"),
        responses: {
          "201": jsonResponse("Created workspace.", "GroupEnvelope"),
          "400": refResponse("BadRequest"),
          "401": refResponse("Unauthorized"),
        },
      }),
    },
    "/api/v1/groups/{groupId}": {
      patch: operation({
        tags: ["Workspaces"],
        summary: "Update workspace settings.",
        operationId: "updateGroup",
        security: authenticatedSecurity(),
        parameters: [refParameter("groupId")],
        "x-downwrite-scope": "workspaces:write",
        requestBody: jsonRequest("GroupUpdate"),
        responses: {
          "200": jsonResponse("Updated workspace.", "GroupEnvelope"),
          "403": refResponse("Forbidden"),
        },
      }),
      delete: operation({
        tags: ["Workspaces"],
        summary: "Delete a workspace and its documents.",
        operationId: "deleteGroup",
        security: authenticatedSecurity(),
        parameters: [refParameter("groupId")],
        "x-downwrite-scope": "workspaces:write",
        responses: {
          "200": jsonResponse("Workspace deleted.", "Ok"),
          "403": refResponse("Forbidden"),
        },
      }),
    },
    "/api/v1/groups/{groupId}/documents": {
      post: operation({
        tags: ["Documents"],
        summary: "Create a Markdown document in a workspace.",
        operationId: "createDocument",
        security: authenticatedSecurity(),
        parameters: [refParameter("groupId")],
        "x-downwrite-scope": "documents:write",
        requestBody: jsonRequest("DocumentCreate"),
        responses: {
          "201": jsonResponse("Created document.", "DocumentEnvelope"),
          "403": refResponse("Forbidden"),
        },
      }),
    },
    "/api/v1/documents/{documentId}": {
      get: operation({
        tags: ["Documents"],
        summary: "Read an authorized Markdown document.",
        operationId: "getDocument",
        security: authenticatedSecurity(),
        parameters: [refParameter("documentId")],
        "x-downwrite-scope": "documents:read",
        responses: {
          "200": jsonResponse("Document.", "DocumentEnvelope"),
          "404": refResponse("NotFound"),
        },
      }),
      patch: operation({
        tags: ["Documents"],
        summary: "Update document title and/or Markdown content.",
        operationId: "updateDocument",
        security: authenticatedSecurity(),
        parameters: [refParameter("documentId")],
        "x-downwrite-scope": "documents:write",
        requestBody: jsonRequest("DocumentUpdate"),
        responses: {
          "200": jsonResponse("Updated document.", "DocumentEnvelope"),
          "400": refResponse("BadRequest"),
          "403": refResponse("Forbidden"),
          "409": errorResponse(409, "Document revision conflict."),
        },
      }),
      delete: operation({
        tags: ["Documents"],
        summary: "Delete an authorized document.",
        operationId: "deleteDocument",
        security: authenticatedSecurity(),
        parameters: [refParameter("documentId")],
        "x-downwrite-scope": "documents:write",
        responses: {
          "200": jsonResponse("Document deleted.", "Ok"),
          "403": refResponse("Forbidden"),
        },
      }),
    },
    "/api/v1/documents/{documentId}/move": {
      patch: operation({
        tags: ["Documents"],
        summary: "Move a document into another authorized workspace.",
        description:
          "Owner/editor document writers may move the document only into a workspace where they already have explicit access. Optional baseRevision protects against stale client writes.",
        operationId: "moveDocument",
        security: authenticatedSecurity(),
        parameters: [refParameter("documentId")],
        "x-downwrite-scope": "documents:write",
        requestBody: jsonRequest("DocumentMove"),
        responses: {
          "200": jsonResponse("Moved document.", "DocumentEnvelope"),
          "400": refResponse("BadRequest"),
          "403": refResponse("Forbidden"),
          "409": errorResponse(409, "Document revision conflict."),
        },
      }),
    },
    "/api/v1/documents/{documentId}/position": {
      patch: operation({
        tags: ["Documents"],
        summary: "Set a document's order position within its workspace.",
        description:
          "The current ordering contract sorts documents by ascending numeric position, then recent update time. Optional baseRevision protects against stale client writes.",
        operationId: "positionDocument",
        security: authenticatedSecurity(),
        parameters: [refParameter("documentId")],
        "x-downwrite-scope": "documents:write",
        requestBody: jsonRequest("DocumentPosition"),
        responses: {
          "200": jsonResponse("Reordered document.", "DocumentEnvelope"),
          "400": refResponse("BadRequest"),
          "403": refResponse("Forbidden"),
          "409": errorResponse(409, "Document revision conflict."),
        },
      }),
    },
    "/api/v1/documents/{documentId}/share": {
      get: operation({
        tags: ["Sharing"],
        summary: "Read document sharing state.",
        operationId: "getDocumentShareState",
        security: authenticatedSecurity(),
        parameters: [refParameter("documentId")],
        "x-downwrite-scope": "sharing:write",
        responses: {
          "200": jsonResponse("Sharing state.", "ShareEnvelope"),
          "403": refResponse("Forbidden"),
        },
      }),
    },
    "/api/v1/documents/{documentId}/collaborators": {
      post: operation({
        tags: ["Sharing"],
        summary: "Directly add or update a document collaborator.",
        description:
          "Owner-only compatibility endpoint. The invitation lifecycle is preferred for user-facing sharing.",
        operationId: "addDocumentCollaborator",
        security: authenticatedSecurity(),
        parameters: [refParameter("documentId")],
        "x-downwrite-scope": "sharing:write",
        requestBody: jsonRequest("CollaboratorAdd"),
        responses: {
          "200": jsonResponse("Collaborator added.", "Ok"),
          "400": refResponse("BadRequest"),
        },
      }),
    },
    "/api/v1/documents/{documentId}/collaborators/{identityId}": {
      delete: operation({
        tags: ["Sharing"],
        summary: "Remove a document collaborator.",
        operationId: "removeDocumentCollaborator",
        security: authenticatedSecurity(),
        parameters: [refParameter("documentId"), refParameter("identityId")],
        "x-downwrite-scope": "sharing:write",
        responses: {
          "200": jsonResponse("Collaborator removed.", "Ok"),
          "403": refResponse("Forbidden"),
        },
      }),
    },
    "/api/v1/documents/{documentId}/invitations": {
      post: operation({
        tags: ["Sharing"],
        summary: "Create a pending collaborator invitation.",
        operationId: "createDocumentInvitation",
        security: authenticatedSecurity(),
        parameters: [refParameter("documentId")],
        "x-downwrite-scope": "sharing:write",
        requestBody: jsonRequest("InvitationCreate"),
        responses: {
          "201": jsonResponse("Created invitation.", "InvitationEnvelope"),
          "400": refResponse("BadRequest"),
          "403": refResponse("Forbidden"),
        },
      }),
    },
    "/api/v1/invitations/{token}/accept": {
      post: operation({
        tags: ["Sharing"],
        summary: "Accept a pending collaborator invitation.",
        operationId: "acceptDocumentInvitation",
        security: authenticatedSecurity(),
        parameters: [refParameter("invitationToken")],
        "x-downwrite-scope": "sharing:accept",
        responses: {
          "200": jsonResponse("Accepted invitation.", "InvitationEnvelope"),
          "403": refResponse("Forbidden"),
        },
      }),
    },
    "/api/v1/invitations/{invitationId}": {
      delete: operation({
        tags: ["Sharing"],
        summary: "Revoke a pending invitation.",
        operationId: "revokeDocumentInvitation",
        security: authenticatedSecurity(),
        parameters: [refParameter("invitationId")],
        "x-downwrite-scope": "sharing:write",
        responses: {
          "200": jsonResponse("Invitation revoked.", "Ok"),
          "403": refResponse("Forbidden"),
        },
      }),
    },
    "/api/v1/documents/{documentId}/public-links": {
      post: operation({
        tags: ["Public links"],
        summary: "Create an anonymous read-only public link.",
        operationId: "createPublicLink",
        security: authenticatedSecurity(),
        parameters: [refParameter("documentId")],
        "x-downwrite-scope": "sharing:write",
        requestBody: jsonRequest("PublicLinkCreate"),
        responses: {
          "201": jsonResponse("Created public link.", "PublicLinkEnvelope"),
          "403": refResponse("Forbidden"),
        },
      }),
    },
    "/api/v1/public-links/{publicLinkId}": {
      patch: operation({
        tags: ["Public links"],
        summary: "Update public-link label or active state.",
        operationId: "updatePublicLink",
        security: authenticatedSecurity(),
        parameters: [refParameter("publicLinkId")],
        "x-downwrite-scope": "sharing:write",
        requestBody: jsonRequest("PublicLinkUpdate"),
        responses: {
          "200": jsonResponse("Updated public link.", "PublicLinkEnvelope"),
          "403": refResponse("Forbidden"),
        },
      }),
    },
    "/api/v1/public-links/{token}": {
      get: operation({
        tags: ["Public links"],
        summary: "Read a Markdown document anonymously through a public link.",
        operationId: "getPublicDocument",
        security: [],
        parameters: [refParameter("publicToken")],
        "x-downwrite-scope": "public:read",
        responses: {
          "200": jsonResponse("Public document.", "PublicDocumentEnvelope"),
          "404": refResponse("NotFound"),
          "429": refResponse("TooManyRequests"),
        },
      }),
    },
  };
}

const schemas: Record<string, JsonSchema> = {
  Error: objectSchema({ error: { type: "string" } }, ["error"]),
  Ok: objectSchema({ ok: { type: "boolean", const: true } }, ["ok"]),
  Role: {
    type: "string",
    enum: ["owner", "editor"],
    description:
      "Owner can manage workspace/share settings. Owner and editor can write documents.",
  },
  Identity: objectSchema({ id: { type: "string" } }, ["id"]),
  Health: objectSchema(
    {
      ok: { type: "boolean", const: true },
      name: { type: "string", const: "downwrite-api" },
      version: { type: "string", const: "v1" },
    },
    ["ok", "name", "version"],
  ),
  Discovery: objectSchema({
    name: { type: "string" },
    instanceUrl: { type: "string", format: "uri" },
    api: { type: "object", additionalProperties: true },
    auth: { type: "object", additionalProperties: true },
    clients: { type: "object", additionalProperties: true },
  }),
  AuthConfiguration: objectSchema(
    {
      bootstrapTokenConfigured: { type: "boolean" },
      instancePublicUrl: { type: ["string", "null"], format: "uri" },
      webauthnRpId: { type: ["string", "null"] },
      webauthnRpName: { type: "string" },
    },
    [
      "bootstrapTokenConfigured",
      "instancePublicUrl",
      "webauthnRpId",
      "webauthnRpName",
    ],
  ),
  AuthStatus: objectSchema(
    {
      authenticated: { type: "boolean" },
      bootstrapRequired: { type: "boolean" },
      configuration: refSchema("AuthConfiguration"),
      identity: refSchema("Identity"),
    },
    ["authenticated", "bootstrapRequired", "configuration"],
  ),
  AuthResult: objectSchema(
    {
      ok: { type: "boolean", const: true },
      identity: refSchema("Identity"),
    },
    ["ok", "identity"],
  ),
  WebAuthnOptions: objectSchema(
    {
      challengeId: { type: "string" },
      options: {
        type: "object",
        additionalProperties: true,
        description:
          "PublicKeyCredentialCreationOptionsJSON or PublicKeyCredentialRequestOptionsJSON returned by the server-side WebAuthn library.",
      },
    },
    ["challengeId", "options"],
  ),
  BootstrapOptionsRequest: objectSchema(
    {
      setupToken: { type: "string", writeOnly: true },
      identityId: { type: "string" },
      displayName: { type: "string" },
    },
    ["setupToken", "identityId", "displayName"],
  ),
  VerifyBootstrapRequest: objectSchema(
    {
      setupToken: { type: "string", writeOnly: true },
      challengeId: { type: "string" },
      response: { type: "object", additionalProperties: true },
    },
    ["setupToken", "challengeId", "response"],
  ),
  PasskeyLoginOptionsRequest: objectSchema({ identityId: { type: "string" } }, [
    "identityId",
  ]),
  VerifyPasskeyLoginRequest: objectSchema(
    {
      challengeId: { type: "string" },
      response: { type: "object", additionalProperties: true },
    },
    ["challengeId", "response"],
  ),
  GroupCreate: objectSchema(
    {
      name: { type: "string", minLength: 1 },
      description: { type: ["string", "null"] },
      accentColor: {
        type: ["string", "null"],
        description:
          "Client-facing color value, currently expected as CSS hex.",
      },
    },
    ["name"],
  ),
  GroupUpdate: objectSchema({
    name: { type: "string", minLength: 1 },
    description: { type: ["string", "null"] },
    accentColor: { type: ["string", "null"] },
  }),
  GroupSummary: objectSchema(
    {
      id: { type: "string" },
      name: { type: "string" },
      description: { type: ["string", "null"] },
      accentColor: { type: ["string", "null"] },
      role: refSchema("Role"),
      createdAt: { type: "string" },
      updatedAt: { type: "string" },
      documents: { type: "array", items: refSchema("DocumentSummary") },
    },
    [
      "id",
      "name",
      "description",
      "accentColor",
      "role",
      "createdAt",
      "updatedAt",
      "documents",
    ],
  ),
  GroupEnvelope: objectSchema({ group: refSchema("GroupSummary") }, ["group"]),
  GroupList: objectSchema(
    {
      groups: {
        type: "array",
        items: refSchema("GroupSummary"),
        description:
          "Currently unpaginated. See x-downwrite-conventions.pagination.",
      },
    },
    ["groups"],
  ),
  DocumentCreate: objectSchema(
    {
      title: { type: "string", minLength: 1 },
      content: {
        type: "string",
        mediaType: "text/markdown",
        description: "UTF-8 Markdown source.",
      },
    },
    ["title"],
  ),
  DocumentUpdate: objectSchema({
    title: { type: "string", minLength: 1 },
    content: {
      type: "string",
      mediaType: "text/markdown",
      description: "UTF-8 Markdown source. Omit to leave content unchanged.",
    },
    baseRevision: {
      type: "integer",
      minimum: 0,
      description:
        "Optional revision read by the client. When present and stale, the server returns 409 Conflict.",
    },
  }),
  DocumentMove: objectSchema(
    {
      groupId: { type: "string" },
      position: {
        type: "integer",
        description:
          "Optional target order value. If omitted, the server appends the document to the target workspace.",
      },
      baseRevision: {
        type: "integer",
        minimum: 0,
        description:
          "Optional revision read by the client. When present and stale, the server returns 409 Conflict.",
      },
    },
    ["groupId"],
  ),
  DocumentPosition: objectSchema(
    {
      position: {
        type: "integer",
        description:
          "Target order value. Workspaces list documents by ascending position.",
      },
      baseRevision: {
        type: "integer",
        minimum: 0,
        description:
          "Optional revision read by the client. When present and stale, the server returns 409 Conflict.",
      },
    },
    ["position"],
  ),
  DocumentSummary: objectSchema(
    {
      id: { type: "string" },
      groupId: { type: "string" },
      title: { type: "string" },
      role: refSchema("Role"),
      position: {
        type: "integer",
        description:
          "Workspace ordering value. Lower values render earlier in the workspace.",
      },
      revision: {
        type: "integer",
        minimum: 0,
        description:
          "Monotonic document revision incremented by content, metadata, move, and reorder writes.",
      },
      createdAt: { type: "string" },
      updatedAt: { type: "string" },
    },
    [
      "id",
      "groupId",
      "title",
      "role",
      "position",
      "revision",
      "createdAt",
      "updatedAt",
    ],
  ),
  DocumentRecord: {
    allOf: [
      refSchema("DocumentSummary"),
      objectSchema(
        {
          content: {
            type: "string",
            mediaType: "text/markdown",
            description: "UTF-8 Markdown source, not rendered HTML.",
          },
        },
        ["content"],
      ),
    ],
  },
  DocumentEnvelope: objectSchema({ document: refSchema("DocumentRecord") }, [
    "document",
  ]),
  CollaboratorAdd: objectSchema(
    {
      identityId: { type: "string" },
      role: refSchema("Role"),
    },
    ["identityId", "role"],
  ),
  Collaborator: objectSchema(
    {
      identityId: { type: "string" },
      displayName: { type: ["string", "null"] },
      role: refSchema("Role"),
      createdAt: { type: "string" },
    },
    ["identityId", "displayName", "role", "createdAt"],
  ),
  InvitationCreate: objectSchema(
    {
      identityId: { type: "string" },
      role: refSchema("Role"),
    },
    ["identityId", "role"],
  ),
  Invitation: objectSchema(
    {
      id: { type: "string" },
      documentId: { type: "string" },
      invitedIdentityId: { type: "string" },
      role: refSchema("Role"),
      token: { type: "string", description: "Opaque invitation token." },
      status: { type: "string", enum: ["pending", "accepted", "revoked"] },
      createdByIdentityId: { type: "string" },
      createdAt: { type: "string" },
      acceptedAt: { type: ["string", "null"] },
      revokedAt: { type: ["string", "null"] },
    },
    [
      "id",
      "documentId",
      "invitedIdentityId",
      "role",
      "token",
      "status",
      "createdByIdentityId",
      "createdAt",
      "acceptedAt",
      "revokedAt",
    ],
  ),
  InvitationEnvelope: objectSchema({ invitation: refSchema("Invitation") }, [
    "invitation",
  ]),
  PublicLinkCreate: objectSchema({
    label: { type: ["string", "null"] },
  }),
  PublicLinkUpdate: objectSchema({
    label: { type: ["string", "null"] },
    active: { type: "boolean" },
  }),
  PublicLink: objectSchema(
    {
      id: { type: "string" },
      documentId: { type: "string" },
      token: {
        type: "string",
        description: "Opaque bearer-by-possession token for anonymous reads.",
      },
      label: { type: ["string", "null"] },
      active: { type: "boolean" },
      createdAt: { type: "string" },
    },
    ["id", "documentId", "token", "label", "active", "createdAt"],
  ),
  PublicLinkEnvelope: objectSchema({ publicLink: refSchema("PublicLink") }, [
    "publicLink",
  ]),
  ShareState: objectSchema(
    {
      documentId: { type: "string" },
      collaborators: { type: "array", items: refSchema("Collaborator") },
      invitations: { type: "array", items: refSchema("Invitation") },
      publicLinks: { type: "array", items: refSchema("PublicLink") },
    },
    ["documentId", "collaborators", "invitations", "publicLinks"],
  ),
  ShareEnvelope: objectSchema({ share: refSchema("ShareState") }, ["share"]),
  PublicDocument: objectSchema(
    {
      id: { type: "string" },
      groupId: { type: "string" },
      title: { type: "string" },
      content: {
        type: "string",
        mediaType: "text/markdown",
        description: "UTF-8 Markdown source exposed by an active public link.",
      },
      createdAt: { type: "string" },
      updatedAt: { type: "string" },
      publicLink: objectSchema(
        {
          token: { type: "string" },
          label: { type: ["string", "null"] },
        },
        ["token", "label"],
      ),
    },
    [
      "id",
      "groupId",
      "title",
      "content",
      "createdAt",
      "updatedAt",
      "publicLink",
    ],
  ),
  PublicDocumentEnvelope: objectSchema(
    { document: refSchema("PublicDocument") },
    ["document"],
  ),
};

function operation(input: OpenApiOperation): OpenApiOperation {
  return input;
}

function authenticatedSecurity() {
  return [sessionSecurity(), bearerSecurity()];
}

function sessionSecurity() {
  return { sessionCookie: [] };
}

function bearerSecurity() {
  return { developmentBearer: [] };
}

function jsonRequest(schema: string) {
  return {
    required: true,
    content: {
      "application/json": {
        schema: refSchema(schema),
      },
    },
  };
}

function jsonResponse(description: string, schema: string) {
  return {
    description,
    content: {
      "application/json": {
        schema: refSchema(schema),
      },
    },
  };
}

function errorResponse(status: number, description: string) {
  return {
    description,
    content: {
      "application/json": {
        schema: refSchema("Error"),
        examples: {
          default: {
            value: { error: description || `HTTP ${status}` },
          },
        },
      },
    },
  };
}

function refResponse(name: string) {
  return { $ref: `#/components/responses/${name}` };
}

function refParameter(name: string) {
  return { $ref: `#/components/parameters/${name}` };
}

function pathParameter(name: string, description: string) {
  return {
    name,
    in: "path",
    required: true,
    description,
    schema: { type: "string" },
  };
}

function refSchema(name: string) {
  return { $ref: `#/components/schemas/${name}` };
}

function objectSchema(
  properties: Record<string, unknown>,
  required: string[] = [],
) {
  return {
    type: "object",
    additionalProperties: false,
    properties,
    ...(required.length > 0 ? { required } : {}),
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

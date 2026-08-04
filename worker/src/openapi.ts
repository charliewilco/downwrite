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
  "x-downwrite-client-contract": Record<string, unknown>;
  "x-downwrite-api-roadmap": Record<string, unknown>;
}

const API_VERSION = "v1";
const OAUTH_SCOPES = {
  "workspaces:read": "Read authorized workspaces.",
  "workspaces:write": "Create and manage authorized workspaces.",
  "documents:read": "Read authorized Markdown documents.",
  "documents:write": "Create and update authorized Markdown documents.",
  "sharing:write": "Manage collaborators, invitations, and public links.",
  "mcp:documents":
    "Use MCP document tools limited to the authorized instance data.",
};

export function createOpenApiDocument(requestUrl: string): OpenApiDocument {
  const origin = new URL(requestUrl).origin;

  return {
    openapi: "3.1.0",
    info: {
      title: "Downwrite Worker API",
      version: API_VERSION,
      summary: "Self-hosted Markdown workspace and sharing API.",
      description:
        "Versioned API for a self-hosted Downwrite Cloudflare Worker. The implemented auth boundaries are passkeys/WebAuthn for browser sessions, instance-local OAuth authorization-code-with-PKCE for external clients, and a localhost-only development session adapter. OAuth credentials are issued by the deployer's self-hosted instance, not a central Downwrite service.",
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
      { name: "External auth" },
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
        oauthPkce: {
          type: "oauth2",
          description:
            "Instance-local OAuth authorization-code-with-PKCE boundary for the public iOS app and MCP clients. Clients are public, use PKCE S256, request either the instance API or MCP resource, and receive opaque bearer tokens issued by this self-hosted Worker.",
          flows: {
            authorizationCode: {
              authorizationUrl: `${origin}/oauth/authorize`,
              tokenUrl: `${origin}/oauth/token`,
              refreshUrl: `${origin}/oauth/token`,
              scopes: OAUTH_SCOPES,
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
        Conflict: errorResponse(409, "The write precondition failed."),
        PreconditionRequired: errorResponse(
          428,
          "A required write precondition is missing.",
        ),
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
        "Authenticated operations accept either the passkey session cookie, an instance-local OAuth bearer token, or the local-only development adapter. OAuth tokens must include the route scope. Public-link reads are anonymous and read-only. Owner role is required for workspace settings and sharing management; owner or editor may write documents.",
      errors:
        "Error responses use { error, code, status }. The error string is preserved for older clients, while code is the stable programmatic discriminator.",
      mcp: "MCP tools are normal external clients using scoped credentials. Implemented mappings are list_workspaces, list_documents, read_document, create_document, and update_document; no MCP backdoor is implemented in v1.",
    },
    "x-downwrite-client-contract": clientContract(),
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
        "GET /api/v1/groups/{groupId}",
        "PATCH /api/v1/groups/{groupId}",
        "DELETE /api/v1/groups/{groupId}",
      ],
      documents: [
        "GET /api/v1/groups/{groupId}/documents",
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
        "GET /api/v1/invitations/{token}",
        "POST /api/v1/invitations/{token}/accept",
        "DELETE /api/v1/invitations/{invitationId}",
        "POST /api/v1/documents/{documentId}/public-links",
        "PATCH /api/v1/public-links/{publicLinkId}",
        "GET /api/v1/public-links/{publicLinkId}/manage",
        "GET /api/v1/public-links/{token}",
      ],
      discoveryAndAuth: [
        "GET /.well-known/downwrite",
        "GET /.well-known/oauth-protected-resource",
        "GET /.well-known/oauth-authorization-server",
        "GET /oauth/authorize",
        "POST /oauth/authorize/approve",
        "POST /oauth/token",
        "POST /oauth/revoke",
        "POST /mcp authenticated stateless MCP JSON-RPC endpoint with scoped credentials",
        "GET /api/v1/discovery",
        "GET /api/v1/auth/status",
        "POST /api/v1/auth/development/session local-only development session",
        "POST /api/v1/auth/bootstrap/options",
        "POST /api/v1/auth/bootstrap/verify",
        "POST /api/v1/auth/passkeys/login/options",
        "POST /api/v1/auth/passkeys/login/verify",
        "DELETE /api/v1/auth/session",
      ],
      contract: ["GET /api/v1/openapi.json", "GET /api/v1/docs"],
    },
    proposed: {
      blocksNextInteractiveScreens: [],
      documentsAndContent: [
        "PUT /api/v1/documents/{documentId}/content: content-focused update separate from title/metadata.",
        "GET /api/v1/documents/{documentId}/revisions: list saved content revisions.",
        "GET /api/v1/documents/{documentId}/revisions/{revisionId}: read a historical Markdown revision.",
        "POST /api/v1/groups/{groupId}/imports: import Markdown files into a workspace.",
        "GET /api/v1/groups/{groupId}/export: export workspace Markdown as an archive.",
        "GET /api/v1/documents/{documentId}/export: export one Markdown document.",
      ],
      concurrency: [
        "Current document update/move/reorder writes require baseRevision, return 428 Precondition Required when it is missing or invalid, and return 409 Conflict on stale revisions.",
        "Future ETag/If-Match support may be added for cache-native clients without replacing revision.",
      ],
      sharingAndRoles: [
        "GET /api/v1/groups/{groupId}/members and PATCH/DELETE member endpoints if workspace-level collaboration becomes productized.",
        "Optional viewer role if private read-only invitations become a requirement.",
        "Public-link expiration and last-used metadata if link lifecycle screens need it.",
      ],
      nativeClientAuth: [
        "Implemented GET /oauth/authorize for system-browser OAuth authorization code with PKCE.",
        "Implemented POST /oauth/token for short-lived access tokens and refresh-token rotation.",
        "Implemented POST /oauth/revoke for opaque access/refresh token revocation.",
        "Future work: add configurable client registration if third-party HTTPS redirect clients are needed beyond the built-in iOS and MCP public clients.",
        "GET /api/v1/me planned for native/web account profile once broad account UX exists.",
      ],
      mcpSafeOperations: [
        "Implemented /mcp tools: list_workspaces, list_documents, read_document, create_document, update_document.",
        "MCP requires mcp:documents when authenticated with an OAuth bearer token.",
        "Avoid any all-instance search/list endpoint by default.",
      ],
    },
    longerTerm:
      "iOS and MCP primarily need stable discovery, OAuth/PKCE, scoped credentials, cursor pagination, conflict semantics, import/export, and document movement. They do not require a different backend or privileged route family.",
  };
}

function clientContract() {
  return {
    status: "v1-draft",
    resource: "/api/v1",
    mediaTypes: {
      requests: ["application/json"],
      responses: ["application/json"],
      markdown: "Document content fields contain UTF-8 text/markdown source.",
    },
    errors: {
      envelope: "{ error: string, code: string, status: number }",
      compatibility:
        "Clients may continue reading the error string, but new clients should switch on code.",
      codes: [
        "bad_request",
        "unauthorized",
        "forbidden",
        "not_found",
        "conflict",
        "precondition_required",
        "rate_limited",
        "internal_error",
      ],
    },
    lists: {
      current:
        "Workspace and document collections are unpaginated in this small self-hosted v1 slice.",
      future:
        "List endpoints may add optional cursor and limit query parameters plus nextCursor without changing item schemas.",
    },
    revisions: {
      field: "revision",
      precondition:
        "Document update, move, and reorder requests must include baseRevision.",
      missing:
        "A missing or invalid baseRevision returns 428 Precondition Required and does not mutate the document.",
      conflict:
        "A stale baseRevision returns 409 Conflict and does not mutate the document.",
    },
    permissions: {
      owner:
        "Can manage workspace settings, document content, collaborators, invitations, and public links.",
      editor: "Can read and write explicitly authorized documents.",
      publicLink: "Anonymous, bearer-by-possession, read-only Markdown access.",
    },
    externalAuth: {
      resourceMetadata: "/.well-known/oauth-protected-resource",
      authorizationServerMetadata: "/.well-known/oauth-authorization-server",
      authorizationEndpoint: "/oauth/authorize",
      tokenEndpoint: "/oauth/token",
      revocationEndpoint: "/oauth/revoke",
      apiResource: "/api/v1",
      mcpResource: "/mcp",
      status:
        "Protected-resource metadata, authorization, token exchange, refresh rotation, and token revocation are implemented by this self-hosted instance.",
      pkceRequired: true,
      resourceIndicatorsRequired: true,
      publicClients: [
        "downwrite-ios with downwrite://oauth/callback",
        "downwrite-mcp with loopback http://127.0.0.1:{port}/callback or http://localhost:{port}/callback",
      ],
      scopes: Object.keys(OAUTH_SCOPES),
    },
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
    "/.well-known/oauth-protected-resource": {
      get: operation({
        tags: ["External auth"],
        summary: "Read OAuth protected-resource metadata.",
        description:
          "Public metadata for external clients that need to identify this Worker API as the protected resource. This does not issue credentials.",
        operationId: "getOAuthProtectedResourceMetadata",
        security: [],
        responses: {
          "200": jsonResponse(
            "OAuth protected-resource metadata.",
            "OAuthProtectedResourceMetadata",
          ),
        },
      }),
    },
    "/.well-known/oauth-authorization-server": {
      get: operation({
        tags: ["External auth"],
        summary: "Read OAuth authorization-server metadata.",
        description:
          "Documents this instance's OAuth/PKCE authorization server. Tokens are opaque credentials issued by this self-hosted Worker for this Worker API resource.",
        operationId: "getOAuthAuthorizationServerMetadata",
        security: [],
        "x-downwrite-status": "implemented",
        responses: {
          "200": jsonResponse(
            "OAuth authorization-server metadata.",
            "OAuthAuthorizationServerMetadata",
          ),
        },
      }),
    },
    "/oauth/authorize": {
      get: operation({
        tags: ["External auth"],
        summary: "Render OAuth authorization consent.",
        description:
          "Validates a public client authorization-code request with PKCE S256 and renders the minimal signed-in browser consent page.",
        operationId: "authorizeOAuthClient",
        security: [sessionSecurity()],
        parameters: [
          queryParameter("response_type", "OAuth response type. Must be code."),
          queryParameter("client_id", "Public client identifier."),
          queryParameter(
            "redirect_uri",
            "Allowed redirect URI for the public client.",
          ),
          queryParameter("code_challenge", "PKCE S256 challenge."),
          queryParameter("code_challenge_method", "PKCE method. Must be S256."),
          queryParameter("scope", "Space-delimited requested scopes."),
          queryParameter(
            "resource",
            "Protected resource. Must be this /api/v1 base URL.",
          ),
          queryParameter("state", "Opaque client state."),
        ],
        "x-downwrite-status": "implemented",
        responses: {
          "200": {
            description: "HTML consent page.",
            content: { "text/html": { schema: { type: "string" } } },
          },
          "400": refResponse("BadRequest"),
          "401": refResponse("Unauthorized"),
        },
      }),
    },
    "/oauth/authorize/approve": {
      post: operation({
        tags: ["External auth"],
        summary: "Approve OAuth authorization and redirect with a code.",
        description:
          "Cookie-authenticated consent action. Unsafe cookie writes require a same-origin Origin header. On success, redirects to the validated client redirect_uri with code and optional state.",
        operationId: "approveOAuthClient",
        security: [sessionSecurity()],
        "x-downwrite-status": "implemented",
        requestBody: formRequest("OAuthAuthorizeApproveRequest"),
        responses: {
          "302": { description: "Redirect to client redirect_uri with code." },
          "400": refResponse("BadRequest"),
          "401": refResponse("Unauthorized"),
          "403": refResponse("Forbidden"),
        },
      }),
    },
    "/oauth/token": {
      post: operation({
        tags: ["External auth"],
        summary: "Exchange OAuth authorization code or refresh token.",
        description:
          "Supports authorization_code and refresh_token grants for public clients using PKCE. Issues opaque instance-local bearer tokens scoped to this Worker API resource.",
        operationId: "exchangeOAuthToken",
        security: [],
        "x-downwrite-status": "implemented",
        requestBody: formRequest("OAuthTokenRequest"),
        responses: {
          "200": jsonResponse("OAuth token response.", "OAuthTokenResponse"),
          "400": refResponse("BadRequest"),
        },
      }),
    },
    "/oauth/revoke": {
      post: operation({
        tags: ["External auth"],
        summary: "Revoke an OAuth access or refresh token.",
        operationId: "revokeOAuthToken",
        security: [],
        "x-downwrite-status": "implemented",
        requestBody: formRequest("OAuthRevokeRequest"),
        responses: {
          "200": { description: "Token revoked or already unknown." },
          "400": refResponse("BadRequest"),
        },
      }),
    },
    "/mcp": {
      post: operation({
        tags: ["External auth"],
        summary: "Invoke the narrow Downwrite MCP tool endpoint.",
        description:
          "Stateless JSON-RPC endpoint for MCP clients. The implementation authenticates bearer credentials or session cookies, derives a local Downwrite identity, checks OAuth scope mcp:documents when applicable, and calls storage/domain methods directly. It does not pass arbitrary bearer tokens through to API handlers.",
        operationId: "invokeMcp",
        security: authenticatedSecurity(),
        "x-downwrite-scope": "mcp:documents",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: refSchema("JsonRpcRequest"),
            },
          },
        },
        responses: {
          "200": jsonResponse("MCP JSON-RPC response.", "JsonRpcResponse"),
          "204": {
            description: "JSON-RPC notification accepted.",
          },
          "400": refResponse("BadRequest"),
          "401": refResponse("Unauthorized"),
          "403": refResponse("Forbidden"),
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
    "/api/v1/auth/development/session": {
      post: operation({
        tags: ["Auth"],
        summary: "Create a localhost-only development session.",
        description:
          "Available only when DOWNWRITE_LOCAL_AUTH=1 and the request host is localhost. This creates a normal httpOnly session cookie for local Wrangler development so the browser flow does not require manually entering a bearer token. It is not production authentication.",
        operationId: "createDevelopmentSession",
        security: [],
        "x-downwrite-scope": "auth:development",
        requestBody: jsonRequest("DevelopmentSessionRequest"),
        responses: {
          "200": jsonResponse("Development session created.", "AuthResult"),
          "404": refResponse("NotFound"),
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
      get: operation({
        tags: ["Workspaces"],
        summary: "Read one authorized workspace.",
        operationId: "getGroup",
        security: authenticatedSecurity(),
        parameters: [refParameter("groupId")],
        "x-downwrite-scope": "workspaces:read",
        responses: {
          "200": jsonResponse("Workspace.", "GroupEnvelope"),
          "404": refResponse("NotFound"),
        },
      }),
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
      get: operation({
        tags: ["Documents"],
        summary: "List documents in one authorized workspace.",
        operationId: "listGroupDocuments",
        security: authenticatedSecurity(),
        parameters: [refParameter("groupId")],
        "x-downwrite-scope": "workspaces:read",
        responses: {
          "200": jsonResponse("Workspace documents.", "DocumentList"),
          "404": refResponse("NotFound"),
        },
      }),
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
          "428": refResponse("PreconditionRequired"),
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
          "Owner/editor document writers may move the document only into a workspace where they already have explicit access. Required baseRevision protects against missing or stale client write preconditions.",
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
          "428": refResponse("PreconditionRequired"),
        },
      }),
    },
    "/api/v1/documents/{documentId}/position": {
      patch: operation({
        tags: ["Documents"],
        summary: "Set a document's order position within its workspace.",
        description:
          "The current ordering contract sorts documents by ascending numeric position, then recent update time. Required baseRevision protects against missing or stale client write preconditions.",
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
          "428": refResponse("PreconditionRequired"),
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
        "x-downwrite-scope": "sharing:write",
        responses: {
          "200": jsonResponse("Accepted invitation.", "InvitationEnvelope"),
          "403": refResponse("Forbidden"),
        },
      }),
    },
    "/api/v1/invitations/{token}": {
      get: operation({
        tags: ["Sharing"],
        summary: "Preview a collaborator invitation by opaque token.",
        description:
          "Public token-preview endpoint for browser-facing invitation acceptance. It does not grant access; accepting still requires authentication as the invited identity.",
        operationId: "getDocumentInvitationPreview",
        security: [],
        parameters: [refParameter("invitationToken")],
        "x-downwrite-scope": "invitation:preview",
        responses: {
          "200": jsonResponse(
            "Invitation preview.",
            "InvitationPreviewEnvelope",
          ),
          "404": refResponse("NotFound"),
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
    "/api/v1/public-links/{publicLinkId}/manage": {
      get: operation({
        tags: ["Public links"],
        summary: "Read one managed public-link record.",
        description:
          "Owner-only public-link management detail. The anonymous public read route remains /api/v1/public-links/{token}.",
        operationId: "getManagedPublicLink",
        security: authenticatedSecurity(),
        parameters: [refParameter("publicLinkId")],
        "x-downwrite-scope": "sharing:write",
        responses: {
          "200": jsonResponse("Public link.", "PublicLinkEnvelope"),
          "404": refResponse("NotFound"),
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
  Error: objectSchema(
    {
      error: {
        type: "string",
        description: "Human-readable error message retained for compatibility.",
      },
      code: {
        type: "string",
        description: "Stable programmatic error discriminator.",
      },
      status: { type: "integer", minimum: 400, maximum: 599 },
    },
    ["error", "code", "status"],
  ),
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
  OAuthProtectedResourceMetadata: objectSchema(
    {
      resource: { type: "string", format: "uri" },
      authorization_servers: {
        type: "array",
        items: { type: "string", format: "uri" },
      },
      scopes_supported: {
        type: "array",
        items: { type: "string" },
      },
      bearer_methods_supported: {
        type: "array",
        items: { type: "string" },
      },
      resource_documentation: { type: "string", format: "uri" },
      "x-downwrite-status": { type: "string" },
      "x-downwrite-token-model": { type: "string" },
    },
    [
      "resource",
      "authorization_servers",
      "scopes_supported",
      "bearer_methods_supported",
      "resource_documentation",
      "x-downwrite-status",
      "x-downwrite-token-model",
    ],
  ),
  OAuthAuthorizationServerMetadata: objectSchema(
    {
      issuer: { type: "string", format: "uri" },
      authorization_endpoint: { type: "string", format: "uri" },
      token_endpoint: { type: "string", format: "uri" },
      revocation_endpoint: { type: "string", format: "uri" },
      response_types_supported: {
        type: "array",
        items: { type: "string" },
      },
      grant_types_supported: {
        type: "array",
        items: { type: "string" },
      },
      code_challenge_methods_supported: {
        type: "array",
        items: { type: "string" },
      },
      token_endpoint_auth_methods_supported: {
        type: "array",
        items: { type: "string" },
      },
      revocation_endpoint_auth_methods_supported: {
        type: "array",
        items: { type: "string" },
      },
      scopes_supported: {
        type: "array",
        items: { type: "string" },
      },
      "x-downwrite-status": { type: "string" },
      "x-downwrite-public-clients": {
        type: "array",
        items: { type: "object", additionalProperties: true },
      },
      "x-downwrite-resource-indicators-required": { type: "boolean" },
      "x-downwrite-note": { type: "string" },
    },
    [
      "issuer",
      "authorization_endpoint",
      "token_endpoint",
      "revocation_endpoint",
      "response_types_supported",
      "grant_types_supported",
      "code_challenge_methods_supported",
      "token_endpoint_auth_methods_supported",
      "revocation_endpoint_auth_methods_supported",
      "scopes_supported",
      "x-downwrite-status",
      "x-downwrite-public-clients",
      "x-downwrite-resource-indicators-required",
      "x-downwrite-note",
    ],
  ),
  OAuthAuthorizeApproveRequest: objectSchema(
    {
      client_id: { type: "string" },
      redirect_uri: { type: "string" },
      code_challenge: { type: "string" },
      code_challenge_method: { type: "string", const: "S256" },
      scope: { type: "string" },
      resource: { type: "string", format: "uri" },
      state: { type: "string" },
    },
    [
      "client_id",
      "redirect_uri",
      "code_challenge",
      "code_challenge_method",
      "scope",
      "resource",
    ],
  ),
  OAuthTokenRequest: objectSchema({
    grant_type: {
      type: "string",
      enum: ["authorization_code", "refresh_token"],
    },
    client_id: { type: "string" },
    code: { type: "string" },
    redirect_uri: { type: "string" },
    code_verifier: { type: "string" },
    refresh_token: { type: "string" },
  }),
  OAuthRevokeRequest: objectSchema(
    {
      token: { type: "string" },
      token_type_hint: {
        type: "string",
        enum: ["access_token", "refresh_token"],
      },
    },
    ["token"],
  ),
  OAuthTokenResponse: objectSchema(
    {
      token_type: { type: "string", const: "Bearer" },
      access_token: { type: "string" },
      expires_in: { type: "integer" },
      refresh_token: { type: "string" },
      refresh_expires_in: { type: "integer" },
      scope: { type: "string" },
      resource: { type: "string", format: "uri" },
    },
    [
      "token_type",
      "access_token",
      "expires_in",
      "refresh_token",
      "refresh_expires_in",
      "scope",
      "resource",
    ],
  ),
  JsonRpcRequest: objectSchema(
    {
      jsonrpc: { type: "string", const: "2.0" },
      id: { type: ["string", "number", "null"] },
      method: {
        type: "string",
        enum: ["initialize", "tools/list", "tools/call"],
      },
      params: { type: "object", additionalProperties: true },
    },
    ["jsonrpc", "method"],
  ),
  JsonRpcResponse: objectSchema(
    {
      jsonrpc: { type: "string", const: "2.0" },
      id: { type: ["string", "number", "null"] },
      result: { type: "object", additionalProperties: true },
      error: {
        type: "object",
        additionalProperties: true,
        description:
          "JSON-RPC error object. Downwrite HTTP-style error data appears in error.data when available.",
      },
    },
    ["jsonrpc", "id"],
  ),
  AuthConfiguration: objectSchema(
    {
      bootstrapTokenConfigured: { type: "boolean" },
      instancePublicUrl: { type: ["string", "null"], format: "uri" },
      localDevelopmentAuthEnabled: { type: "boolean" },
      webauthnRpId: { type: ["string", "null"] },
      webauthnRpName: { type: "string" },
    },
    [
      "bootstrapTokenConfigured",
      "instancePublicUrl",
      "localDevelopmentAuthEnabled",
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
  DevelopmentSessionRequest: objectSchema({
    identityId: {
      type: "string",
      description: "Local development identity id. Defaults to local-owner.",
    },
    displayName: {
      type: "string",
      description: "Local display name. Defaults to Local Owner.",
    },
  }),
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
  DocumentList: objectSchema(
    {
      documents: {
        type: "array",
        items: refSchema("DocumentSummary"),
        description:
          "Workspace document summaries sorted by ascending position, then recent update time.",
      },
    },
    ["documents"],
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
  DocumentUpdate: objectSchema(
    {
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
          "Revision read by the client. Missing or invalid values return 428 Precondition Required; stale values return 409 Conflict.",
      },
    },
    ["baseRevision"],
  ),
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
          "Revision read by the client. Missing or invalid values return 428 Precondition Required; stale values return 409 Conflict.",
      },
    },
    ["groupId", "baseRevision"],
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
          "Revision read by the client. Missing or invalid values return 428 Precondition Required; stale values return 409 Conflict.",
      },
    },
    ["position", "baseRevision"],
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
  InvitationPreview: objectSchema(
    {
      token: { type: "string", description: "Opaque invitation token." },
      status: { type: "string", enum: ["pending", "accepted", "revoked"] },
      invitedIdentityId: { type: "string" },
      role: refSchema("Role"),
      document: objectSchema(
        {
          id: { type: "string" },
          groupId: { type: "string" },
          title: { type: "string" },
        },
        ["id", "groupId", "title"],
      ),
      createdAt: { type: "string" },
      acceptedAt: { type: ["string", "null"] },
      revokedAt: { type: ["string", "null"] },
    },
    [
      "token",
      "status",
      "invitedIdentityId",
      "role",
      "document",
      "createdAt",
      "acceptedAt",
      "revokedAt",
    ],
  ),
  InvitationPreviewEnvelope: objectSchema(
    { invitation: refSchema("InvitationPreview") },
    ["invitation"],
  ),
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
  return [sessionSecurity(), bearerSecurity(), oauthSecurity()];
}

function sessionSecurity() {
  return { sessionCookie: [] };
}

function bearerSecurity() {
  return { developmentBearer: [] };
}

function oauthSecurity() {
  return { oauthPkce: [] };
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

function formRequest(schema: string) {
  return {
    required: true,
    content: {
      "application/x-www-form-urlencoded": {
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
  const codeByStatus: Record<number, string> = {
    400: "bad_request",
    401: "unauthorized",
    403: "forbidden",
    404: "not_found",
    409: "conflict",
    429: "rate_limited",
    501: "not_implemented",
  };

  return {
    description,
    content: {
      "application/json": {
        schema: refSchema("Error"),
        examples: {
          default: {
            value: {
              error: description || `HTTP ${status}`,
              code: codeByStatus[status] ?? "internal_error",
              status,
            },
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

function queryParameter(name: string, description: string) {
  return {
    name,
    in: "query",
    required: name !== "scope" && name !== "state",
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

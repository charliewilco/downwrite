# Downwrite Worker

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/charliewilco/downwrite/tree/main/worker)

This directory is intentionally self-contained so Cloudflare's Deploy to
Cloudflare button can treat it as the project root. It deploys one Cloudflare
Worker that serves both the compiled Preact web app and the versioned API from
the same origin.

## What Cloudflare Provisions

`wrangler.toml` declares:

- Workers Static Assets from `web/dist`, with SPA fallback for browser routes.
- Worker-first routing for `/api/*`, `/.well-known/*`, `/oauth/*`, and `/mcp`
  so API, OpenAPI, discovery, auth, OAuth-boundary, and MCP requests always
  execute the Worker script instead of the SPA fallback.
- `DB`: a D1 database for instance-local metadata, authorization records,
  sessions, and coarse abuse throttles.
- `CONTENT`: an R2 bucket for Markdown document bodies.
- `AUTH_BOOTSTRAP_TOKEN`: a one-time owner setup secret configured by the deployer.
- `DEVELOPMENT_API_TOKENS`: an instance-local development identity map.
- `DOWNWRITE_LOCAL_AUTH`: a local `.dev.vars` flag for localhost-only browser
  sign-in during `wrangler dev`. Do not set this in production.
- `WEBAUTHN_RP_NAME`, `WEBAUTHN_RP_ID`, and `INSTANCE_PUBLIC_URL`: optional
  passkey/origin settings for a production custom domain.

Cloudflare provisions and binds those resources in the deployer's own account
during the button flow. The web assets are uploaded with the Worker deployment;
there is no second hosting platform or centrally operated Downwrite service.

The Worker also enables Cloudflare Workers observability in `wrangler.toml` for
the deployer's own account. This does not send data to a Downwrite-operated
service.

## Discovery and Native Clients

This Worker exposes unauthenticated discovery metadata for clients that start
from an instance base URL:

```http
GET /.well-known/downwrite
GET /.well-known/oauth-protected-resource
GET /.well-known/oauth-authorization-server
GET /api/v1/discovery
GET /api/v1/openapi.json
GET /api/v1/docs
POST /mcp
```

The intended future shape is one public, centrally distributed iOS Downwrite app
that signs into any compatible self-hosted instance. A deployer should not need a
separate iOS app build for their Cloudflare deployment. Keep authentication
replaceable and standards-compatible for native clients. The current production
web path is passkeys/WebAuthn plus secure httpOnly server-side sessions. A
future iOS app should use OAuth authorization code with PKCE through the system
browser, then return a short-lived authorization code to the app. Direct native
passkeys are not the required cross-instance mechanism because Apple associated
domains are per deployed domain.

Discovery also advertises the long-term MCP client direction. A future MCP
server or connector must call the same versioned Worker API as any other client,
using scoped credentials and explicit workspace/document authorization. It must
not expose broad instance data by default or bypass the owner/editor write
boundary.

`POST /mcp` is available as a narrow stateless JSON-RPC endpoint for MCP clients
with five tools: list workspaces, list documents, read document, create
document, and update document. The endpoint authenticates the incoming request,
derives a local Downwrite identity, and invokes storage/domain methods with that
identity. It does not forward arbitrary bearer tokens to API handlers. Until the
production OAuth authorization server is implemented, MCP access is limited to
the same instance-local development credentials used by API smoke tests.

## API Contract

The Worker serves a versioned OpenAPI 3.1 contract:

```http
GET /api/v1/openapi.json
```

A dependency-free local HTML documentation view is available at:

```http
GET /api/v1/docs
```

The OpenAPI `paths` object documents implemented routes only. Proposed endpoint
gaps for near-term screens, iOS, and MCP are tracked in
[`API_ROADMAP.md`](./API_ROADMAP.md) and mirrored under the
`x-downwrite-api-roadmap` extension in the served spec.

Client integration rules are summarized in
[`V1_CLIENT_CONTRACT.md`](./V1_CLIENT_CONTRACT.md) and mirrored under the
`x-downwrite-client-contract` extension in the served spec. Error responses use
`{ error, code, status }`; the string `error` field is retained for existing
clients, while new clients should branch on `code`.

Document update, move, and reorder writes accept an optional `baseRevision`
integer from the last document read. When the stored document has advanced, the
Worker returns `409 Conflict` so web, future iOS, and future MCP clients can
avoid silently overwriting newer Markdown.

The contract source is a typed local module in `src/openapi.ts`. Node-native
tests compare the served OpenAPI method/path set with Hono's registered routes
to catch meaningful route/spec drift without adding a generator stack.

## Scripts

```bash
npm run dev
npm run dev:api
npm run dev:web
npm run typecheck
npm test
npm run build
npm run validate:worker
npm run deploy
```

`npm run dev` prepares local development state, applies local D1 migrations,
builds `web/dist`, and starts a single local Worker preview. Use
`npm run dev:api` plus `npm run dev:web` only for split local iteration; that is
not the deploy shape.

`npm run deploy` builds the API and Preact assets, applies D1 migrations by
binding name, and then deploys:

```bash
npm run build
wrangler d1 migrations apply DB --remote
wrangler deploy
```

Do not run the deploy script unless you intend to deploy to your own Cloudflare
account.

## Local First Run

From the repository root:

```bash
npm install
npm run dev:worker
```

The first run creates `worker/.dev.vars` with random local-only secrets if the
file is missing, applies local D1 migrations for Wrangler, builds the Preact
assets, and starts the single Worker at the URL printed by Wrangler, normally
`http://localhost:8787`.

Open that URL in a browser. For the fastest local path:

1. Choose the `Development` tab in the auth panel.
2. Select `Start local owner session`.
3. Create a workspace.
4. Open the workspace and create a Markdown document.

That development button is only enabled on localhost when
`DOWNWRITE_LOCAL_AUTH=1` is present in `worker/.dev.vars`. It creates a normal
httpOnly Downwrite session cookie and does not expose or require a bearer token
in the browser. It is not production authentication.

For passkey bootstrap testing, edit `worker/.dev.vars` or create it from
`.dev.vars.example` with random instance-local secrets:

```text
DOWNWRITE_LOCAL_AUTH=1
DEVELOPMENT_API_TOKENS=dev-owner:replace-with-a-random-local-token,dev-editor:replace-with-another-random-local-token
AUTH_BOOTSTRAP_TOKEN=replace-with-a-random-one-time-owner-setup-token
WEBAUTHN_RP_NAME=Downwrite
```

The web UI can bootstrap the first owner passkey with `AUTH_BOOTSTRAP_TOKEN`.
After that, users sign in with passkeys and receive httpOnly server-side session
cookies. Session cookie values are random opaque tokens; the D1 `sessions` table
stores only their SHA-256 hashes and expiry timestamps.

Session cookies are `Secure`, `HttpOnly`, and `SameSite=Lax` on production
origins. Localhost HTTP is allowed to omit `Secure` so local passkey/session
testing works without external deployment. Cookie-authenticated write requests
must include a same-origin `Origin` header; bearer-token API requests remain
available for local development and non-browser smoke tests.

Passkey bootstrap/login challenge creation and public-link reads use a small D1
rate-limit table. This is intentionally coarse and instance-local; deployers may
still add Cloudflare account-level WAF or rate limiting in front of their own
deployment.

For local development and API smoke tests, requests may still use:

```http
Authorization: Bearer replace-with-a-random-local-token
```

This bearer adapter is deliberately not the production account system.

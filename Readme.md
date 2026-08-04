# Downwrite

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/charliewilco/downwrite/tree/main/worker)

Downwrite is an open-source, self-hostable Markdown writing service. The
product core is one Cloudflare Worker deployment that serves the compiled Preact
web app, the versioned Hono API, D1 metadata, R2 Markdown storage,
passkey-backed web sessions, and instance-local authorization records from the
same origin. There is no dependency on a centrally operated Downwrite service.

## Current Slice

This repository currently contains:

- `worker/`: the isolated deployable Cloudflare Worker package, including API
  source, D1 migrations, Wrangler config, and the Preact web source under
  `worker/web/`.
- legacy source under `src/`: retained only as historical material while the
  greenfield Worker implementation replaces it.

The implemented API slice supports:

- `GET /.well-known/downwrite`
- `GET /api/v1/health`
- `GET /api/v1/discovery`
- `GET /api/v1/openapi.json`
- `GET /api/v1/docs`
- `GET /api/v1/auth/status`
- `POST /api/v1/auth/bootstrap/options`
- `POST /api/v1/auth/bootstrap/verify`
- `POST /api/v1/auth/passkeys/login/options`
- `POST /api/v1/auth/passkeys/login/verify`
- `DELETE /api/v1/auth/session`
- `GET /api/v1/groups`
- `POST /api/v1/groups`
- `PATCH /api/v1/groups/:groupId`
- `DELETE /api/v1/groups/:groupId`
- `POST /api/v1/groups/:groupId/documents`
- `GET /api/v1/documents/:documentId`
- `PATCH /api/v1/documents/:documentId`
- `DELETE /api/v1/documents/:documentId`
- `GET /api/v1/documents/:documentId/share`
- `POST /api/v1/documents/:documentId/collaborators`
- `DELETE /api/v1/documents/:documentId/collaborators/:identityId`
- `POST /api/v1/documents/:documentId/invitations`
- `POST /api/v1/invitations/:token/accept`
- `DELETE /api/v1/invitations/:invitationId`
- `POST /api/v1/documents/:documentId/public-links`
- `PATCH /api/v1/public-links/:publicLinkId`
- `GET /api/v1/public-links/:token`

Anonymous public-link reads are read-only. Writes require an instance-local bearer
token or passkey session mapped to an invited `owner` or `editor` identity.

The web app now includes workspace create/rename/delete/description/color
organization, document detail navigation, Markdown textarea editing, debounced
autosave, rename, delete, dependency-free rendered Markdown preview, collaborator
invitations, invitation acceptance, and public-link creation/revocation. It
deliberately does not include a rich editor, iOS client, MCP server, or email
delivery.

The compiled web assets are served by the same Cloudflare Worker as the API
using Workers Static Assets. Browser routes such as `/workspaces/:id`,
`/documents/:id`, `/invitations/:token`, and `/public/:token` are SPA routes;
API and discovery routes remain under `/api/v1` and `/.well-known/downwrite`.

The Worker also serves a versioned OpenAPI 3.1 contract at
`/api/v1/openapi.json` and a local HTML documentation view at `/api/v1/docs`.
Implemented endpoints appear in OpenAPI `paths`; proposed API gaps are tracked
in [`worker/API_ROADMAP.md`](./worker/API_ROADMAP.md) and mirrored under the
served spec's `x-downwrite-api-roadmap` extension.

## Native Client Direction

Downwrite is self-hosted on the server side, but there should be one centrally
distributed public iOS app. A user should install the public Downwrite iOS app
once, enter or choose their own instance base URL, and sign into that instance.
They should not need a separately deployed iOS app for each Cloudflare
deployment.

That means every self-hosted server must preserve a stable instance base URL and
public discovery metadata:

- `GET /.well-known/downwrite`
- `GET /api/v1/discovery`

Those endpoints are unauthenticated and report the instance origin, current and
supported API versions, versioned API base path, versioned API base URL, and
native-client compatibility flags. They do not expose credentials.

The production web auth path is passkeys/WebAuthn with secure httpOnly
server-side sessions and one-time owner bootstrap. For the future public iOS
app, Downwrite reserves an OAuth authorization-code-with-PKCE boundary: the app
should open the instance in the system browser, let the user authenticate with
that self-hosted instance, and receive a short-lived authorization code. Direct
native passkeys are not required as the cross-instance mechanism because Apple
associated-domain requirements are per domain.

## MCP Client Direction

A self-hosted Downwrite instance should also be attachable to a chat interface
through MCP. MCP must be treated as another external API client, not a privileged
backdoor into a deployment. The Worker API should remain the product boundary
for web, native, and MCP clients.

Future MCP support should map narrowly to explicit tools:

- `list_workspaces`: list only workspaces the credential can access.
- `list_documents`: list only documents visible in an authorized workspace.
- `read_document`: read a specific authorized Markdown document.
- `create_document`: create Markdown in an authorized workspace.
- `update_document`: update a specific authorized Markdown document.

The server must support scoped credentials, explicit workspace/document
authorization, and no broad data discovery by default. A future MCP credential
should scope tool calls to the user's authorized data in their chosen
self-hosted instance. Public-link reads remain anonymous and read-only; MCP write
tools must use the same owner/editor authorization boundary as the web and future
native clients.

## Deploy to Cloudflare

The button above points at the isolated `worker/` directory:

```md
[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/charliewilco/downwrite/tree/main/worker)
```

Cloudflare's Deploy to Cloudflare flow treats the subdirectory as the project
root, so `worker/` contains its own `package.json`, `wrangler.toml`, migrations,
API source, web source, and tests. This is intentional: Cloudflare does not fully
support monorepos for one-click Worker deploys, and a subdirectory deploy must
be fully isolated.

During the button flow, Cloudflare reads `worker/wrangler.toml`, builds the
compiled Preact assets into `worker/web/dist`, and provisions the deployer's own
resources:

- Worker: `downwrite-api`, or the deployer's chosen name, serving both the web
  app and `/api/v1`.
- Workers Static Assets: `worker/web/dist`, with SPA fallback for browser
  routes and Worker-first routing for `/api/*` and `/.well-known/*`.
- D1 binding: `DB`, for groups, documents, collaborator roles, share links,
  sessions, passkey challenges, and coarse abuse throttles.
- R2 binding: `CONTENT`, for Markdown document bodies.
- Worker secret: `AUTH_BOOTSTRAP_TOKEN`, for one-time owner setup.
- Worker vars: `WEBAUTHN_RP_NAME`, optional `WEBAUTHN_RP_ID`, and optional
  `INSTANCE_PUBLIC_URL`, for production passkey origin settings.
- Worker var: `DEVELOPMENT_API_TOKENS`, for local API development only.

No Cloudflare resources are provisioned by this repository itself. The deployer
owns the Worker, D1 database, R2 bucket, routes, optional custom domain, data,
and tokens in their own Cloudflare account.

Workers observability is enabled in `worker/wrangler.toml` for the deployer's
own account. No logs or metrics are sent to a Downwrite-operated service.

## Local Development

Install dependencies:

```bash
npm install
```

Copy the local var example and choose a random token:

```bash
cp worker/.dev.vars.example worker/.dev.vars
```

Apply the D1 migration locally:

```bash
cd worker
npm run db:migrations:apply -- --local
```

Run the Worker:

```bash
npm run dev
```

This builds `worker/web/dist` and starts one local Worker that serves both the
web app and API from the same origin. For faster API-only or split Vite
iteration, use:

```bash
npm run dev:api
npm run dev:web
```

The Vite dev server is optional and proxies `/api` to `http://localhost:8787`.
The production/self-hosted shape remains one Worker. The web app defaults to
`owner-token` for local development. Change it in the UI to match the token in
`worker/.dev.vars`, or bootstrap an owner passkey with `AUTH_BOOTSTRAP_TOKEN`.

Production web sessions use opaque httpOnly server-side cookies. Cookie
authenticated write requests are same-origin only; local bearer tokens remain
available for development and API smoke tests. Auth challenge creation and
public-link reads use a small D1-backed rate limiter. Deployers can add
Cloudflare account-level WAF or rate limiting later without changing the
versioned API.

## Validation

From the repository root:

```bash
npm run validate
```

The Worker tests use only Node's built-in test runner. There is no Jest, Vitest,
or Miniflare dependency.

## Dependency Policy

Runtime dependencies are intentionally narrow:

- `@simplewebauthn/server`: focused server-side WebAuthn challenge and
  attestation/assertion verification. This is intentionally not handwritten; FIDO
  verification is security-sensitive and not a good target for dependency
  minimization.
- `hono`: required by the accepted Worker-native API architecture.
- `preact`: required by the accepted web-client direction.

The OpenAPI contract is maintained as a typed local Worker module and verified
against Hono's registered routes in Node tests. No OpenAPI generator or
documentation dependency is currently required.

Development/deployment dependencies are limited to:

- `wrangler`: Cloudflare's Worker build/deploy/local runtime tool.
- `typescript`: type checking and Worker source compilation.
- `@cloudflare/workers-types`: Cloudflare Worker binding types.
- `vite` and `@preact/preset-vite`: local/build tooling for the Preact shell.

The bearer identity adapter is for development only. `DEVELOPMENT_API_TOKENS` is
a comma-separated local map in `identity:token` form, such as:

```text
dev-owner:replace-with-random-token,dev-editor:another-random-token
```

Those identities and tokens are scoped to a single self-hosted instance. They do
not call or imply any central Downwrite authority.

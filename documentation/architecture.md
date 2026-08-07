# Downwrite Architecture

Downwrite is an open-source, self-hostable Markdown workspace app built around a
single Cloudflare Worker deployment.

## Product Shape

The Worker is the product core. It serves:

- Astro-rendered web routes and static assets;
- the versioned Hono API under `/api/v1`;
- discovery and OAuth metadata under `/.well-known/*`;
- OAuth authorization, token, and revocation routes under `/oauth/*`;
- a narrow authenticated MCP endpoint at `/mcp`;
- D1 metadata for identities, sessions, workspaces, documents, sharing records,
  WebAuthn state, and coarse rate limits;
- R2 Markdown document bodies;
- scheduled maintenance for expired operational auth/rate-limit records.

There is no central Downwrite service. A forked repository and a deployer's own
Cloudflare account are enough to run an isolated instance.

## Repository Boundaries

- `worker/` is the complete deployable Cloudflare Worker package.
- `worker/src/pages/` contains Astro web routes.
- `worker/web/src/` contains focused Preact islands and web components.
- `documentation/` is durable product, API, auth, deployment, and design
  documentation.
- `iOS/` is the future native-client planning home. It intentionally has no
  placeholder Xcode project.

## Implemented Web/API Capabilities

- Workspace/group list, create, update settings, and delete.
- Document create, read, update title/content, move between workspaces, reorder,
  delete, autosave, revision conflict handling, and Markdown preview.
- Document comment threads for review notes or selected Markdown snippets, plus
  manual document checkpoints.
- Collaborator invitations and direct collaborator management.
- Anonymous read-only public links.
- Passkey/WebAuthn browser sessions plus a localhost-only development session
  path for `wrangler dev`.
- Instance-local OAuth authorization code with PKCE for external clients.
- OpenAPI contract and local API docs.
- MCP JSON-RPC endpoint with tools for list workspaces, list documents, read
  document, create document, and update document.

## Authorization Model

Authenticated operations resolve to an instance-local identity. Workspaces and
documents use explicit `owner` and `editor` roles.

- `owner`: workspace settings, sharing controls, public links, document writes.
- `editor`: explicit document reads and writes.
- public link holder: anonymous read-only access to the linked Markdown.

The MCP endpoint authenticates at `/mcp`, derives a local identity, then calls
storage/domain methods. OAuth-authenticated requests must carry the `/mcp`
resource audience and include the `mcp:documents` scope. It does not forward
arbitrary bearer tokens into API handlers.

## Native and MCP Boundary

The external-client boundary is OAuth authorization code with PKCE, resource
indicators, audience validation, and scoped opaque tokens issued by each
self-hosted instance. The current public-client policy is deliberately narrow:
`downwrite-ios` may use `downwrite://oauth/callback`, and `downwrite-mcp` may use
loopback callback URLs. Configurable third-party HTTPS client registration is
future work, not a central Downwrite authority.

The intended iOS product remains one centrally distributed app that signs into
arbitrary self-hosted Downwrite instances through the system browser. See
[`../iOS/README.md`](../iOS/README.md).

## API Contract

The served OpenAPI contract at `/api/v1/openapi.json` is the machine-readable
source for implemented routes. The companion client contract and roadmap live
in:

- [`v1-client-contract.md`](./v1-client-contract.md)
- [`api-roadmap.md`](./api-roadmap.md)

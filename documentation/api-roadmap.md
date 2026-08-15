# Downwrite API Roadmap

This roadmap is an API-first gap audit. The OpenAPI `paths` object documents
implemented endpoints only. Proposed operations below are also mirrored in the
served OpenAPI document under `x-downwrite-api-roadmap`; they are not available
until implemented in the Worker.

## Implemented

- Workspace lifecycle: list, focused detail, create, update settings, delete.
- Documents: list within a workspace, create in a workspace, read, update
  title/content, move between workspaces, set workspace order position, delete.
- Comments: list/create document comment threads, add immutable replies, resolve
  and reopen threads, with document-level and selected Markdown text anchors.
- Versions: list, create, read, restore, and delete manual document checkpoints.
- Sharing: read share state, direct collaborator add/remove, invitation
  preview/create/accept/revoke, public-link create/detail/update, anonymous
  public-link read.
- Discovery/auth: well-known discovery, API discovery, health, auth status,
  OAuth protected-resource metadata, OAuth authorization-server metadata,
  authorization-code-with-PKCE, token refresh rotation, token revocation,
  passkey owner bootstrap, passkey login, session logout.
- Contract: OpenAPI JSON and local HTML documentation view.
- Pagination: workspace and per-workspace document lists accept optional
  `limit`/`cursor` query parameters and return `nextCursor` when another page is
  available.
- MCP: stateless JSON-RPC endpoint with list workspaces, list documents, read
  document, create document, and update document tools. OAuth-authenticated MCP
  access requires `mcp:documents`.

## Blocks Near-Term Screens

No known API endpoint gap currently blocks the existing workspace, document,
sharing, invitation, public-link, OAuth, or MCP screens. Future screen work
should start by checking the served OpenAPI paths before adding routes.

## Longer-Term Document API

- Content-focused update endpoint separate from metadata.
- Automatic revision-history APIs remain out of scope. Manual checkpoint APIs
  are implemented under document `/versions`.
- Import Markdown files into a workspace.
- Export one document or an entire workspace as Markdown/archive output.
- `baseRevision` is required for document update/move/reorder writes. Missing
  preconditions return `428 Precondition Required`; stale writes return
  `409 Conflict`. Explicit ETag or `If-Match` support remains future work.

## iOS Needs

- Build the iOS app around the implemented OAuth authorization code with PKCE
  flow through the system browser.
- `GET /api/v1/me` once broader account/profile UX exists.
- Configurable client registration if the product later supports third-party
  HTTPS redirect clients beyond the built-in iOS and MCP public clients.
- Cursor pagination is implemented for workspace/document lists. Native clients
  still need product-level sync policy decisions for when to refresh from the
  first page after local/offline mutations.
- Stable conflict semantics for autosave and offline retry behavior.

## MCP Needs

- Production MCP access uses OAuth authorization-code with PKCE, resource
  indicators, audience validation, and scoped access/refresh tokens.
- Keep the initial MCP tool set narrow: list workspaces, list documents, read
  document, create document, and update document.
- Avoid all-instance discovery/search endpoints by default.

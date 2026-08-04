# Downwrite API Roadmap

This roadmap is an API-first gap audit. The OpenAPI `paths` object documents
implemented endpoints only. Proposed operations below are also mirrored in the
served OpenAPI document under `x-downwrite-api-roadmap`; they are not available
until implemented in the Worker.

## Implemented

- Workspace lifecycle: list, create, update settings, delete.
- Documents: create in a workspace, read, update title/content, move between
  workspaces, set workspace order position, delete.
- Sharing: read share state, direct collaborator add/remove, invitation
  create/accept/revoke, public-link create/update, anonymous public-link read.
- Discovery/auth: well-known discovery, API discovery, health, auth status,
  OAuth protected-resource metadata, reserved OAuth authorization-server
  metadata, reserved OAuth 501 endpoints, passkey owner bootstrap, passkey
  login, session logout.
- Contract: OpenAPI JSON and local HTML documentation view.
- MCP: stateless JSON-RPC endpoint with list workspaces, list documents, read
  document, create document, and update document tools. Current access uses the
  development identity adapter only.

## Blocks Near-Term Screens

- `GET /api/v1/groups/{groupId}` for focused workspace detail.
- `GET /api/v1/groups/{groupId}/documents` for explicit document listing,
  future cursor pagination, and document ordering.
- `GET /api/v1/invitations/{token}` for invitation preview before accepting.
- `GET /api/v1/public-links/{publicLinkId}` for single-link management screens.

## Longer-Term Document API

- Content-focused update endpoint separate from metadata.
- Revision list/read endpoints for historical Markdown recovery.
- Import Markdown files into a workspace.
- Export one document or an entire workspace as Markdown/archive output.
- Optional `baseRevision` is implemented for document update/move/reorder writes
  and returns `409 Conflict` on stale writes. Explicit ETag or `If-Match`
  support remains future work.

## iOS Needs

- Implement OAuth authorization code with PKCE through the system browser.
- Implement short-lived access tokens and refresh-token rotation.
- `GET /api/v1/me` once broader account/profile UX exists.
- Cursor pagination for workspace/document lists.
- Stable conflict semantics for autosave and offline retry behavior.

## MCP Needs

- Production MCP access needs OAuth 2.1 authorization-code with PKCE, resource
  indicators, audience validation, and scoped access/refresh tokens.
- Add narrowly scoped token issuance/revocation before treating MCP as production
  external-client auth.
- Avoid all-instance discovery/search endpoints by default.

# Downwrite v1 Client Contract

This is the stable integration contract for the current self-hosted Worker API.
The served OpenAPI document at `/api/v1/openapi.json` remains the machine-readable
source for implemented routes.

## Base URLs

- Instance discovery: `GET /.well-known/downwrite`
- Protected resource metadata: `GET /.well-known/oauth-protected-resource`
- Authorization-server metadata: `GET /.well-known/oauth-authorization-server`
- Product API: `/api/v1`

The Worker is the resource server for `/api/v1`. OAuth authorization-code with
PKCE and resource indicators is implemented for external clients. Tokens are
opaque, scoped, and issued by the deployer's self-hosted Worker instance.

## Authentication

- Web production path: passkeys/WebAuthn plus `dw_session` httpOnly server-side
  session cookies.
- External-client path: OAuth authorization code with PKCE S256 through the
  system browser. Built-in public clients are `downwrite-ios` with
  `downwrite://oauth/callback` and `downwrite-mcp` with a loopback
  `http://127.0.0.1:{port}/callback` or `http://localhost:{port}/callback`.
- Current development/API smoke path: instance-local `Authorization: Bearer`
  tokens from `DEVELOPMENT_API_TOKENS`.
- Public links: anonymous, read-only, bearer-by-possession URL tokens.

Development bearer tokens are not product auth and must not be treated as a
central Downwrite account system.

## Errors

Errors are JSON envelopes:

```json
{
  "error": "Document not found",
  "code": "not_found",
  "status": 404
}
```

`error` is retained for older web code. New clients should branch on `code`.

## Markdown Documents

Document `content` fields contain UTF-8 Markdown source. The API does not return
rendered HTML. Clients are responsible for rendering previews safely.

Document update, move, and reorder writes may include `baseRevision`. If the
stored `revision` has changed since the client read it, the Worker returns
`409 Conflict` and leaves the document unchanged.

## Lists

Current workspace and document collections are unpaginated because this first
self-hosted slice is deliberately small. Future v1-compatible list expansion may
add optional `cursor` and `limit` query parameters plus a `nextCursor` response
field without changing item schemas.

## Permissions

- `owner`: workspace settings, sharing, public links, document reads/writes.
- `editor`: explicit document reads/writes.
- Public link holder: anonymous read of the linked Markdown document only.

MCP uses the same permission model as normal API clients. Initial safe MCP
mappings are list workspaces, list documents, read document, create document,
and update document. OAuth-authenticated MCP requests require `mcp:documents`.

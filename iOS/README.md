# Downwrite iOS

This directory is the planning home for the future Downwrite iOS client. It does
not contain an Xcode project yet.

## Product Direction

Downwrite should have one public iOS app distributed centrally. Users should
install that app once, enter or choose their self-hosted Downwrite instance base
URL, and sign into that instance. A Cloudflare deployment should not require its
own separately deployed iOS app.

## Server Contract Dependency

The current Worker already exposes the native-client discovery and contract
foundation:

- `GET /.well-known/downwrite`
- `GET /api/v1/discovery`
- `GET /api/v1/openapi.json`
- `GET /.well-known/oauth-protected-resource`
- `GET /.well-known/oauth-authorization-server`

The iOS app should treat the user-supplied instance URL as the trust boundary,
verify discovery metadata, then use the versioned `/api/v1` contract.

## Auth Boundary

The intended native flow is OAuth authorization code with PKCE through the
system browser:

1. User enters an instance base URL.
2. App reads `/.well-known/downwrite` and OAuth metadata.
3. App opens the instance authorization endpoint in the system browser.
4. User authenticates with the self-hosted instance.
5. App receives a short-lived authorization code and exchanges it for scoped
   tokens.

Direct native passkeys are not the required cross-instance mechanism because
Apple associated domains are per deployed domain.

Current status: production OAuth authorization and token issuance are not
implemented. `/oauth/authorize` and `/oauth/token` are reserved and return `501`
in the Worker until that server-side boundary is built.

## Phased Implementation Plan

1. Server readiness: keep discovery, OpenAPI, error envelopes, document
   revision semantics, and authorization scopes stable.
2. OAuth server slice: implement authorization-code-with-PKCE, resource
   indicators, token audience validation, refresh rotation, and revocation.
3. iOS skeleton: create the Swift project, instance URL entry, discovery
   verification, and system-browser sign-in.
4. Workspace/document client: list workspaces, list/read/create/update Markdown
   documents, and handle revision conflicts.
5. Sharing and offline polish: add invitation/public-link surfaces only after
   the core writing flow is reliable.

## Current Non-Goals

- No placeholder Xcode project.
- No fake native auth.
- No iOS-specific backend fork.
- No dependency on a central Downwrite service.

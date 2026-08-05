# Downwrite iOS

This directory contains the native Downwrite iOS client and planning notes.
The app lives in [`Downwrite/`](./Downwrite/) as a normal native Xcode project.

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

API compatibility and instance freshness are separate. The app should use
`api.supportedVersions` from discovery to decide whether it can connect to an
instance. A future `software.version` field can be compared with the GitHub
release manifest to show a non-blocking instance update notice, but an older
v1-compatible instance should remain usable unless a specific feature requires
newer server behavior. See
[`../documentation/versioning-and-updates.md`](../documentation/versioning-and-updates.md).

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

Current Worker status: OAuth authorization, token exchange, refresh rotation,
and revocation are implemented instance-locally. The reserved public iOS client
id is `downwrite-ios`, with `downwrite://oauth/callback` as the allowed callback.
The iOS app itself is still deferred.

## Phased Implementation Plan

1. Server readiness: keep discovery, OpenAPI, error envelopes, document
   revision semantics, OAuth public-client policy, and authorization scopes
   stable.
2. iOS skeleton: create the Swift project, instance URL entry, discovery
   verification, and system-browser sign-in. Initial implementation exists.
3. Workspace/document client: list workspaces, list/read/create/update Markdown
   documents, and handle revision conflicts. Initial implementation exists.
4. Sharing and offline polish: add invitation/public-link surfaces only after
   the core writing flow is reliable.

## Current Non-Goals

- No XcodeGen. When iOS implementation begins, use and maintain a normal native
  Xcode project.
- No fake native auth.
- No iOS-specific backend fork.
- No dependency on a central Downwrite service.

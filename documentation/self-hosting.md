# Self-Hosting and Local Development

Downwrite deploys as one Cloudflare Worker. The same Worker serves the web app
and the API from one origin.

## Local First Run

From the repository root:

```bash
npm install
npm run dev:worker
```

`npm run dev:worker` runs the Worker package dev script. On first run it:

1. creates `worker/.dev.vars` with random local-only secrets if the file is
   missing;
2. applies local D1 migrations for Wrangler;
3. builds the Preact app into `worker/web/dist`;
4. starts `wrangler dev`, normally at `http://localhost:8787`.

Open the local URL in a browser. For the fastest local browser path:

1. Choose the `Development` tab in the auth panel.
2. Select `Start local owner session`.
3. Create a workspace.
4. Open the workspace and create a Markdown document.

The development sign-in button is only enabled on localhost when
`DOWNWRITE_LOCAL_AUTH=1` is present in `worker/.dev.vars`. It creates a normal
httpOnly Downwrite session cookie and does not require manually entering a
development bearer token in the browser. It is not production authentication.

## Passkey Bootstrap Testing

For passkey bootstrap testing, edit `worker/.dev.vars` or create it from
`worker/.dev.vars.example`:

```text
DOWNWRITE_LOCAL_AUTH=1
DEVELOPMENT_API_TOKENS=dev-owner:replace-with-a-random-local-token,dev-editor:replace-with-another-random-local-token
AUTH_BOOTSTRAP_TOKEN=replace-with-a-random-one-time-owner-setup-token
WEBAUTHN_RP_NAME=Downwrite
```

The web UI can bootstrap the first owner passkey with `AUTH_BOOTSTRAP_TOKEN`.
After that, users sign in with passkeys and receive httpOnly server-side session
cookies.

Session cookies are `Secure`, `HttpOnly`, and `SameSite=Lax` on production
origins. Localhost HTTP omits `Secure` so local passkey/session testing works
without external deployment. Cookie-authenticated write requests require a
same-origin `Origin` header.

## External Clients

Each self-hosted Worker instance issues its own OAuth authorization-code-with-PKCE
tokens for external clients. The public metadata is available at:

- `GET /.well-known/downwrite`
- `GET /.well-known/oauth-protected-resource`
- `GET /.well-known/oauth-authorization-server`

The current built-in public clients are deliberately narrow: `downwrite-ios`
uses `downwrite://oauth/callback`, and `downwrite-mcp` uses loopback callback
URLs such as `http://127.0.0.1:49152/callback`. Tokens are opaque, stored only as
hashes in D1, and revocable through `POST /oauth/revoke`. API/iOS clients request
the instance `/api/v1` resource. MCP clients request the instance `/mcp` resource
with `mcp:documents`.

OAuth consent is bound to a short-lived server-side authorization transaction.
The approval form posts only that transaction token, so hidden form fields cannot
change the validated client, redirect URI, scopes, resource, PKCE challenge, or
state after the consent page is rendered. There is no third-party dynamic client
registration yet; production deployments should configure `INSTANCE_PUBLIC_URL`
and `WEBAUTHN_RP_ID` to match the public origin.

## Deploy to Cloudflare

The root README and Worker README expose Cloudflare's official Deploy to
Cloudflare button for the isolated `worker/` directory:

```md
[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/charliewilco/downwrite/tree/main/worker)
```

The deployable Worker remains isolated in `worker/` because Cloudflare's button
flow needs a directory with its own dependencies and Wrangler configuration.

`worker/wrangler.toml` declares:

- Workers Static Assets from `worker/web/dist`;
- Worker-first routing for `/api/*`, `/.well-known/*`, `/oauth/*`, and `/mcp`;
- D1 binding `DB`;
- R2 binding `CONTENT`;
- a daily scheduled maintenance trigger that removes expired sessions, WebAuthn
  challenges, OAuth credentials, and rate-limit rows from D1;
- `WEBAUTHN_RP_NAME` plus optional production `WEBAUTHN_RP_ID` and
  `INSTANCE_PUBLIC_URL`;
- secrets such as `AUTH_BOOTSTRAP_TOKEN`.

Do not set `DOWNWRITE_LOCAL_AUTH=1` in production. It is only for local
`wrangler dev`.

## Worker Commands

From the repository root:

```bash
npm run dev:worker
npm run typecheck
npm test
npm run build
npm run validate
```

From `worker/`:

```bash
npm run dev
npm run dev:api
npm run dev:web
npm run build
npm run validate:worker
npm run deploy
```

`npm run deploy` builds the API and Preact assets, applies remote D1 migrations,
and deploys with Wrangler. Do not run it unless you intend to deploy to your own
Cloudflare account.

No repository command provisions remote Cloudflare resources unless the deployer
explicitly runs a deploy/provisioning flow.

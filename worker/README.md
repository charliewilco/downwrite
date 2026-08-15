# Downwrite Worker

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/charliewilco/downwrite/tree/main/worker)

This is the isolated deployable Cloudflare Worker package for Downwrite. It is
self-contained for Cloudflare's Deploy to Cloudflare button and includes:

- Hono Worker API source in `src/`;
- D1 migrations in `migrations/`;
- Astro page source in `src/pages/`;
- focused browser custom elements and the editor island in `src/client/`;
- Wrangler configuration in `wrangler.toml`;
- Node-native tests in `test/`.

The deployed Worker serves Astro-rendered web routes and `/api/v1` from the
same origin. Hono handles `/api/*`, `/.well-known/*`, `/oauth/*`, and `/mcp`;
Astro handles browser routes and static assets.

## Local Development

From this directory:

```bash
npm install
npm run dev
```

The dev script prepares generated local secrets, applies local D1 migrations,
and starts Astro dev with Cloudflare bindings, normally at
`http://localhost:4321`.

For the full local first-run flow, see
[`../documentation/self-hosting.md`](../documentation/self-hosting.md).

## API Contract

The running Worker serves:

- `GET /api/v1/openapi.json`
- `GET /api/v1/docs`
- `GET /.well-known/downwrite`
- `GET /.well-known/oauth-protected-resource`
- `GET /.well-known/oauth-authorization-server`

Durable API documentation lives in:

- [`../documentation/v1-client-contract.md`](../documentation/v1-client-contract.md)
- [`../documentation/api-roadmap.md`](../documentation/api-roadmap.md)

Downwrite software releases are versioned separately from the `/api/v1`
compatibility contract. See
[`../documentation/versioning-and-updates.md`](../documentation/versioning-and-updates.md)
for the update discovery model.

## Deploy

```bash
npm run deploy
```

This builds API and web assets, applies remote D1 migrations, and deploys with
Wrangler. Do not run it unless you intend to deploy to your own Cloudflare
account.

Production deployments should configure passkey origin settings and secrets in
the deployer's Cloudflare account. Do not set `DOWNWRITE_LOCAL_AUTH=1` in
production.

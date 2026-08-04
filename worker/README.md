# Downwrite Worker

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/charliewilco/downwrite/tree/main/worker)

This is the isolated deployable Cloudflare Worker package for Downwrite. It is
self-contained for Cloudflare's Deploy to Cloudflare button and includes:

- Hono Worker API source in `src/`;
- D1 migrations in `migrations/`;
- Preact web source in `web/`;
- Wrangler configuration in `wrangler.toml`;
- Node-native tests in `test/`.

The deployed Worker serves the compiled web app and `/api/v1` from the same
origin. Workers Static Assets handle browser routes, while `/api/*`,
`/.well-known/*`, `/oauth/*`, and `/mcp` run through the Worker script first.

## Local Development

From the repository root:

```bash
npm install
npm run dev:worker
```

From this directory:

```bash
npm run dev
```

The dev script prepares generated local secrets, applies local D1 migrations,
builds the Preact assets, and starts `wrangler dev`, normally at
`http://localhost:8787`.

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

# Downwrite

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/charliewilco/downwrite/tree/main/worker)

Downwrite is an open-source, self-hostable Markdown workspace app. The product
ships as one Cloudflare Worker deployment: the Worker serves the Preact web app,
the versioned Hono API, D1 metadata, R2 Markdown storage, auth/session
boundaries, public links, and the narrow MCP endpoint from the same origin.

There is no centrally operated Downwrite service. A developer should be able to
fork or clone this repository and deploy an isolated instance into their own
Cloudflare account.

## Repository Layout

- [`worker/`](./worker/) is the deployable Cloudflare Worker package. It includes
  the API, D1 migrations, Wrangler config, Preact web source, and Worker-local
  tests.
- [`documentation/`](./documentation/) is the durable product and architecture
  documentation home.
- [`iOS/`](./iOS/) is the native-client planning home for the future single
  public Downwrite iOS app. No app source exists yet.

## Start Locally

```bash
cd worker
npm install
npm run dev
```

The local Worker normally starts at `http://localhost:8787`. Use the
`Development` tab in the app to start a local owner session, then create a
workspace and Markdown document.

Detailed setup and deployment instructions live in
[`documentation/self-hosting.md`](./documentation/self-hosting.md).

## Key Documents

- [Architecture](./documentation/architecture.md)
- [Self-hosting and local development](./documentation/self-hosting.md)
- [v1 client contract](./documentation/v1-client-contract.md)
- [API roadmap](./documentation/api-roadmap.md)
- [Design QA](./documentation/design-qa.md)
- [iOS direction](./iOS/README.md)

## Validation

From `worker/`:

```bash
cd worker
npm run validate
```

Tests use Node's built-in test runner. No Jest, Vitest, UI framework, or test
framework dependency is used.

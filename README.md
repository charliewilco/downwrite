# Downwrite

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/charliewilco/downwrite/tree/main/worker)

> A place to write.

Downwrite is a small, open-source Markdown workspace for people who want their
writing to stay portable. Write in Markdown, keep the files in an instance you
control, and share a document only when you mean to.

The idea is still the simple one: writing tools come and go, but Markdown keeps
showing up because it is plain text with enough structure to travel well. A
document can be an essay, a note, a blog post, a README, an archive, or the
beginning of something larger. Downwrite treats that as the useful part, not as
an implementation detail to hide away.

There is no centrally operated Downwrite service. Fork or clone this repository,
deploy it into your own Cloudflare account, and you have an isolated workspace
with its own storage, auth boundary, and public links.

## What It Does

- Write and organize Markdown documents in a browser.
- Store document metadata in D1 and Markdown bodies in R2.
- Sign in to your own instance with passkeys, with a local development shortcut
  for first-run setup.
- Share selected documents through public links.
- Serve the web app, API, auth endpoints, storage access, and narrow MCP endpoint
  from one Cloudflare Worker origin.
- Keep a versioned `/api/v1` contract for future native clients.

## Why Markdown

Markdown is probably the most useful compromise between syntax, semantics, and
plain text durability. It is readable before anything renders it, familiar across
writing tools and developer tools, and easy to move into a static site, docs
system, issue tracker, notes app, or archive.

Bottom line: Markdown is data. Downwrite is built around keeping that data
legible and portable.

## Start Locally

```bash
cd worker
npm install
npm run dev
```

The local web app normally starts at `http://localhost:4321`. Use the
`Development` tab in the app to start a local owner session, then create a
workspace and Markdown document.

Detailed setup and deployment instructions live in
[`documentation/self-hosting.md`](./documentation/self-hosting.md).

## Deploy

Use the Cloudflare button above, or deploy from the Worker package:

```bash
cd worker
npm run deploy
```

Deploying applies remote D1 migrations and publishes the Worker to the
Cloudflare account configured in Wrangler. Production instances should configure
passkey origin settings and secrets in that account.

## Repository Layout

- [`worker/`](./worker/) is the deployable Cloudflare Worker package. It includes
  the Hono API, Astro web routes, D1 migrations, Wrangler config, focused
  Preact/web-component browser islands, Worker-local tests, and Deploy to
  Cloudflare metadata.
- [`documentation/`](./documentation/) is the durable product and architecture
  documentation home.
- [`iOS/`](./iOS/) contains the native Xcode project and generated Swift client
  for the single public Downwrite iOS app.

## Key Documents

- [Architecture](./documentation/architecture.md)
- [Self-hosting and local development](./documentation/self-hosting.md)
- [Versioning and updates](./documentation/versioning-and-updates.md)
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

## License

[MIT](./LICENSE)

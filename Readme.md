# Downwrite v3

Downwrite is a markdown-first document hub for people and agents. It ingests markdown, versions it, makes it searchable, exposes it over HTTP and MCP, and lets teams annotate exact quotes on immutable document versions.

This repository now contains the v3 Hono implementation:

- `Hono + server-rendered HTML + HTMX-compatible partials`
- `Postgres + pgvector`
- `Prisma schema and migrations`
- `Better Auth with the Prisma adapter`
- `Biome formatting and linting`
- OCI-first container definition via `Containerfile`
- server-rendered UI with small JS islands
- document versioning
- immutable share URLs
- quote-anchored annotations and threaded replies
- hybrid search
- MCP read tools with config-gated writes

## Current state

The Hono runtime lives under `src/`, with `src/server.ts` as the entrypoint.

## Implementation direction

Database-layer work is built around Prisma, Prisma migrations, Postgres, and pgvector. Do not replace that direction with Drizzle or Kysely without explicit approval. If Prisma cannot model a pgvector feature cleanly, keep the limitation documented and use raw SQL migrations or typed raw queries only for that narrow gap.

Document diff rendering starts with a simple text diff API and a clean side-by-side UI placeholder. The intended product direction is closer to [diffs.com](https://diffs.com/): readable comparison, clear insertions and deletions, document/version metadata, source and provenance context, and restrained rendering that is easy to scan.

Client-side behavior should stay limited by default. Prefer server-rendered HTML, Hono-rendered views, form posts, progressive enhancement, and small Preact islands only where they materially improve workflows. Reserve heavier interaction for side-by-side document viewing, merge canvas, document stacks, diff viewer enhancements, query playgrounds, and retrieval trace inspection.

Authentication uses Better Auth mounted under `/api/auth/*` with the Prisma adapter. Keep auth changes inside that integration unless there is a clear reason to extend it; do not reintroduce bespoke password hashing or hand-rolled session storage.

Testing should stay boring and fast by default. Use Node's built-in test runner for unit and service-level tests, and reserve Playwright for end-to-end browser coverage.

## Container policy

Downwrite is OCI-first and Docker-optional.

- The canonical image definition lives in [`Containerfile`](/Users/charliewilco/Developer/downwrite/Containerfile).
- Local macOS development may use Apple's `container` CLI.
- Docker Desktop is not required for local development.
- CI should not depend on Apple's container runtime.
- The project should avoid Docker-specific runtime assumptions.

## Getting started

1. Create a Postgres database.
2. Set environment variables:

```bash
export DOWNWRITE_ADDR=:7878
export DOWNWRITE_DATABASE_URL=postgres://localhost:5432/downwrite?sslmode=disable
export DOWNWRITE_SESSION_SECRET=change-me
export DOWNWRITE_MCP_WRITE_ENABLED=false
```

3. Install dependencies, apply migrations, and run the server:

```bash
npm ci
npm run prisma:deploy
npm run dev
```

Prisma migration files are the canonical schema-change artifact. The Hono runtime does not apply embedded startup schema DDL.

## Local Apple container workflow

If you're using Apple's `container` tooling on Apple silicon macOS, the intended local flow is:

```bash
container build -t downwrite:dev .
container run \
	--rm \
	-e DOWNWRITE_ADDR=:7878 \
	-e DOWNWRITE_DATABASE_URL='postgres://host.local:5432/downwrite?sslmode=disable' \
	-e DOWNWRITE_SESSION_SECRET='change-me' \
	-e DOWNWRITE_MCP_WRITE_ENABLED=false \
	-p 7878:7878 \
	downwrite:dev
```

Notes:

- This project uses a plain OCI `Containerfile`, not Docker-specific build features.
- Postgres should run separately; this repository does not assume Compose as part of the contract.
- If your local database is outside the container, adapt the hostname for your environment.
- CI should run TypeScript checks, Prisma validation, and the container build.

## Useful commands

```bash
npm run check
npm run lint
npm test
npm run test:e2e
npm run build
npm run prisma:validate
container build -t downwrite:dev .
```

## Product scope in this implementation

- account creation and login
- personal workspace bootstrap on signup
- document creation and versioning
- immutable share links
- inline quote annotations and threaded replies
- workspace activity feed
- API endpoints for documents, versions, search, ingest, shares, annotations
- MCP endpoint at `/mcp`

## Not yet implemented

- advanced file sync sources
- external embedding providers
- approval workflows for agent writes
- live collaboration or presence
- production-grade access control beyond workspace membership and public shares

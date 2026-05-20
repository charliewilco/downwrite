# Downwrite v3

Downwrite is a markdown-first document hub for people and agents. It ingests markdown, versions it, makes it searchable, exposes it over HTTP and MCP, and lets teams annotate exact quotes on immutable document versions.

This repository contains the v3 Go rewrite:

- `Go + Gin + HTMX`
- `Postgres`
- OCI-first container definition via `Containerfile`
- server-rendered UI with small JS islands
- document versioning
- immutable share URLs
- quote-anchored annotations and threaded replies
- hybrid search
- MCP read tools with config-gated writes

## Current state

The legacy `Next.js + GraphQL + Mongo + Draft.js` app has been removed. The entrypoint is the Go service under `cmd/downwrite`.

## Container policy

Downwrite is OCI-first and Docker-optional.

- The canonical image definition lives in [`Containerfile`](Containerfile).
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

3. Run the server:

```bash
go run ./cmd/downwrite
```

The service applies its embedded schema at startup.

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
- GitHub Actions remains plain `go test` and `go build` for portability.

## Useful commands

```bash
go test ./...
go build ./cmd/downwrite
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

# Repository Guidelines

## Project Structure & Module Organization

Downwrite v3 is a Go document hub. The primary runtime starts at `cmd/downwrite/main.go`, with application code in `internal/app/`. Templates live in `internal/app/templates/`, browser assets in `internal/app/static/`, and database schema setup in `internal/app/schema.sql`. Container notes are in `docs/containers.md`; the canonical OCI image definition is `Containerfile`.

## Build, Test, and Development Commands

- `go run ./cmd/downwrite`: run the current Go service locally. Requires `DOWNWRITE_DATABASE_URL` and `DOWNWRITE_SESSION_SECRET`.
- `go test ./...`: run all Go tests.
- `go build ./cmd/downwrite`: compile the Go entrypoint.
- `container build -t downwrite:dev .`: build the OCI image using the repository `Containerfile`.

## Coding Style & Naming Conventions

Prefer tabs for indentation where the language/tooling supports it. Go code must remain `gofmt`/`go test` friendly; keep package names short and lowercase. Keep HTTP handlers, store methods, and template names descriptive and aligned with domain terms such as documents, versions, annotations, and workspaces.

## Testing Guidelines

Place Go tests beside the code under test using `*_test.go`. Prefer focused tests around persistence, request handling, markdown rendering, search, and security boundaries. Use fixtures/helpers from `internal/app/test_helpers_test.go` when extending app tests.

## Commit & Pull Request Guidelines

Recent history uses short, imperative commits, often with Conventional Commit prefixes such as `docs:`, `test:`, and `feat:`. Keep commits scoped and readable, for example `test: add search coverage`.

Pull requests should explain the behavior change, list verification commands run, link related issues, and include screenshots for visible UI changes. Call out production-sensitive changes involving auth, data storage, MCP write access, or runtime assumptions.

## Security & Configuration Tips

Do not commit real secrets. Local development needs explicit environment variables such as `DOWNWRITE_DATABASE_URL`, `DOWNWRITE_SESSION_SECRET`, `DOWNWRITE_ADDR`, and `DOWNWRITE_MCP_WRITE_ENABLED`. Keep the project OCI-compatible and avoid Docker-specific or Compose-only assumptions.

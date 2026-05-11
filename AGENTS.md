# Repository Guidelines

## Project Structure & Module Organization

Downwrite v3 is a Hono document hub. The primary runtime starts at `src/server.ts`, with Hono route handlers, server-rendered views, and browser assets under `src/`. The canonical database contract lives in `prisma/schema.prisma` and `prisma/migrations/`. Container notes are in `docs/containers.md`; the canonical OCI image definition is `Containerfile`.

## Implementation Direction

For database-layer work, use Prisma, not Drizzle or Kysely. The persistence stack is Prisma schema, Prisma migrations, Postgres, and pgvector. If Prisma has limitations around pgvector support, document the limitation clearly and use raw SQL migrations or typed raw queries only where necessary. Do not switch to Drizzle or Kysely without explicit approval.

Keep client-side interactions limited. Prefer server-rendered HTML, Hono-rendered views, form posts, progressive enhancement, and small Preact islands only where interaction genuinely improves the workflow. LitElement/Web Components are acceptable for portable interactive primitives. Avoid large SPA architecture, client-heavy routing, excessive client state, Notion-style UI complexity, and early drag-and-drop frameworks.

Reserve richer client-side interactivity for high-value areas: side-by-side document viewing, merge canvas, document stack interactions, diff viewer enhancements, query playground, and retrieval trace inspection. Everything else should stay boring, server-rendered, and easy to reason about.

For document diffs, use https://diffs.com/ as the visual and product reference. Start with a simple text diff API and clean UI placeholder; do not overbuild v1. The intended direction is readable side-by-side comparison with clear insertions/deletions, document/version metadata, source/provenance context, easy human scanning, and beautiful but restrained rendering.

Use Better Auth for authentication, mounted through Hono under `/api/auth/*` with the Prisma adapter. Do not reintroduce bespoke password hashing, custom session tables, or hand-rolled auth flows unless explicitly approved.

## Build, Test, and Development Commands

- `npm run dev`: run the Hono service locally. Requires `DOWNWRITE_DATABASE_URL` and `DOWNWRITE_SESSION_SECRET`.
- `npm run check`: type-check the Hono runtime.
- `npm run lint`: run Biome checks.
- `npm test`: run unit and service-level tests with Node's built-in test runner.
- `npm run test:e2e`: run Playwright end-to-end tests.
- `npm run seed:test-user`: create or repair the local Better Auth test user.
- `npm run build`: compile the Hono runtime into `dist/`.
- `npm run prisma:validate`: validate the Prisma schema.
- `npm run prisma:deploy`: apply Prisma migrations.
- `container build -t downwrite:dev .`: build the OCI image using the repository `Containerfile`.

## Coding Style & Naming Conventions

Prefer tabs for indentation where the language/tooling supports it. TypeScript must remain `tsc` and Biome friendly. Keep Hono handlers, store functions, and view helpers descriptive and aligned with domain terms such as documents, versions, annotations, and workspaces.

## Testing Guidelines

Use Node's built-in test runner as the default for unit and service-level tests. Prefer focused tests around persistence, request handling, markdown rendering, search, and security boundaries. Use Playwright for browser-level end-to-end coverage.

## Commit & Pull Request Guidelines

Recent history uses short, imperative commits, often with Conventional Commit prefixes such as `docs:`, `test:`, and `feat:`. Keep commits scoped and readable, for example `test: add search coverage`.

Pull requests should explain the behavior change, list verification commands run, link related issues, and include screenshots for visible UI changes. Call out production-sensitive changes involving auth, data storage, MCP write access, or runtime assumptions.

## Security & Configuration Tips

Do not commit real secrets. Local development needs explicit environment variables such as `DOWNWRITE_DATABASE_URL`, `DOWNWRITE_SESSION_SECRET`, `DOWNWRITE_ADDR`, and `DOWNWRITE_MCP_WRITE_ENABLED`. Keep the project OCI-compatible and avoid Docker-specific or Compose-only assumptions.

# Prisma and pgvector

Downwrite's database contract is Prisma-first: schema changes should start in `prisma/schema.prisma` and be applied through Prisma migrations.

The Hono runtime uses Prisma Client. Raw SQL is intentionally limited to:

- Prisma migration SQL for PostgreSQL features Prisma cannot fully express.
- Runtime queries that read and write `pgvector` values, full-text search vectors, and ranking expressions.

Known Prisma limitations in this schema:

- `pgvector` columns are represented as `Unsupported("vector(32)")`.
- The generated `tsvector` column is ignored in the Prisma Client model and owned by SQL migration DDL.
- The HNSW vector index and GIN full-text index are created in migration SQL.

Do not replace Prisma with Drizzle or Kysely without explicit approval.

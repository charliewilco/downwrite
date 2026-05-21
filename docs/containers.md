# Containers

Downwrite is OCI-first and Docker-optional.

## Policy

- Use [`Containerfile`](/Users/charliewilco/Developer/downwrite/Containerfile) as the canonical image definition.
- Prefer Apple's `container` CLI for local macOS development when working on Apple silicon.
- Do not make the application depend on Docker-specific behavior.
- Keep CI portable and independent from Apple's local container runtime.

## Local build

```bash
container build -t downwrite:dev .
```

## Local run

```bash
container run \
	--rm \
	-e DOWNWRITE_ADDR=:7878 \
	-e DOWNWRITE_DATABASE_URL='postgres://host.local:5432/downwrite?sslmode=disable' \
	-e DOWNWRITE_SESSION_SECRET='change-me' \
	-e DOWNWRITE_MCP_WRITE_ENABLED=false \
	-p 7878:7878 \
	downwrite:dev
```

## Design constraints

- Build OCI-compatible images.
- Avoid Docker daemon assumptions.
- Avoid Compose-specific project coupling.
- Prefer explicit environment variables over runtime-specific magic.

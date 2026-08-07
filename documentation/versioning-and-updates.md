# Versioning and Updates

Downwrite has several separate version concepts. They answer different questions
and should not be collapsed into one field.

## API Version

The product API is currently `/api/v1`. This is the compatibility contract used
by the web app, the public iOS app, and external clients such as MCP.

Within v1, changes should be additive and backwards compatible. A v1 client
should not break because a self-hosted instance adds a new optional field,
endpoint, capability, or OAuth scope. Breaking changes require a new base path,
such as `/api/v2`, while preserving v1 for existing clients until a deliberate
deprecation window exists.

The iOS app should use `/.well-known/downwrite` and
`api.supportedVersions` to decide whether it can talk to an instance. If `v1` is
supported, the app can use the v1 contract. If a future instance supports only
an API major the app does not understand, the app should block sign-in with a
clear compatibility message.

## Software Version

The Downwrite Worker release version answers a different question: whether a
self-hosted installation is running the latest Downwrite software.

Use SemVer for Worker releases:

- patch releases fix bugs or make compatible additions;
- minor releases add compatible features;
- major releases may introduce a new API major or other operator-visible
  breaking changes.

The Worker package version and GitHub release tag should be the source release
identity. The served discovery metadata should eventually expose a `software`
object like:

```json
{
  "software": {
    "name": "downwrite",
    "version": "1.0.0",
    "apiMajor": "v1",
    "schemaVersion": 6,
    "buildSha": "abc123",
    "releaseChannel": "stable",
    "updateCheckUrl": "https://raw.githubusercontent.com/charliewilco/downwrite/main/releases/stable.json"
  }
}
```

This is future implementation guidance. The current runtime discovery contract
already exposes API compatibility metadata, but it does not yet expose Worker
software release metadata.

## Schema Version

The schema version is the latest D1 migration level expected by the running
Worker. It exists so operators and clients can distinguish code compatibility
from database readiness.

For v1, schema changes should remain compatible with the served v1 API. A
release that requires remote migrations should say so clearly in release notes
and in the machine-readable update manifest.

## Document Checkpoints

Manual document checkpoints are product data, not API, software, or schema
versions. They are explicit user-created snapshots of a document title and
Markdown content at a source document `revision`.

The live document `revision` remains the write fence for autosave, move,
reorder, comment anchor creation, checkpoint creation, and checkpoint restore.
Creating a checkpoint does not increment the live revision. Restoring a
checkpoint writes the checkpoint title/content into the live document and does
increment the live revision.

## Update Manifest

Downstream installations should compare their local software metadata with a
small GitHub-hosted release manifest. GitHub Releases remain the human-readable
source of truth; the manifest is the machine-readable companion for iOS,
operator tooling, and a future admin UI.

Proposed stable manifest shape:

```json
{
  "stable": {
    "version": "1.0.1",
    "releasedAt": "2026-08-05T00:00:00Z",
    "apiMajor": "v1",
    "minSupportedApiMajor": "v1",
    "schemaVersion": 6,
    "migrationRequired": false,
    "releaseNotesUrl": "https://github.com/charliewilco/downwrite/releases/tag/v1.0.1"
  }
}
```

Self-hosted Workers should not silently phone home by default. Update checks
should be explicit: client-side in the public iOS app, operator-initiated in
tooling, or admin-initiated in a future web UI.

## Client Behavior

The iOS app should treat API support and software freshness separately:

- `api.supportedVersions` gates whether the app can connect.
- `software.version` compared with the update manifest may produce a
  non-blocking instance update notice.
- future additive features should be gated by capabilities or minimum server
  version, not by assuming every v1 instance has every v1-era feature.

An old but v1-compatible instance should still be usable unless the requested
feature requires newer server behavior. A server that does not support any API
major the app understands should be rejected before OAuth sign-in.

## Operator Update Flow

To update a self-hosted instance:

1. Read the GitHub release notes for the target Downwrite version.
2. Sync the repository or fork to the release commit or tag.
3. From `worker/`, run `npm run validate` before deploying.
4. Confirm whether the release requires D1 migrations.
5. Run `npm run deploy` when ready to apply remote migrations and publish the
   Worker.
6. Smoke-test `GET /api/v1/health`, `GET /.well-known/downwrite`, and
   `GET /api/v1/openapi.json`.

The public iOS app is installed once from its normal distribution channel.
Updating a self-hosted Downwrite instance means redeploying the Worker, not
shipping a deployment-specific iOS app.

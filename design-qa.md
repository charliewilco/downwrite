# Downwrite Visual QA

final result: desktop single-Worker routes passed; fresh narrow-viewport verification is still limited by the available browser tooling

## Source Target

- File: `/Users/charlie/.codex/generated_images/019fccc6-8914-73e1-8891-4bff6eea5722/exec-819e9a6d-a0f0-498c-b495-03822f1a9862.png`
- Target qualities: original Downwrite style, dark graphite workspace rail, warm-white editorial canvas, crisp monochrome typography, thin dividers, generous whitespace, and high-contrast primary action.
- Boundary: the implementation uses the source visual principles only. It does not add unrelated mock-only product areas such as tags, templates, storage administration, users, or system screens.

## Evidence Captured

- Light workspace home: `.codex/design-qa/downwrite-light.png`
- Dark workspace home: `.codex/design-qa/downwrite-dark.png`
- Dark document editor/detail: `.codex/design-qa/downwrite-document-dark.png`
- Dark sharing panel: `.codex/design-qa/downwrite-share-dark.png`
- Dark workspace settings: `.codex/design-qa/downwrite-settings-dark.png`
- Dark mobile viewport: `.codex/design-qa/downwrite-mobile-dark.png`
- Single-Worker workspace directory: `.codex/design-qa/downwrite-worker-directory.jpg`
- Single-Worker workspace detail: `.codex/design-qa/downwrite-worker-workspace.jpg`
- Single-Worker document editor/detail: `.codex/design-qa/downwrite-worker-document.jpg`
- Single-Worker sharing route: `.codex/design-qa/downwrite-worker-sharing.jpg`
- Single-Worker invitation acceptance route: `.codex/design-qa/downwrite-worker-invitation.jpg`
- Single-Worker anonymous public document route: `.codex/design-qa/downwrite-worker-public.jpg`
- Single-Worker workspace settings route: `.codex/design-qa/downwrite-worker-settings.jpg`

The browser was verified through real `prefers-color-scheme` states by temporarily switching macOS appearance from dark to light and restoring dark afterward. The app exposes no theme override control and no persisted theme preference.

## Comparison Notes

- P0: none found.
- P1: none remaining. The selected workspace home now matches the target's main hierarchy: persistent graphite rail, editorial canvas, oversized workspace heading, thin dividers, list-row documents, and high-contrast New document action.
- P2 fixed during QA: the passkey/bootstrap rail form initially squeezed inputs and action text. The rail auth form now stacks vertically.
- P2 fixed during QA: the document detail title initially truncated a normal document title at desktop width. The editor title scale was reduced so `First self-hosted note` fits in the pane.

## Flow Coverage

- Workspace directory: verified `http://localhost:8787/` served by the Worker static asset path, with one demo workspace, one intended demo document, bootstrap-required rail state, and workspace creation controls.
- Workspace detail: verified `http://localhost:8787/workspaces/d032e433-40b9-41e0-ac79-57bae4bbd2bc`, with project description, Share, Settings, New document, document list, and ordering controls.
- Workspace settings: verified `http://localhost:8787/workspaces/d032e433-40b9-41e0-ac79-57bae4bbd2bc/settings`, with separate workspace administration, save, and delete controls.
- Document detail/editor: verified `http://localhost:8787/documents/6291ee46-b6a1-4c84-8d1f-b47b828520b0`, with workspace navigation, save state, share route transition, delete, move-workspace panel, Markdown editor, and rendered Markdown preview.
- Sharing: verified `http://localhost:8787/workspaces/d032e433-40b9-41e0-ac79-57bae4bbd2bc/share?document=6291ee46-b6a1-4c84-8d1f-b47b828520b0`, with document picker, collaborator list, invitation controls, pending/revoked state, public-link controls, and route-copy URLs.
- Invitation acceptance: created a temporary invite for `dev-editor`, opened `/invitations/:token`, entered `editor-token` through the development-token UI, clicked Accept invitation, and verified redirect to the invited document.
- Anonymous public reading: created a temporary public link, opened `/public/:token`, and verified read-only Markdown rendering through the public-link API under the same Worker origin.
- Single-Worker deployment shape: `curl http://localhost:8787/` returned compiled Preact `index.html`; `curl http://localhost:8787/workspaces/not-real` returned the SPA fallback; `curl http://localhost:8787/api/v1/health` returned `{"ok":true,"name":"downwrite-api","version":"v1"}`; `curl http://localhost:8787/.well-known/downwrite` returned discovery metadata with `baseUrl` on the same `http://localhost:8787` origin.
- Cleanup: temporary QA invitations, public links, and `dev-editor` collaborator rows were removed from the local D1 database after route verification.

## Theme Coverage

- Light state: `matchMedia("(prefers-color-scheme: dark)").matches` returned `false`; computed `color-scheme` was `light`; rail background was graphite; canvas background was warm white; primary action was black with white text.
- Dark state: `matchMedia("(prefers-color-scheme: dark)").matches` returned `true`; computed `color-scheme` was `dark`; rail and canvas use separate dark tokens; primary action switches to warm light with dark text.

## Limits

- The current local auth setup still shows bootstrap-required/development controls in the rail because no production passkey bootstrap is configured locally. This is product state, not a visual-system failure.
- Full-page screenshot capture in the in-app browser was unreliable after client-side document navigation, so document/share/settings evidence uses viewport screenshots plus DOM/computed-layout checks.
- Current final-pass browser tooling did not expose viewport or media emulation. The previous mobile and light/dark evidence remains in this report; the single-Worker final pass verified the current browser's actual 1280px dark device state, no horizontal overflow, and the new routes. A fresh narrow-width run should be repeated in Safari/Chrome DevTools before a visual-release PR if mobile polish is the gating concern.

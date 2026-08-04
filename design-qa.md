# Downwrite Visual QA

final result: passed

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

The browser was verified through real `prefers-color-scheme` states by temporarily switching macOS appearance from dark to light and restoring dark afterward. The app exposes no theme override control and no persisted theme preference.

## Comparison Notes

- P0: none found.
- P1: none remaining. The selected workspace home now matches the target's main hierarchy: persistent graphite rail, editorial canvas, oversized workspace heading, thin dividers, list-row documents, and high-contrast New document action.
- P2 fixed during QA: the passkey/bootstrap rail form initially squeezed inputs and action text. The rail auth form now stacks vertically.
- P2 fixed during QA: the document detail title initially truncated a normal document title at desktop width. The editor title scale was reduced so `First self-hosted note` fits in the pane.

## Flow Coverage

- Workspace home: verified selected workspace, document row, Settings, and New document controls.
- Workspace settings: verified detail panel, metadata rows, edit/delete actions, and no button overflow.
- Document detail/editor: verified toolbar, autosave state, move-workspace panel, Markdown editor, and rendered Markdown preview.
- Sharing: verified collaborator, invitation, and public-link columns render coherently with no button text overflow.
- Responsive: verified a 390px viewport has no horizontal overflow and no overflowing button labels.

## Theme Coverage

- Light state: `matchMedia("(prefers-color-scheme: dark)").matches` returned `false`; computed `color-scheme` was `light`; rail background was graphite; canvas background was warm white; primary action was black with white text.
- Dark state: `matchMedia("(prefers-color-scheme: dark)").matches` returned `true`; computed `color-scheme` was `dark`; rail and canvas use separate dark tokens; primary action switches to warm light with dark text.

## Limits

- The current local auth setup still shows bootstrap-required/development controls in the rail because no production passkey bootstrap is configured locally. This is product state, not a visual-system failure.
- Full-page screenshot capture in the in-app browser was unreliable after client-side document navigation, so document/share/settings evidence uses viewport screenshots plus DOM/computed-layout checks.

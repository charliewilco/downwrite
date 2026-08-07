import { useEffect, useState } from "preact/hooks";
import type { GroupSummary } from "../api.js";
import { DEFAULT_ACCENT } from "../app-constants.js";
import {
  deleteGroupFromCache,
  updateGroupInCache,
} from "../workspace-state.js";

export function WorkspaceSettingsForm({ group }: { group: GroupSummary }) {
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description ?? "");
  const [accentColor, setAccentColor] = useState(
    group.accentColor ?? DEFAULT_ACCENT,
  );
  const [busy, setBusy] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setName(group.name);
    setDescription(group.description ?? "");
    setAccentColor(group.accentColor ?? DEFAULT_ACCENT);
    setConfirmingDelete(false);
    setNotice(null);
    setLocalError(null);
  }, [group.id, group.name, group.description, group.accentColor]);

  return (
    <>
      <form
        className="settings-form"
        onSubmit={(event) => {
          event.preventDefault();
          setBusy(true);
          setLocalError(null);
          void updateGroupInCache(group.id, {
            name,
            description: description || null,
            accentColor,
          })
            .then(() => setNotice("Workspace saved"))
            .catch((caught: unknown) =>
              setLocalError(
                caught instanceof Error ? caught.message : "Save failed",
              ),
            )
            .finally(() => setBusy(false));
        }}
      >
        <label>
          <span>Name</span>
          <input
            value={name}
            onInput={(event) => setName(event.currentTarget.value)}
          />
        </label>
        <label>
          <span>Description</span>
          <textarea
            value={description}
            onInput={(event) => setDescription(event.currentTarget.value)}
          />
        </label>
        <label className="color-row">
          <span>Accent</span>
          <input
            type="color"
            value={accentColor}
            onInput={(event) => setAccentColor(event.currentTarget.value)}
          />
        </label>
        <button className="primary-action" disabled={busy} type="submit">
          {busy ? "Saving..." : "Save workspace"}
        </button>
      </form>
      <section className="danger-zone">
        <div>
          <h2>Delete workspace</h2>
          <p>
            This removes the workspace and its documents from this self-hosted
            instance.
          </p>
        </div>
        <div className="toolbar-actions">
          {confirmingDelete && (
            <button
              className="secondary-action"
              type="button"
              onClick={() => setConfirmingDelete(false)}
            >
              Cancel
            </button>
          )}
          <button
            className="danger-action"
            type="button"
            onClick={() => {
              if (!confirmingDelete) {
                setConfirmingDelete(true);
                return;
              }
              void deleteGroupFromCache(group.id).then(() =>
                window.location.assign("/"),
              );
            }}
          >
            {confirmingDelete ? "Confirm delete" : "Delete workspace"}
          </button>
        </div>
      </section>
      {notice && <p className="inline-notice">{notice}</p>}
      {localError && <p className="inline-error">{localError}</p>}
    </>
  );
}

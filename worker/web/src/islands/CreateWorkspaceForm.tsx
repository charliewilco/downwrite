import { useState } from "preact/hooks";
import { DEFAULT_ACCENT } from "../app-constants.js";
import { createGroupInCache } from "../workspace-state.js";

export function CreateWorkspaceForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [accentColor, setAccentColor] = useState(DEFAULT_ACCENT);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  return (
    <form
      className="settings-form"
      onSubmit={(event) => {
        event.preventDefault();
        setBusy(true);
        setLocalError(null);
        void createGroupInCache({
          name: name || "Untitled workspace",
          description: description || null,
          accentColor,
        })
          .then((group) =>
            window.location.assign(
              `/workspaces/${encodeURIComponent(group.id)}`,
            ),
          )
          .catch((caught: unknown) =>
            setLocalError(
              caught instanceof Error
                ? caught.message
                : "Create workspace failed",
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
        {busy ? "Creating..." : "Create workspace"}
      </button>
      {localError && <p className="inline-error">{localError}</p>}
    </form>
  );
}

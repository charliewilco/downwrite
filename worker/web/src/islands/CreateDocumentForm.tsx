import { useEffect, useState } from "preact/hooks";
import type { GroupSummary } from "../api.js";
import { createDocumentInGroup, useGroups } from "../workspace-state.js";

export function CreateDocumentForm({
  initialGroups,
}: {
  initialGroups: GroupSummary[];
}) {
  const { groups } = useGroups(initialGroups);
  const [targetGroupId, setTargetGroupId] = useState(groups[0]?.id ?? "");
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (targetGroupId && groups.some((group) => group.id === targetGroupId)) {
      return;
    }
    setTargetGroupId(groups[0]?.id ?? "");
  }, [groups, targetGroupId]);

  return (
    <form
      className="settings-form"
      onSubmit={(event) => {
        event.preventDefault();
        setBusy(true);
        setLocalError(null);
        void createDocumentInGroup(targetGroupId)
          .then((document) =>
            window.location.assign(
              `/documents/${encodeURIComponent(document.id)}`,
            ),
          )
          .catch((caught: unknown) =>
            setLocalError(
              caught instanceof Error
                ? caught.message
                : "Create document failed",
            ),
          )
          .finally(() => setBusy(false));
      }}
    >
      <label>
        <span>Workspace</span>
        <select
          value={targetGroupId}
          onInput={(event) => setTargetGroupId(event.currentTarget.value)}
        >
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </label>
      <button
        className="primary-action"
        disabled={busy || !targetGroupId}
        type="submit"
      >
        {busy ? "Creating..." : "Create document"}
      </button>
      {localError && <p className="inline-error">{localError}</p>}
    </form>
  );
}

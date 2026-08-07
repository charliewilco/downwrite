import { useState } from "preact/hooks";
import type { DocumentSummary } from "../api.js";
import {
  createDocumentInGroup,
  positionDocumentAndRefresh,
} from "../workspace-state.js";

export function CreateDocumentButton({ groupId }: { groupId: string }) {
  const [busy, setBusy] = useState(false);

  return (
    <button
      className="secondary-action"
      disabled={busy}
      type="button"
      onClick={() => {
        setBusy(true);
        void createDocumentInGroup(groupId)
          .then((document) => {
            window.location.assign(
              `/documents/${encodeURIComponent(document.id)}`,
            );
          })
          .finally(() => setBusy(false));
      }}
    >
      {busy ? "Creating..." : "New document"}
    </button>
  );
}

export function DocumentOrderControls({
  documents,
  index,
}: {
  documents: DocumentSummary[];
  index: number;
}) {
  const document = documents[index];
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  if (!document) {
    return null;
  }

  return (
    <div className="order-actions" aria-label="Document order">
      <button
        className="icon-action"
        disabled={index === 0 || reorderingId === document.id}
        title="Move up"
        type="button"
        onClick={() => {
          const previous = documents[index - 1];
          if (!previous) {
            return;
          }
          setReorderingId(document.id);
          void positionDocumentAndRefresh(
            document.id,
            previous.position - 100,
            document.revision,
          ).finally(() => setReorderingId(null));
        }}
      >
        Up
      </button>
      <button
        className="icon-action"
        disabled={
          index === documents.length - 1 || reorderingId === document.id
        }
        title="Move down"
        type="button"
        onClick={() => {
          const next = documents[index + 1];
          if (!next) {
            return;
          }
          setReorderingId(document.id);
          void positionDocumentAndRefresh(
            document.id,
            next.position + 100,
            document.revision,
          ).finally(() => setReorderingId(null));
        }}
      >
        Down
      </button>
    </div>
  );
}

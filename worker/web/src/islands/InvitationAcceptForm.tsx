import { useState } from "preact/hooks";
import { acceptInvitation } from "../api.js";
import {
  getCachedGroups,
  refreshGroups,
  workspaceToken,
} from "../workspace-state.js";

export function InvitationAcceptForm({ token = "" }: { token?: string }) {
  const [inputToken, setInputToken] = useState(token);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <>
      <form
        className="settings-form"
        onSubmit={(event) => {
          event.preventDefault();
          setBusy(true);
          setError(null);
          setNotice(null);
          void acceptInvitation(workspaceToken, inputToken)
            .then(async (invitation) => {
              setNotice("Invitation accepted");
              await refreshGroups();
              const groupId = getCachedGroups().find((group) =>
                group.documents.some(
                  (document) => document.id === invitation.documentId,
                ),
              )?.id;
              window.location.assign(
                groupId
                  ? `/workspaces/${encodeURIComponent(groupId)}`
                  : `/documents/${encodeURIComponent(invitation.documentId)}`,
              );
            })
            .catch((caught: unknown) =>
              setError(
                caught instanceof Error ? caught.message : "Accept failed",
              ),
            )
            .finally(() => setBusy(false));
        }}
      >
        <label>
          <span>Invitation token</span>
          <input
            value={inputToken}
            onInput={(event) => setInputToken(event.currentTarget.value)}
          />
        </label>
        <button className="primary-action" disabled={busy} type="submit">
          {busy ? "Accepting..." : "Accept invitation"}
        </button>
      </form>
      {notice && <p className="inline-notice">{notice}</p>}
      {error && <p className="inline-error">{error}</p>}
    </>
  );
}

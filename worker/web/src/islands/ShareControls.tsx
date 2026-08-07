import { useEffect, useState } from "preact/hooks";
import {
  acceptInvitation,
  createInvitation,
  createPublicLink,
  fetchShareState,
  removeCollaborator,
  revokeInvitation,
  updatePublicLink,
  type GroupSummary,
  type Role,
  type ShareState,
} from "../api.js";
import { workspaceToken } from "../workspace-state.js";

export function ShareControls({
  group,
  initialDocumentId,
}: {
  group: GroupSummary;
  initialDocumentId?: string;
}) {
  const [selectedDocumentId, setSelectedDocumentId] = useState(
    initialDocumentId ?? group.documents[0]?.id ?? "",
  );

  useEffect(() => {
    if (initialDocumentId) {
      setSelectedDocumentId(initialDocumentId);
      return;
    }
    if (!selectedDocumentId && group.documents[0]) {
      setSelectedDocumentId(group.documents[0].id);
    }
  }, [initialDocumentId, group.id, group.documents, selectedDocumentId]);

  return (
    <>
      <label className="document-picker">
        <span>Document</span>
        <select
          value={selectedDocumentId}
          onInput={(event) => setSelectedDocumentId(event.currentTarget.value)}
        >
          {group.documents.map((document) => (
            <option key={document.id} value={document.id}>
              {document.title}
            </option>
          ))}
        </select>
      </label>
      {selectedDocumentId && (
        <SharePanel documentId={selectedDocumentId} token={workspaceToken} />
      )}
    </>
  );
}

function SharePanel({
  documentId,
  token,
}: {
  documentId: string;
  token: string | undefined;
}) {
  const [share, setShare] = useState<ShareState | null>(null);
  const [identityId, setIdentityId] = useState("");
  const [role, setRole] = useState<Role>("editor");
  const [linkLabel, setLinkLabel] = useState("Public read link");
  const [acceptToken, setAcceptToken] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refreshShare() {
    try {
      setError(null);
      setNotice(null);
      setShare(await fetchShareState(token, documentId));
    } catch (caught: unknown) {
      setError(
        caught instanceof Error ? caught.message : "Share request failed",
      );
    }
  }

  useEffect(() => {
    void refreshShare();
  }, [documentId, token]);

  return (
    <section className="share-panel">
      <div className="share-column">
        <h2>Collaborators</h2>
        <form
          className="inline-form"
          onSubmit={(event) => {
            event.preventDefault();
            void createInvitation(token, documentId, { identityId, role })
              .then(refreshShare)
              .then(() => setIdentityId(""))
              .catch((caught: unknown) =>
                setError(
                  caught instanceof Error ? caught.message : "Invite failed",
                ),
              );
          }}
        >
          <input
            aria-label="Invite identity"
            placeholder="identity id"
            value={identityId}
            onInput={(event) => setIdentityId(event.currentTarget.value)}
          />
          <select
            aria-label="Invite role"
            value={role}
            onInput={(event) => setRole(event.currentTarget.value as Role)}
          >
            <option value="editor">editor</option>
            <option value="owner">owner</option>
          </select>
          <button className="secondary-action" type="submit">
            Invite
          </button>
        </form>
        <ul className="share-list">
          {share?.collaborators.length === 0 && (
            <li className="empty-row">No collaborators yet.</li>
          )}
          {share?.collaborators.map((collaborator) => (
            <li key={collaborator.identityId}>
              <span>{collaborator.displayName ?? collaborator.identityId}</span>
              <strong>{collaborator.role}</strong>
              <button
                className="secondary-action"
                type="button"
                onClick={() =>
                  void removeCollaborator(
                    token,
                    documentId,
                    collaborator.identityId,
                  )
                    .then(refreshShare)
                    .catch((caught: unknown) =>
                      setError(
                        caught instanceof Error
                          ? caught.message
                          : "Remove failed",
                      ),
                    )
                }
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="share-column">
        <h2>Invitations</h2>
        <form
          className="inline-form"
          onSubmit={(event) => {
            event.preventDefault();
            void acceptInvitation(token, acceptToken)
              .then(refreshShare)
              .then(() => setAcceptToken(""))
              .catch((caught: unknown) =>
                setError(
                  caught instanceof Error ? caught.message : "Accept failed",
                ),
              );
          }}
        >
          <input
            aria-label="Invitation token"
            placeholder="paste invitation token"
            value={acceptToken}
            onInput={(event) => setAcceptToken(event.currentTarget.value)}
          />
          <button className="secondary-action" type="submit">
            Accept
          </button>
        </form>
        <ul className="share-list">
          {share?.invitations.length === 0 && (
            <li className="empty-row">No invitations yet.</li>
          )}
          {share?.invitations.map((invitation) => (
            <li key={invitation.id}>
              <span>
                {invitation.invitedIdentityId} · {invitation.status}
              </span>
              <code>{invitation.token}</code>
              <button
                className="secondary-action"
                type="button"
                onClick={() =>
                  void copyText(
                    `${location.origin}/invitations/${invitation.token}`,
                  )
                    .then(() => setNotice("Invitation URL copied"))
                    .catch(() => setError("Copy failed"))
                }
              >
                Copy invite URL
              </button>
              {invitation.status === "pending" && (
                <button
                  className="secondary-action"
                  type="button"
                  onClick={() =>
                    void revokeInvitation(token, invitation.id)
                      .then(refreshShare)
                      .catch((caught: unknown) =>
                        setError(
                          caught instanceof Error
                            ? caught.message
                            : "Revoke failed",
                        ),
                      )
                  }
                >
                  Revoke
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="share-column">
        <h2>Public links</h2>
        <form
          className="inline-form"
          onSubmit={(event) => {
            event.preventDefault();
            void createPublicLink(token, documentId, linkLabel || null)
              .then(refreshShare)
              .catch((caught: unknown) =>
                setError(
                  caught instanceof Error ? caught.message : "Link failed",
                ),
              );
          }}
        >
          <input
            aria-label="Public link label"
            value={linkLabel}
            onInput={(event) => setLinkLabel(event.currentTarget.value)}
          />
          <button className="secondary-action" type="submit">
            Create link
          </button>
        </form>
        <ul className="share-list">
          {share?.publicLinks.length === 0 && (
            <li className="empty-row">No public links yet.</li>
          )}
          {share?.publicLinks.map((link) => (
            <PublicLinkRow
              key={link.id}
              link={link}
              onCopy={(message) => setNotice(message)}
              onError={setError}
              onRefresh={refreshShare}
              token={token}
            />
          ))}
        </ul>
      </div>
      {notice && <p className="inline-notice">{notice}</p>}
      {error && <p className="inline-error">{error}</p>}
    </section>
  );
}

function PublicLinkRow({
  link,
  onCopy,
  onError,
  onRefresh,
  token,
}: {
  link: ShareState["publicLinks"][number];
  onCopy: (message: string) => void;
  onError: (message: string) => void;
  onRefresh: () => Promise<void>;
  token: string | undefined;
}) {
  const [label, setLabel] = useState(link.label ?? "");
  const publicUrl = `${location.origin}/public/${link.token}`;

  useEffect(() => {
    setLabel(link.label ?? "");
  }, [link.id, link.label]);

  return (
    <li>
      <span>{link.active ? "Active" : "Revoked"}</span>
      <input
        aria-label="Public link label"
        value={label}
        onInput={(event) => setLabel(event.currentTarget.value)}
      />
      <code>{publicUrl}</code>
      <div className="toolbar-actions">
        <button
          className="secondary-action"
          type="button"
          onClick={() =>
            void updatePublicLink(token, link.id, { label: label || null })
              .then(onRefresh)
              .catch((caught: unknown) =>
                onError(
                  caught instanceof Error ? caught.message : "Rename failed",
                ),
              )
          }
        >
          Save label
        </button>
        <button
          className="secondary-action"
          type="button"
          onClick={() =>
            void copyText(publicUrl)
              .then(() => onCopy("Public URL copied"))
              .catch(() => onError("Copy failed"))
          }
        >
          Copy URL
        </button>
        <button
          className="secondary-action"
          type="button"
          onClick={() =>
            void updatePublicLink(token, link.id, {
              active: !link.active,
            })
              .then(onRefresh)
              .catch((caught: unknown) =>
                onError(
                  caught instanceof Error
                    ? caught.message
                    : "Public link update failed",
                ),
              )
          }
        >
          {link.active ? "Revoke" : "Enable"}
        </button>
      </div>
    </li>
  );
}

async function copyText(value: string) {
  await navigator.clipboard.writeText(value);
}

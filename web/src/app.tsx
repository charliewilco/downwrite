import { h } from "preact";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import {
  ApiError,
  acceptInvitation,
  beginBootstrap,
  beginPasskeyLogin,
  createDocument,
  createGroup,
  createInvitation,
  createPublicLink,
  deleteDocument,
  deleteGroup,
  fetchAuthStatus,
  fetchDocument,
  fetchGroups,
  fetchShareState,
  finishBootstrap,
  finishPasskeyLogin,
  moveDocument,
  positionDocument,
  removeCollaborator,
  revokeInvitation,
  signOut,
  updateDocument,
  updateGroup,
  updatePublicLink,
  type AuthStatus,
  type DocumentRecord,
  type GroupSummary,
  type Role,
  type ShareState,
} from "./api.js";
import { renderMarkdown } from "./markdown.js";
import { createPasskey, getPasskey } from "./passkeys.js";
import "./document-elements.js";

const TOKEN_STORAGE_KEY = "DOWNWRITE_DEVELOPMENT_TOKEN";
const AUTOSAVE_DELAY_MS = 900;
const DEFAULT_ACCENT = "#566f5f";

type Route = { name: "home" } | { name: "document"; documentId: string };
type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

export function App() {
  const [token, setToken] = useState(() => {
    return localStorage.getItem(TOKEN_STORAGE_KEY) ?? "owner-token";
  });
  const [route, setRoute] = useState<Route>(() => readRoute());
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const onPopState = () => setRoute(readRoute());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }, [token]);

  async function refreshAuth() {
    try {
      setAuthStatus(await fetchAuthStatus());
    } catch {
      setAuthStatus(null);
    }
  }

  async function refreshGroups() {
    setLoading(true);
    setError(null);

    try {
      const nextGroups = await fetchGroups(token);
      setGroups(nextGroups);
      setSelectedGroupId((current) => current ?? nextGroups[0]?.id ?? null);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Unknown API error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshAuth();
    void refreshGroups();
  }, [token]);

  function navigate(nextRoute: Route) {
    const path =
      nextRoute.name === "home" ? "/" : `/documents/${nextRoute.documentId}`;
    history.pushState(null, "", path);
    setRoute(nextRoute);
  }

  function removeDocumentFromGroups(documentId: string) {
    setGroups((currentGroups) =>
      currentGroups.map((group) => ({
        ...group,
        documents: group.documents.filter(
          (document) => document.id !== documentId,
        ),
      })),
    );
  }

  function upsertDocumentInGroups(document: DocumentRecord) {
    setGroups((currentGroups) =>
      currentGroups.map((group) =>
        group.id === document.groupId
          ? {
              ...group,
              documents: [
                {
                  id: document.id,
                  groupId: document.groupId,
                  title: document.title,
                  role: document.role,
                  position: document.position,
                  revision: document.revision,
                  createdAt: document.createdAt,
                  updatedAt: document.updatedAt,
                },
                ...group.documents.filter((item) => item.id !== document.id),
              ],
            }
          : {
              ...group,
              documents: group.documents.filter(
                (item) => item.id !== document.id,
              ),
            },
      ),
    );
  }

  return (
    <main className="shell">
      <aside className="navigation-rail">
        <header className="topbar">
          <button
            className="brand"
            type="button"
            onClick={() => navigate({ name: "home" })}
          >
            <span>Downwrite</span>
            <strong>Workspaces</strong>
          </button>
          <AuthPanel
            authStatus={authStatus}
            token={token}
            onAuthChanged={async () => {
              await refreshAuth();
              await refreshGroups();
            }}
            onTokenChange={setToken}
          />
        </header>
        <WorkspaceList
          groups={groups}
          onCreateGroup={async (input) => {
            const group = await createGroup(token, input);
            setGroups((current) => [group, ...current]);
            setSelectedGroupId(group.id);
            navigate({ name: "home" });
            void refreshGroups();
          }}
          onSelectGroup={(groupId) => {
            setSelectedGroupId(groupId);
            navigate({ name: "home" });
          }}
          selectedGroupId={
            route.name === "document"
              ? (groups.find((group) =>
                  group.documents.some(
                    (document) => document.id === route.documentId,
                  ),
                )?.id ?? selectedGroupId)
              : selectedGroupId
          }
        />
      </aside>

      <section className="content-canvas">
        {route.name === "home" ? (
          <HomeContent
            error={error}
            groups={groups}
            loading={loading}
            selectedGroupId={selectedGroupId}
            onCreateDocument={async (groupId) => {
              const document = await createDocument(token, groupId);
              upsertDocumentInGroups(document);
              void refreshGroups();
              navigate({ name: "document", documentId: document.id });
            }}
            onDeleteGroup={async (groupId) => {
              await deleteGroup(token, groupId);
              setGroups((current) =>
                current.filter((group) => group.id !== groupId),
              );
              setSelectedGroupId((current) =>
                current === groupId ? null : current,
              );
              void refreshGroups();
            }}
            onOpenDocument={(documentId) =>
              navigate({ name: "document", documentId })
            }
            onPositionDocument={async (documentId, position, baseRevision) => {
              await positionDocument(token, documentId, {
                position,
                baseRevision,
              });
              await refreshGroups();
            }}
            onUpdateGroup={async (groupId, input) => {
              const group = await updateGroup(token, groupId, input);
              setGroups((current) =>
                current.map((item) => (item.id === group.id ? group : item)),
              );
              void refreshGroups();
            }}
          />
        ) : (
          <DocumentView
            documentId={route.documentId}
            groups={groups}
            token={token}
            onBack={() => {
              navigate({ name: "home" });
              void refreshGroups();
            }}
            onDeleted={(deletedDocumentId) => {
              removeDocumentFromGroups(deletedDocumentId);
              navigate({ name: "home" });
              void refreshGroups();
            }}
            onMoved={async (movedDocument) => {
              upsertDocumentInGroups(movedDocument);
              await refreshGroups();
            }}
          />
        )}
      </section>
    </main>
  );
}

function AuthPanel({
  authStatus,
  onAuthChanged,
  onTokenChange,
  token,
}: {
  authStatus: AuthStatus | null;
  onAuthChanged: () => Promise<void>;
  onTokenChange: (token: string) => void;
  token: string;
}) {
  const [identityId, setIdentityId] = useState("owner");
  const [displayName, setDisplayName] = useState("Owner");
  const [setupToken, setSetupToken] = useState("");
  const [mode, setMode] = useState<"passkey" | "development">("passkey");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const configuration = authStatus?.configuration ?? {
    bootstrapTokenConfigured: false,
    instancePublicUrl: null,
    webauthnRpId: null,
    webauthnRpName: "Downwrite",
  };

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
      await onAuthChanged();
    } catch (caught: unknown) {
      setError(
        caught instanceof Error ? caught.message : "Authentication failed",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-panel" aria-label="Authentication">
      <div className="auth-row">
        <strong>
          {authStatus?.authenticated
            ? authStatus.identity?.id
            : authStatus?.bootstrapRequired
              ? "Bootstrap required"
              : "Signed out"}
        </strong>
        {authStatus?.authenticated && (
          <button
            className="secondary-action"
            type="button"
            onClick={() => void run(signOut)}
          >
            Sign out
          </button>
        )}
      </div>
      <div className="segmented-control">
        <button
          className={mode === "passkey" ? "selected" : ""}
          type="button"
          onClick={() => setMode("passkey")}
        >
          Passkey
        </button>
        <button
          className={mode === "development" ? "selected" : ""}
          type="button"
          onClick={() => setMode("development")}
        >
          Development
        </button>
      </div>
      {mode === "passkey" ? (
        <div className="auth-card">
          {authStatus?.bootstrapRequired &&
            !configuration.bootstrapTokenConfigured && (
              <p className="inline-error">AUTH_BOOTSTRAP_TOKEN is missing.</p>
            )}
          <dl className="setup-list">
            <div>
              <dt>Instance</dt>
              <dd>{configuration.instancePublicUrl ?? location.origin}</dd>
            </div>
            <div>
              <dt>Relying party</dt>
              <dd>{configuration.webauthnRpId ?? location.hostname}</dd>
            </div>
          </dl>
          <div className="auth-grid">
            <input
              aria-label="Identity"
              value={identityId}
              onInput={(event) => setIdentityId(event.currentTarget.value)}
            />
            {authStatus?.bootstrapRequired && (
              <input
                aria-label="Display name"
                value={displayName}
                onInput={(event) => setDisplayName(event.currentTarget.value)}
              />
            )}
            {authStatus?.bootstrapRequired && (
              <input
                aria-label="Bootstrap setup token"
                placeholder="Bootstrap token"
                type="password"
                value={setupToken}
                onInput={(event) => setSetupToken(event.currentTarget.value)}
              />
            )}
            <button
              className="secondary-action"
              disabled={
                busy ||
                (authStatus?.bootstrapRequired &&
                  !configuration.bootstrapTokenConfigured)
              }
              type="button"
              onClick={() =>
                void run(async () => {
                  if (authStatus?.bootstrapRequired) {
                    const result = await beginBootstrap({
                      setupToken,
                      identityId,
                      displayName,
                    });
                    const response = await createPasskey(result.options);
                    await finishBootstrap({
                      setupToken,
                      challengeId: result.challengeId,
                      response,
                    });
                    return;
                  }

                  const result = await beginPasskeyLogin(identityId);
                  const response = await getPasskey(result.options);
                  await finishPasskeyLogin({
                    challengeId: result.challengeId,
                    response,
                  });
                })
              }
            >
              {busy
                ? "Working..."
                : authStatus?.bootstrapRequired
                  ? "Create owner passkey"
                  : "Sign in with passkey"}
            </button>
          </div>
        </div>
      ) : (
        <label className="token auth-card">
          <span>Development token</span>
          <input
            value={token}
            onInput={(event) => onTokenChange(event.currentTarget.value)}
          />
        </label>
      )}
      {error && <p className="inline-error">{error}</p>}
    </section>
  );
}

function HomeContent({
  error,
  groups,
  loading,
  onCreateDocument,
  onDeleteGroup,
  onOpenDocument,
  onPositionDocument,
  onUpdateGroup,
  selectedGroupId,
}: {
  error: string | null;
  groups: GroupSummary[];
  loading: boolean;
  onCreateDocument: (groupId: string) => Promise<void>;
  onDeleteGroup: (groupId: string) => Promise<void>;
  onOpenDocument: (documentId: string) => void;
  onPositionDocument: (
    documentId: string,
    position: number,
    baseRevision: number,
  ) => Promise<void>;
  onUpdateGroup: (
    groupId: string,
    input: Partial<Pick<GroupSummary, "name" | "description" | "accentColor">>,
  ) => Promise<void>;
  selectedGroupId: string | null;
}) {
  const selectedGroup =
    groups.find((group) => group.id === selectedGroupId) ?? groups[0] ?? null;

  if (loading) {
    return <p className="status">Loading workspaces...</p>;
  }

  if (error) {
    return <p className="status error">{error}</p>;
  }

  return (
    <section className="workspace-screen">
      {selectedGroup ? (
        <WorkspaceDetail
          group={selectedGroup}
          onCreateDocument={() => onCreateDocument(selectedGroup.id)}
          onDeleteGroup={() => onDeleteGroup(selectedGroup.id)}
          onOpenDocument={onOpenDocument}
          onPositionDocument={onPositionDocument}
          onUpdateGroup={(input) => onUpdateGroup(selectedGroup.id, input)}
        />
      ) : (
        <section className="workspace-detail empty-document">
          <h1>No workspaces</h1>
          <p>Create a workspace to start organizing Markdown documents.</p>
        </section>
      )}
    </section>
  );
}

function WorkspaceList({
  groups,
  onCreateGroup,
  onSelectGroup,
  selectedGroupId,
}: {
  groups: GroupSummary[];
  onCreateGroup: (
    input: Pick<GroupSummary, "name" | "description" | "accentColor">,
  ) => Promise<void>;
  onSelectGroup: (groupId: string) => void;
  selectedGroupId: string | null;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [accentColor, setAccentColor] = useState(DEFAULT_ACCENT);
  const [creating, setCreating] = useState(false);

  return (
    <aside className="workspace-list">
      <form
        className="create-group"
        onSubmit={(event) => {
          event.preventDefault();
          setCreating(true);
          void onCreateGroup({
            name: name || "Untitled workspace",
            description: description || null,
            accentColor,
          }).finally(() => {
            setCreating(false);
            setName("");
            setDescription("");
          });
        }}
      >
        <h2>New workspace</h2>
        <input
          aria-label="Workspace name"
          placeholder="Workspace name"
          value={name}
          onInput={(event) => setName(event.currentTarget.value)}
        />
        <input
          aria-label="Workspace description"
          placeholder="Description"
          value={description}
          onInput={(event) => setDescription(event.currentTarget.value)}
        />
        <input
          aria-label="Workspace color"
          type="color"
          value={accentColor}
          onInput={(event) => setAccentColor(event.currentTarget.value)}
        />
        <button className="secondary-action" disabled={creating} type="submit">
          {creating ? "Creating..." : "Create workspace"}
        </button>
      </form>

      <div className="workspace-buttons">
        {groups.map((group) => (
          <button
            className={`workspace-button ${
              group.id === selectedGroupId ? "selected" : ""
            }`}
            key={group.id}
            style={{ borderLeftColor: group.accentColor ?? DEFAULT_ACCENT }}
            type="button"
            onClick={() => onSelectGroup(group.id)}
          >
            <strong>{group.name}</strong>
            <span>
              {group.documents.length} document
              {group.documents.length === 1 ? "" : "s"}
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}

function WorkspaceDetail({
  group,
  onCreateDocument,
  onDeleteGroup,
  onOpenDocument,
  onPositionDocument,
  onUpdateGroup,
}: {
  group: GroupSummary;
  onCreateDocument: () => Promise<void>;
  onDeleteGroup: () => Promise<void>;
  onOpenDocument: (documentId: string) => void;
  onPositionDocument: (
    documentId: string,
    position: number,
    baseRevision: number,
  ) => Promise<void>;
  onUpdateGroup: (
    input: Partial<Pick<GroupSummary, "name" | "description" | "accentColor">>,
  ) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description ?? "");
  const [accentColor, setAccentColor] = useState(
    group.accentColor ?? DEFAULT_ACCENT,
  );
  const [busy, setBusy] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  useEffect(() => {
    setName(group.name);
    setDescription(group.description ?? "");
    setAccentColor(group.accentColor ?? DEFAULT_ACCENT);
    setEditing(false);
    setSettingsOpen(false);
    setConfirmingDelete(false);
  }, [group.id, group.name, group.description, group.accentColor]);

  return (
    <section className="workspace-detail">
      <header
        className="workspace-heading"
        style={{ borderTopColor: group.accentColor ?? DEFAULT_ACCENT }}
      >
        {editing ? (
          <form
            className="workspace-edit"
            onSubmit={(event) => {
              event.preventDefault();
              setBusy(true);
              void onUpdateGroup({
                name,
                description: description || null,
                accentColor,
              }).finally(() => setBusy(false));
            }}
          >
            <input
              aria-label="Workspace name"
              value={name}
              onInput={(event) => setName(event.currentTarget.value)}
            />
            <textarea
              aria-label="Workspace description"
              value={description}
              onInput={(event) => setDescription(event.currentTarget.value)}
            />
            <input
              aria-label="Workspace color"
              type="color"
              value={accentColor}
              onInput={(event) => setAccentColor(event.currentTarget.value)}
            />
            <button className="secondary-action" disabled={busy} type="submit">
              {busy ? "Saving..." : "Save workspace"}
            </button>
          </form>
        ) : (
          <>
            <div>
              <h1>{group.name}</h1>
              <p>{group.description ?? "No description yet."}</p>
            </div>
            <div className="toolbar-actions">
              <button
                className="secondary-action"
                type="button"
                onClick={() => setSettingsOpen((open) => !open)}
              >
                Settings
              </button>
              <button
                className="secondary-action"
                type="button"
                onClick={() => void onCreateDocument()}
              >
                New document
              </button>
            </div>
          </>
        )}
      </header>

      {settingsOpen && !editing && (
        <section className="settings-panel">
          <div>
            <h2>Workspace settings</h2>
            <dl className="setup-list">
              <div>
                <dt>Role</dt>
                <dd>{group.role}</dd>
              </div>
              <div>
                <dt>Documents</dt>
                <dd>{group.documents.length}</dd>
              </div>
              <div>
                <dt>Recent</dt>
                <dd>{mostRecentDocument(group)?.title ?? "No documents"}</dd>
              </div>
              <div>
                <dt>Updated</dt>
                <dd>{group.updatedAt}</dd>
              </div>
            </dl>
          </div>
          <div className="toolbar-actions">
            <button
              className="secondary-action"
              type="button"
              onClick={() => setEditing(true)}
            >
              Edit details
            </button>
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
                void onDeleteGroup();
              }}
            >
              {confirmingDelete ? "Confirm delete" : "Delete workspace"}
            </button>
          </div>
        </section>
      )}

      <ul className="document-list">
        {group.documents.length === 0 && (
          <li className="empty-row">
            No documents yet. Create one to start writing in this workspace.
          </li>
        )}
        {group.documents.map((document, index) => (
          <li className="document-row" key={document.id}>
            <button
              className="document-link"
              type="button"
              onClick={() => onOpenDocument(document.id)}
            >
              <strong>{document.title}</strong>
              <span>
                {document.role} · rev {document.revision}
              </span>
            </button>
            <div className="order-actions" aria-label="Document order">
              <button
                className="icon-action"
                disabled={index === 0 || reorderingId === document.id}
                title="Move up"
                type="button"
                onClick={() => {
                  const previous = group.documents[index - 1];
                  if (!previous) {
                    return;
                  }
                  setReorderingId(document.id);
                  void onPositionDocument(
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
                  index === group.documents.length - 1 ||
                  reorderingId === document.id
                }
                title="Move down"
                type="button"
                onClick={() => {
                  const next = group.documents[index + 1];
                  if (!next) {
                    return;
                  }
                  setReorderingId(document.id);
                  void onPositionDocument(
                    document.id,
                    next.position + 100,
                    document.revision,
                  ).finally(() => setReorderingId(null));
                }}
              >
                Down
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function DocumentView({
  documentId,
  groups,
  onBack,
  onDeleted,
  onMoved,
  token,
}: {
  documentId: string;
  groups: GroupSummary[];
  onBack: () => void;
  onDeleted: (documentId: string) => void;
  onMoved: (document: DocumentRecord) => Promise<void>;
  token: string;
}) {
  const [document, setDocument] = useState<DocumentRecord | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [targetGroupId, setTargetGroupId] = useState("");
  const [moving, setMoving] = useState(false);
  const loadedDocumentId = useRef<string | null>(null);
  const lastSaved = useRef({ title: "", content: "", revision: 0 });

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setMissing(false);
    setSaveState("idle");
    setConfirmingDelete(false);
    setDeleting(false);

    fetchDocument(token, documentId)
      .then((nextDocument) => {
        if (!active) {
          return;
        }
        setDocument(nextDocument);
        setTitle(nextDocument.title);
        setContent(nextDocument.content);
        lastSaved.current = {
          title: nextDocument.title,
          content: nextDocument.content,
          revision: nextDocument.revision,
        };
        setTargetGroupId(nextDocument.groupId);
        loadedDocumentId.current = nextDocument.id;
      })
      .catch((caught: unknown) => {
        if (active) {
          if (caught instanceof ApiError && caught.status === 404) {
            setMissing(true);
            setError(null);
            return;
          }

          setError(
            caught instanceof Error ? caught.message : "Unknown API error",
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [documentId, token]);

  const changed =
    title !== lastSaved.current.title || content !== lastSaved.current.content;

  useEffect(() => {
    if (!document || loadedDocumentId.current !== documentId) {
      return;
    }

    if (!changed) {
      setSaveState("saved");
      return;
    }

    setSaveState("dirty");
    const timeout = window.setTimeout(() => {
      setSaveState("saving");
      updateDocument(token, documentId, {
        title,
        content,
        baseRevision: lastSaved.current.revision,
      })
        .then((saved) => {
          setDocument(saved);
          lastSaved.current = {
            title: saved.title,
            content: saved.content,
            revision: saved.revision,
          };
          setSaveState("saved");
        })
        .catch((caught: unknown) => {
          setError(
            caught instanceof Error ? caught.message : "Unknown save error",
          );
          setSaveState("error");
        });
    }, AUTOSAVE_DELAY_MS);

    return () => window.clearTimeout(timeout);
  }, [changed, content, document, documentId, title, token]);

  const preview = useMemo(() => renderMarkdown(content), [content]);

  if (loading) {
    return <p className="status">Loading document...</p>;
  }

  if (missing) {
    return (
      <section className="document-screen empty-document">
        <button className="back-button" type="button" onClick={onBack}>
          Back to workspace
        </button>
        <div>
          <h1>Document not found</h1>
          <p>
            This document may have been deleted, moved, or hidden from the
            current identity.
          </p>
        </div>
      </section>
    );
  }

  if (error && !document) {
    return (
      <section className="document-screen">
        <button className="back-button" type="button" onClick={onBack}>
          Back
        </button>
        <p className="status error">{error}</p>
      </section>
    );
  }

  if (!document) {
    return null;
  }

  return (
    <section className="document-screen">
      <header className="document-toolbar">
        <button className="back-button" type="button" onClick={onBack}>
          Back
        </button>
        <SaveStatusElement state={saveState} />
        <div className="delete-actions">
          <button
            className="secondary-action"
            type="button"
            onClick={() => setShareOpen((open) => !open)}
          >
            Share
          </button>
          {confirmingDelete && (
            <button
              className="secondary-action"
              disabled={deleting}
              type="button"
              onClick={() => setConfirmingDelete(false)}
            >
              Cancel
            </button>
          )}
          <button
            className="danger-action"
            disabled={deleting}
            type="button"
            onClick={async () => {
              if (!confirmingDelete) {
                setConfirmingDelete(true);
                return;
              }

              setDeleting(true);
              setError(null);

              try {
                await deleteDocument(token, document.id);
                onDeleted(document.id);
              } catch (caught: unknown) {
                setError(
                  caught instanceof Error
                    ? caught.message
                    : "Unknown delete error",
                );
                setDeleting(false);
              }
            }}
          >
            {deleting
              ? "Deleting..."
              : confirmingDelete
                ? `Delete "${title}"`
                : "Delete"}
          </button>
        </div>
      </header>

      {error && <p className="status error">{error}</p>}
      {shareOpen && <SharePanel documentId={document.id} token={token} />}
      <section className="document-organization">
        <div>
          <strong>Workspace</strong>
          <span>{workspaceName(groups, document.groupId)}</span>
        </div>
        <form
          className="inline-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (targetGroupId === document.groupId) {
              return;
            }

            setMoving(true);
            setError(null);
            void moveDocument(token, document.id, {
              groupId: targetGroupId,
              baseRevision: document.revision,
            })
              .then(async (moved) => {
                setDocument(moved);
                setTargetGroupId(moved.groupId);
                lastSaved.current.revision = moved.revision;
                await onMoved(moved);
              })
              .catch((caught: unknown) =>
                setError(
                  caught instanceof Error ? caught.message : "Move failed",
                ),
              )
              .finally(() => setMoving(false));
          }}
        >
          <select
            aria-label="Move to workspace"
            value={targetGroupId}
            onInput={(event) => setTargetGroupId(event.currentTarget.value)}
          >
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
          <button
            className="secondary-action"
            disabled={moving || targetGroupId === document.groupId}
            type="submit"
          >
            {moving ? "Moving..." : "Move document"}
          </button>
        </form>
      </section>

      <div className="document-grid">
        <section className="editor-pane" aria-label="Markdown editor">
          <input
            className="title-input"
            aria-label="Document title"
            value={title}
            onInput={(event) => setTitle(event.currentTarget.value)}
          />
          <textarea
            aria-label="Markdown content"
            className="markdown-editor"
            spellcheck
            value={content}
            onInput={(event) => setContent(event.currentTarget.value)}
          />
        </section>
        <section
          className="preview-pane"
          aria-label="Rendered Markdown preview"
        >
          {preview.length > 0 ? (
            preview
          ) : (
            <p className="empty-preview">Empty document.</p>
          )}
        </section>
      </div>
    </section>
  );
}

function SharePanel({
  documentId,
  token,
}: {
  documentId: string;
  token: string;
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
                  void copyText(invitation.token)
                    .then(() => setNotice("Invitation token copied"))
                    .catch(() => setError("Copy failed"))
                }
              >
                Copy token
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
  token: string;
}) {
  const [label, setLabel] = useState(link.label ?? "");
  const publicUrl = `${location.origin}/api/v1/public-links/${link.token}`;

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

function mostRecentDocument(group: GroupSummary) {
  return [...group.documents].sort((left, right) =>
    right.updatedAt.localeCompare(left.updatedAt),
  )[0];
}

function workspaceName(groups: GroupSummary[], groupId: string) {
  return groups.find((group) => group.id === groupId)?.name ?? "Unknown";
}

function readRoute(): Route {
  const documentMatch = window.location.pathname.match(
    /^\/documents\/([^/]+)$/,
  );
  if (documentMatch) {
    return {
      name: "document",
      documentId: decodeURIComponent(documentMatch[1]),
    };
  }

  return { name: "home" };
}

function SaveStatusElement({ state }: { state: SaveState }) {
  return h("dw-save-status", { state });
}

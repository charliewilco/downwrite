import { h } from "preact";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import {
  deleteDocument,
  moveDocument,
  updateDocument,
  type DocumentRecord,
  type GroupSummary,
} from "../api.js";
import { renderMarkdown } from "../markdown.js";
import {
  refreshGroups,
  removeDocumentFromGroups,
  upsertDocumentInGroups,
  workspaceToken,
} from "../workspace-state.js";

const AUTOSAVE_DELAY_MS = 900;

type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";
type DocumentEditorMode = "write" | "preview";
interface TiptapMarkdownEditorProps {
  documentId: string;
  markdown: string;
  onMarkdownChange: (markdown: string) => void;
}
type TiptapMarkdownEditorComponent = (
  props: TiptapMarkdownEditorProps,
) => h.JSX.Element;

export function DocumentEditor({
  document: initialDocument,
  groups,
}: {
  document: DocumentRecord;
  groups: GroupSummary[];
}) {
  const [document, setDocument] = useState<DocumentRecord>(initialDocument);
  const [title, setTitle] = useState(initialDocument.title);
  const [content, setContent] = useState(initialDocument.content);
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [targetGroupId, setTargetGroupId] = useState(initialDocument.groupId);
  const [moving, setMoving] = useState(false);
  const [editorMode, setEditorMode] = useState<DocumentEditorMode>("write");
  const lastSaved = useRef({
    title: initialDocument.title,
    content: initialDocument.content,
    revision: initialDocument.revision,
  });
  const backHref = `/workspaces/${encodeURIComponent(document.groupId)}`;
  const changed =
    title !== lastSaved.current.title || content !== lastSaved.current.content;

  useEffect(() => {
    setDocument(initialDocument);
    setTitle(initialDocument.title);
    setContent(initialDocument.content);
    setTargetGroupId(initialDocument.groupId);
    setError(null);
    setSaveState("idle");
    setConfirmingDelete(false);
    setDeleting(false);
    setEditorMode("write");
    lastSaved.current = {
      title: initialDocument.title,
      content: initialDocument.content,
      revision: initialDocument.revision,
    };
  }, [initialDocument]);

  useEffect(() => {
    if (!changed) {
      setSaveState("saved");
      return;
    }

    setSaveState("dirty");
    const timeout = window.setTimeout(() => {
      setSaveState("saving");
      updateDocument(workspaceToken, document.id, {
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
  }, [changed, content, document.id, title]);

  const preview = useMemo(() => renderMarkdown(content), [content]);

  return (
    <section className="document-screen">
      <header className="document-toolbar">
        <a className="back-button" href={backHref}>
          Back
        </a>
        <SaveStatusElement state={saveState} />
        <div className="delete-actions">
          <a
            className="secondary-action"
            href={`/workspaces/${encodeURIComponent(
              document.groupId,
            )}/share?document=${encodeURIComponent(document.id)}`}
          >
            Share
          </a>
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
                await deleteDocument(workspaceToken, document.id);
                removeDocumentFromGroups(document.id);
                void refreshGroups();
                window.location.assign("/");
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
            void moveDocument(workspaceToken, document.id, {
              groupId: targetGroupId,
              baseRevision: document.revision,
            })
              .then(async (moved) => {
                setDocument(moved);
                setTargetGroupId(moved.groupId);
                lastSaved.current.revision = moved.revision;
                upsertDocumentInGroups(moved);
                await refreshGroups();
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

      <section className="document-composer">
        <div
          className="editor-mode-toggle"
          role="group"
          aria-label="Editor mode"
        >
          <button
            className={editorMode === "write" ? "selected" : undefined}
            type="button"
            onClick={() => setEditorMode("write")}
          >
            Write
          </button>
          <button
            className={editorMode === "preview" ? "selected" : undefined}
            type="button"
            onClick={() => setEditorMode("preview")}
          >
            Preview
          </button>
        </div>
        {editorMode === "write" ? (
          <section className="editor-pane" aria-label="Markdown editor">
            <input
              className="title-input"
              aria-label="Document title"
              value={title}
              onInput={(event) => setTitle(event.currentTarget.value)}
            />
            <LazyTiptapMarkdownEditor
              documentId={document.id}
              markdown={content}
              onMarkdownChange={setContent}
            />
          </section>
        ) : (
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
        )}
      </section>
    </section>
  );
}

function LazyTiptapMarkdownEditor(props: TiptapMarkdownEditorProps) {
  const [EditorComponent, setEditorComponent] =
    useState<TiptapMarkdownEditorComponent | null>(null);

  useEffect(() => {
    let active = true;

    import("../TiptapMarkdownEditor.js").then((module) => {
      if (active) {
        setEditorComponent(() => module.TiptapMarkdownEditor);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  if (!EditorComponent) {
    return <p className="editor-loading">Loading editor...</p>;
  }

  return <EditorComponent {...props} />;
}

function workspaceName(groups: GroupSummary[], groupId: string) {
  return groups.find((group) => group.id === groupId)?.name ?? "Unknown";
}

function SaveStatusElement({ state }: { state: SaveState }) {
  return h("dw-save-status", { state });
}

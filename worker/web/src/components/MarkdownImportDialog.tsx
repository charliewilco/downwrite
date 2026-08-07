import { useEffect, useRef, useState } from "preact/hooks";
import { DEFAULT_ACCENT } from "../app-constants.js";
import type { MarkdownDropDetail } from "../MarkdownDragArea.js";
import {
  createGroupInCache,
  importMarkdownFilesToGroup,
  useGroups,
} from "../workspace-state.js";

export interface MarkdownImport {
  title: string;
  content: string;
}

export function MarkdownImportDialog() {
  const { groups } = useGroups();
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [imports, setImports] = useState<MarkdownImport[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [selectedGroupId, setSelectedGroupId] = useState(groups[0]?.id ?? "");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [accentColor, setAccentColor] = useState(DEFAULT_ACCENT);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const importedRef = useRef(false);

  useEffect(() => {
    const handleDrop = (event: Event) => {
      const detail = (event as CustomEvent<MarkdownDropDetail>).detail;
      void prepareImport(detail);
    };

    document.addEventListener("markdown-files-drop", handleDrop);
    return () =>
      document.removeEventListener("markdown-files-drop", handleDrop);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (imports.length > 0 && !dialog.open) {
      importedRef.current = false;
      setMode(groups.length > 0 ? "existing" : "new");
      setSelectedGroupId(groups[0]?.id ?? "");
      setLocalError(null);
      dialog.showModal();
      return;
    }

    if (imports.length === 0 && dialog.open) {
      dialog.close();
    }
  }, [groups, imports.length]);

  async function prepareImport({ files, workspaceId }: MarkdownDropDetail) {
    try {
      const nextImports = await readMarkdownImports(files);
      setImportError(null);

      if (workspaceId) {
        const document = await importMarkdownFilesToGroup(
          workspaceId,
          nextImports,
        );
        if (document) {
          openDocument(document.id);
        }
        return;
      }

      setImports(nextImports);
    } catch (caught: unknown) {
      setImportError(
        caught instanceof Error ? caught.message : "Import failed",
      );
    }
  }

  function cancelImport() {
    setImports([]);
  }

  async function runImport() {
    setBusy(true);
    setLocalError(null);

    try {
      const groupId =
        mode === "existing"
          ? selectedGroupId
          : (
              await createGroupInCache({
                name: name || "Untitled workspace",
                description: description || null,
                accentColor,
              })
            ).id;

      importedRef.current = true;
      const document = await importMarkdownFilesToGroup(groupId, imports);
      setImports([]);
      setName("");
      setDescription("");
      if (document) {
        openDocument(document.id);
      }
    } catch (caught: unknown) {
      setLocalError(caught instanceof Error ? caught.message : "Import failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {importError && <p className="status error">{importError}</p>}
      <dialog
        className="import-dialog"
        ref={dialogRef}
        onCancel={(event) => {
          event.preventDefault();
          cancelImport();
        }}
        onClose={() => {
          if (!busy && !importedRef.current && imports.length > 0) {
            cancelImport();
          }
        }}
      >
        <form
          className="import-dialog-body"
          method="dialog"
          onSubmit={(event) => {
            event.preventDefault();
            void runImport();
          }}
        >
          <header>
            <p className="eyebrow">Markdown import</p>
            <h2>
              {imports.length} document{imports.length === 1 ? "" : "s"}
            </h2>
          </header>
          <ul className="import-file-list">
            {imports.map((item) => (
              <li key={`${item.title}:${item.content.length}`}>
                <span>{item.title}</span>
                <small>{item.content.length.toLocaleString()} characters</small>
              </li>
            ))}
          </ul>
          <div className="segmented-control">
            <button
              className={mode === "existing" ? "selected" : undefined}
              disabled={groups.length === 0}
              type="button"
              onClick={() => setMode("existing")}
            >
              Existing workspace
            </button>
            <button
              className={mode === "new" ? "selected" : undefined}
              type="button"
              onClick={() => setMode("new")}
            >
              New workspace
            </button>
          </div>
          {mode === "existing" ? (
            <label>
              <span>Workspace</span>
              <select
                value={selectedGroupId}
                onInput={(event) =>
                  setSelectedGroupId(event.currentTarget.value)
                }
              >
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <>
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
            </>
          )}
          {localError && <p className="inline-error">{localError}</p>}
          <div className="toolbar-actions">
            <button
              type="button"
              className="secondary-action"
              onClick={cancelImport}
            >
              Cancel
            </button>
            <button
              className="primary-action"
              disabled={busy || (mode === "existing" && !selectedGroupId)}
              type="submit"
            >
              {busy ? "Importing..." : "Import"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}

export async function readMarkdownImports(files: FileList | File[]) {
  const markdownFiles = Array.from(files).filter(isMarkdownFile);
  if (markdownFiles.length === 0) {
    throw new Error("Drop Markdown files ending in .md or .markdown.");
  }

  return Promise.all(
    markdownFiles.map(async (file) => ({
      title: titleFromFileName(file.name),
      content: await file.text(),
    })),
  );
}

function isMarkdownFile(file: File) {
  const name = file.name.toLocaleLowerCase();
  return (
    name.endsWith(".md") ||
    name.endsWith(".markdown") ||
    file.type === "text/markdown"
  );
}

function titleFromFileName(name: string) {
  return (
    name
      .replace(/\.(md|markdown)$/i, "")
      .replace(/[-_]+/g, " ")
      .trim() || "Untitled document"
  );
}

function openDocument(documentId: string) {
  window.location.assign(`/documents/${encodeURIComponent(documentId)}`);
}

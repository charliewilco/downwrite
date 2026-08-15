import { Editor } from "@tiptap/core";
import "@tiptap/markdown";
import { useEffect, useRef } from "preact/hooks";
import { createMarkdownExtensions } from "./tiptap-extensions.mjs";

interface TiptapMarkdownEditorProps {
  documentId: string;
  markdown: string;
  onMarkdownChange: (markdown: string) => void;
}

export function TiptapMarkdownEditor({
  documentId,
  markdown,
  onMarkdownChange,
}: TiptapMarkdownEditorProps) {
  const editorElementRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const currentDocumentId = useRef(documentId);
  const latestMarkdown = useRef(markdown);
  const onMarkdownChangeRef = useRef(onMarkdownChange);

  useEffect(() => {
    onMarkdownChangeRef.current = onMarkdownChange;
  }, [onMarkdownChange]);

  useEffect(() => {
    if (!editorElementRef.current) {
      return;
    }

    const editor = new Editor({
      element: editorElementRef.current,
      extensions: createMarkdownExtensions(),
      content: markdown,
      contentType: "markdown",
      editorProps: {
        attributes: {
          "aria-label": "Markdown content",
          class: "tiptap-editor-surface",
          spellcheck: "true",
        },
      },
      onUpdate: ({ editor: updatedEditor }) => {
        const nextMarkdown = updatedEditor.getMarkdown();
        latestMarkdown.current = nextMarkdown;
        onMarkdownChangeRef.current(nextMarkdown);
      },
    });

    editorRef.current = editor;
    currentDocumentId.current = documentId;
    latestMarkdown.current = markdown;

    return () => {
      editor.destroy();
      editorRef.current = null;
    };
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || currentDocumentId.current === documentId) {
      return;
    }

    currentDocumentId.current = documentId;
    latestMarkdown.current = markdown;
    editor.commands.setContent(markdown, {
      emitUpdate: false,
      contentType: "markdown",
    });
  }, [documentId, markdown]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || currentDocumentId.current !== documentId) {
      return;
    }

    if (markdown === latestMarkdown.current) {
      return;
    }

    latestMarkdown.current = markdown;
    editor.commands.setContent(markdown, {
      emitUpdate: false,
      contentType: "markdown",
    });
  }, [documentId, markdown]);

  return <div className="tiptap-editor" ref={editorElementRef} />;
}

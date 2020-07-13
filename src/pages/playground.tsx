import { useState } from "react";
import { EditorState } from "draft-js";
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("../components/new-editor"), {
  ssr: false,
  loading: () => <p>...</p>
});

export default function Playground() {
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());

  return <Editor editorState={editorState} onChange={setEditorState} />;
}

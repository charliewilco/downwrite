import { useRef } from "react";
import { Editor, EditorState, ContentBlock } from "draft-js";

function getBlockStyle(block: ContentBlock) {
  switch (block.getType()) {
    case "blockquote":
      return "RichEditor-blockquote";
    default:
      return "";
  }
}

// Custom overrides for "code" style.
const styleMap = {
  CODE: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    fontSize: 14,
    padding: 2
  }
};

interface IEditorProps {
  editorState: EditorState;
  onChange(state: EditorState): void;
}

export default function NewEditor(props: IEditorProps) {
  let editorRef = useRef<Editor>(null);
  return (
    <div className="max-w-3xl mx-auto my-5 relative">
      <Editor
        ref={editorRef}
        blockStyleFn={getBlockStyle}
        customStyleMap={styleMap}
        editorState={props.editorState}
        onChange={props.onChange}
        spellCheck
        placeholder="History will be kind to me for I intend to write it. — Winston Churchill"
      />
    </div>
  );
}

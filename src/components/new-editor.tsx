import { useRef } from "react";
import { Editor } from "draft-js";
import {
  useDecorators,
  useEditor,
  useEditorState,
  emptyContentState,
  prismHighlightDecorator,
  imageLinkDecorators
} from "../editor";

export default function NewEditor() {
  const decorators = useDecorators([imageLinkDecorators, prismHighlightDecorator]);
  const [editorState, actions] = useEditorState({
    decorators,
    contentState: emptyContentState
  });
  const editorProps = useEditor(actions);
  let editorRef = useRef<Editor>(null);
  return (
    <div className="max-w-3xl mx-auto my-5 relative">
      <Editor
        ref={editorRef}
        {...editorProps}
        editorState={editorState}
        spellCheck
        placeholder="History will be kind to me for I intend to write it. — Winston Churchill"
      />
    </div>
  );
}

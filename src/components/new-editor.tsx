import { useRef } from "react";
import { Editor } from "draft-js";
import {
  useDecorators,
  useEditor,
  useEditorState,
  PrismDecorator,
  imageLinkDecorators
} from "../editor";

const prism = new PrismDecorator();

export default function NewEditor() {
  const decorators = useDecorators([imageLinkDecorators, prism]);
  const [editorState, setEditorState, getEditorState] = useEditorState({
    decorators
  });
  const editorProps = useEditor({ getEditorState, setEditorState });
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

import { Editor } from "draft-js";
import {
  useDecorators,
  useEditor,
  useEditorState,
  useInlineStyles,
  emptyContentState
} from "@hooks/index";
import { prismHighlightDecorator } from "./prism";
import { imageLinkDecorators } from "./decorators";

export default function NewEditor() {
  const decorators = useDecorators([imageLinkDecorators, prismHighlightDecorator]);
  const [editorState, actions] = useEditorState({
    decorators,
    contentState: emptyContentState
  });
  const editorProps = useEditor(actions);
  const { onItalic, onBold } = useInlineStyles({
    onChange: editorProps.onChange,
    editorState
  });

  return (
    <>
      <div className="border-b border-gray-200 py-4 mb-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4"
          onClick={onBold}>
          Bold
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={onItalic}>
          Italic
        </button>
      </div>
      <Editor {...editorProps} editorState={editorState} />
    </>
  );
}

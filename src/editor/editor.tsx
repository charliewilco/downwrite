import { Editor } from "draft-js";
import {
  useDecorators,
  useEditor,
  useEditorState,
  useInlineStyles,
} from "./hooks";
import { PrismDecorator } from "./prism";
import { imageLinkDecorators } from "./decorators";

const prism = new PrismDecorator();

export default function NewEditor() {
  const decorators = useDecorators([imageLinkDecorators, prism]);
  const [editorState, setEditorState, getEditorState] = useEditorState({
    decorators,
  });
  const editorProps = useEditor({ getEditorState, setEditorState });
  const { onItalic, onBold } = useInlineStyles({
    onChange: editorProps.onChange,
    editorState,
  });

  return (
    <>
      <div className="border-b border-gray-200 py-4 mb-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4"
          onClick={onBold}
        >
          Bold
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={onItalic}
        >
          Italic
        </button>
      </div>
      <Editor {...editorProps} editorState={editorState} />
    </>
  );
}

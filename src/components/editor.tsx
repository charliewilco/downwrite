import { useRef, useCallback } from "react";
import {
  Editor,
  DraftHandleValue,
  DraftEditorCommand,
  getDefaultKeyBinding,
  KeyBindingUtil,
  RichUtils,
  EditorProps
} from "draft-js";
import classNames from "@utils/classnames";
import * as DefaultStyles from "@utils/default-styles";
import { useSettings } from "@reducers/app";

type OmittedEditorProps =
  | "ref"
  | "handleKeyCommand"
  | "keyBindingFn"
  | "customStyleMap"
  | "placeholder"
  | "spellCheck";

interface IEditorProps extends Omit<EditorProps, OmittedEditorProps> {
  className?: string;
  editorCommand: DraftEditorCommand;
  onSave: () => void;
}

// Custom overrides for "code" style.
const styleMap = {
  CODE: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    fontFamily: DefaultStyles.Fonts.monospace,
    fontSize: 14,
    padding: 2
  }
};

export default function DownwriteEditor({
  onSave,
  editorCommand,
  ...props
}: IEditorProps) {
  let editorRef = useRef<Editor>(null);
  const [{ editorFont }] = useSettings();

  let contentState: Draft.ContentState = props.editorState.getCurrentContent();
  let className = classNames(
    "px-0 py-4 w-full h-full RichEditor-editor",
    props.className,
    !contentState.hasText() &&
      contentState.getBlockMap().first().getType() !== "unstyled" &&
      "RichEditor-hidePlaceholder"
  );

  function onFocus(): void {
    editorRef.current!.focus();
  }

  const saveKeyListener = useCallback(
    (e: React.KeyboardEvent): DraftEditorCommand | null => {
      if (e.keyCode === 83 && KeyBindingUtil.hasCommandModifier(e)) {
        return editorCommand;
      }

      return getDefaultKeyBinding(e);
    },
    [editorCommand]
  );

  const handleKeyCommand = useCallback(
    (command: string, state: Draft.EditorState): DraftHandleValue => {
      const newState = RichUtils.handleKeyCommand(state, command);

      if (newState) {
        props.onChange(newState);
        return "handled";
      }

      if (command === editorCommand) {
        onSave();
        return "handled";
      }

      return "not-handled";
    },

    [onSave, editorCommand]
  );

  return (
    <div className="relative pt-6 pb-64 mb-64" style={{ fontFamily: editorFont }}>
      <div className={className} onClick={onFocus}>
        <Editor
          ref={editorRef}
          handleKeyCommand={handleKeyCommand}
          keyBindingFn={saveKeyListener}
          customStyleMap={styleMap}
          placeholder="History will be kind to me for I intend to write it. — Winston Churchill"
          spellCheck
          {...props}
        />
      </div>
    </div>
  );
}

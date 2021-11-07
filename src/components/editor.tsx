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
import { Fonts } from "@utils/default-styles";
import { useStore } from "@reducers/app";

type OmittedEditorProps =
  | "ref"
  | "keyBindingFn"
  | "customStyleMap"
  | "placeholder"
  | "spellCheck";

interface IEditorProps extends Omit<EditorProps, OmittedEditorProps> {
  className?: string;
  onSave: () => void;
}

// Custom overrides for "code" style.
const styleMap = {
  CODE: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    fontFamily: Fonts.monospace,
    fontSize: 14,
    padding: 2
  }
};

const SAVE_COMMAND = "save_command";

const saveKeyListener = (
  e: React.KeyboardEvent
): DraftEditorCommand | typeof SAVE_COMMAND | null => {
  if (e.keyCode === 83 && KeyBindingUtil.hasCommandModifier(e)) {
    return SAVE_COMMAND;
  }

  return getDefaultKeyBinding(e);
};

export default function DownwriteEditor({ onSave, ...props }: IEditorProps) {
  let editorRef = useRef<Editor>(null);
  const store = useStore();

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

  const customHandleKeyCommand = useCallback(
    (command: string, state: Draft.EditorState): DraftHandleValue => {
      const newState = RichUtils.handleKeyCommand(state, command);

      if (newState) {
        props.onChange(newState);
        return "handled";
      }

      if (command === SAVE_COMMAND) {
        onSave();
        return "handled";
      }

      // handleKeyCommand(command, state, eventTimeStamp);

      return "not-handled";
    },

    [onSave]
  );

  return (
    <div
      className="relative pt-6 pb-64 mb-64"
      style={{ fontFamily: store.settings.editorFont }}>
      <div className={className} onClick={onFocus}>
        <Editor
          ref={editorRef}
          handleKeyCommand={customHandleKeyCommand}
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

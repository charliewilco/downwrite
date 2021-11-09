import { useRef, useCallback } from "react";
import css from "styled-jsx/css";
import {
  Editor,
  DraftEditorCommand,
  getDefaultKeyBinding,
  KeyBindingUtil,
  RichUtils
} from "draft-js";
import type { EditorProps, DraftHandleValue } from "draft-js";

const overrides = css.global`
  .RichEditor-root {
    font-size: 14px;
  }

  .RichEditor-editor {
    cursor: text;
    position: relative;
    font-family: var(--monospace);
  }

  .public-DraftEditorPlaceholder-inner {
    opacity: 0.5;
    margin-top: 16px;
    position: absolute;
    top: 0;
    font-style: italic;
  }

  .RichEditor-editor .public-DraftEditor-content {
    min-height: 100px;
  }

  .RichEditor-hidePlaceholder .public-DraftEditorPlaceholder-root {
    display: none;
  }

  .RichEditor-editor .RichEditor-blockquote {
    border-left: 5px solid #eee;
    color: #666;
    font-family: inherit;
    font-style: italic;
    margin: 16px 0 16px -5px;
    padding: 10px 20px;
  }

  .RichEditor-editor .public-DraftStyleDefault-pre {
    background-color: rgba(0, 0, 0, 0.05);
    font-size: 16px;
    padding: 20px;
  }

  .RichEditor-controls {
    font-family: inherit;
    font-size: 13px;
    user-select: none;
  }

  .RichEditor-styleButton {
    color: #999;
    cursor: pointer;
    margin-right: 16px;
    padding: 2px 0;
    display: inline-block;
  }

  .RichEditor-activeButton {
    color: #5890ff;
  }

  /*
** Overrides for Draft.js
*/

  .RichEditor-editor h2 {
    font-size: 137.5%;
  }

  .RichEditor-editor h3 {
    font-size: 125%;
  }

  .RichEditor-editor h4 {
    font-size: 112.5%;
  }

  .RichEditor-editor h5 {
    font-size: 100%;
  }

  .RichEditor-editor h6 {
    font-size: 87.5%;
  }

  .RichEditor-editor pre {
    background: #f4f5f5;
    padding: 0.75rem;
    font-size: 13px;
  }

  .public-DraftStyleDefault-orderedListItem > *,
  .public-DraftStyleDefault-unorderedListItem > * {
    display: inline;
  }
`;

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
    fontFamily: "var(--monospace)",
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

  let contentState: Draft.ContentState = props.editorState.getCurrentContent();
  let className = "RichEditor-editor";
  if (!contentState.hasText()) {
    if (contentState.getBlockMap().first().getType() !== "unstyled") {
      className += " RichEditor-hidePlaceholder";
    }
  }

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

    [onSave, props]
  );

  return (
    <div>
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
      <style jsx global>
        {overrides}
      </style>
    </div>
  );
}

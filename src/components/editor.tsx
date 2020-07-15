import PluginsEditor from "draft-js-plugins-editor";
import { useRef } from "react";
import {
  DraftEditorCommand,
  EditorState,
  ContentBlock,
  getDefaultKeyBinding,
  KeyBindingUtil,
  RichUtils
} from "draft-js";
import Prism from "prismjs";
import createMarkdownPlugin from "draft-js-markdown-plugin";
import createPrismPlugin from "draft-js-prism-plugin";
import { __IS_TEST__ } from "@utils/dev";
import * as DefaultStyles from "@utils/default-styles";
import { useSettings } from "@reducers/app";

type Handler = "handled" | "not-handled";

interface IEditorProps {
  editorCommand: DraftEditorCommand;
  editorState: EditorState;
  onChange: (e: EditorState) => void;
  onSave: () => void;
  onFocus?: () => void;
  toolbar?: boolean;
}

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
    fontFamily: DefaultStyles.Fonts.monospace,
    fontSize: 14,
    padding: 2
  }
};

export default function DownwriteEditor(props: IEditorProps) {
  let editorRef = useRef<PluginsEditor>(null);
  const [{ editorFont }] = useSettings();

  const plugins = __IS_TEST__
    ? []
    : [createPrismPlugin({ prism: Prism }), createMarkdownPlugin()];

  let className = "px-0 py-4 w-full h-full RichEditor-editor";

  let contentState: Draft.ContentState = props.editorState.getCurrentContent();
  if (!contentState.hasText()) {
    if (
      contentState
        .getBlockMap()
        .first()
        .getType() !== "unstyled"
    ) {
      className += " RichEditor-hidePlaceholder";
    }
  }

  function onFocus(): void {
    editorRef.current!.focus();
  }

  function onTab(e: React.KeyboardEvent<{}>): void {
    const maxDepth = 4;
    props.onChange(RichUtils.onTab(e, props.editorState, maxDepth));
  }

  function saveKeyListener(e: React.KeyboardEvent): DraftEditorCommand | null {
    if (e.keyCode === 83 && KeyBindingUtil.hasCommandModifier(e)) {
      return props.editorCommand;
    }

    return getDefaultKeyBinding(e);
  }

  function handleKeyCommand(command: string, state: Draft.EditorState): Handler {
    const newState = RichUtils.handleKeyCommand(state, command);

    if (newState) {
      props.onChange(newState);
      return "handled";
    }

    if (command === props.editorCommand) {
      props.onSave();
      return "handled";
    }

    return "not-handled";
  }

  return (
    <div className="relative pt-6 pb-64 mb-64" style={{ fontFamily: editorFont }}>
      <div className={className} onClick={onFocus}>
        <PluginsEditor
          onFocus={props.onFocus}
          handleKeyCommand={handleKeyCommand}
          keyBindingFn={saveKeyListener}
          blockStyleFn={getBlockStyle}
          customStyleMap={styleMap}
          editorState={props.editorState}
          onChange={props.onChange}
          onTab={onTab}
          placeholder="History will be kind to me for I intend to write it. — Winston Churchill"
          ref={editorRef}
          spellCheck
          plugins={plugins}
        />
      </div>
    </div>
  );
}

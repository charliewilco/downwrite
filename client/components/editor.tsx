import PluginsEditor from "draft-js-plugins-editor";
import * as React from "react";
import * as Draft from "draft-js";
import Prism from "prismjs";
import createMarkdownPlugin from "draft-js-markdown-plugin";
import createPrismPlugin from "draft-js-prism-plugin";
import DraftStyles from "./draft-styles";
import { LocalUISettings, ILocalUISettings } from "./local-ui-settings";
import { __IS_TEST__ } from "../utils/dev";

import * as DefaultStyles from "../utils/defaultStyles";

type Handler = "handled" | "not-handled";

interface IEditorProps {
  editorCommand: string;
  editorState: Draft.EditorState;
  onChange: (e: Draft.EditorState) => void;
  onSave: () => void;
  onFocus?: () => void;
  toolbar?: boolean;
}

export default function DownwriteEditor(props: IEditorProps) {
  let editorRef = React.useRef<PluginsEditor>(null);

  const { monospace } = React.useContext<ILocalUISettings>(LocalUISettings);
  const plugins = __IS_TEST__
    ? []
    : [createPrismPlugin({ prism: Prism }), createMarkdownPlugin()];

  let className: string = "EditorWrapper RichEditor-editor";
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

  const focus = (): void => {
    editorRef.current.focus();
  };

  const onTab = (e: React.KeyboardEvent<{}>) => {
    const maxDepth = 4;
    props.onChange(Draft.RichUtils.onTab(e, props.editorState, maxDepth));
  };

  const saveKeyListener = (e: React.KeyboardEvent): string => {
    if (e.keyCode === 83 && Draft.KeyBindingUtil.hasCommandModifier(e)) {
      return props.editorCommand;
    }

    return Draft.getDefaultKeyBinding(e);
  };

  const handleKeyCommand = (
    command: string,
    editorState: Draft.EditorState
  ): Handler => {
    const newState = Draft.RichUtils.handleKeyCommand(editorState, command);

    if (newState) {
      props.onChange(newState);
      return "handled";
    }

    if (command === props.editorCommand) {
      props.onSave();
      return "handled";
    }

    return "not-handled";
  };

  return (
    <div className="Shell">
      <DraftStyles />
      <div className={className} onClick={focus}>
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
      <style jsx>{`
        .EditorWrapper {
          padding-left: 0px;
          padding-right: 0px;
          padding-top: 16px;
          padding-bottom: 16px;
          height: 100%;
          width: 100%;
        }

        .Shell {
          border-top: 0px;
          position: relative;
          padding-top: 24px;
          padding-bottom: 128px;
          font-family: ${monospace};
        }

        select {
          float: right;
          border: 0;
          background: none;
          color: ${DefaultStyles.colors.blue700};
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica,
            Arial, sans-serif;
        }
      `}</style>
    </div>
  );
}

// Custom overrides for "code" style.
const styleMap = {
  CODE: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    fontFamily: DefaultStyles.fonts.monospace,
    fontSize: 14,
    padding: 2
  }
};

function getBlockStyle(block: Draft.ContentBlock) {
  switch (block.getType()) {
    case "blockquote":
      return "RichEditor-blockquote";
    default:
      return null;
  }
}

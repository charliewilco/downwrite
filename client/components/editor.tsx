import PluginsEditor from "draft-js-plugins-editor";
import * as React from "react";
import * as Draft from "draft-js";
import Prism from "prismjs";
import createMarkdownPlugin from "draft-js-markdown-plugin";
import createPrismPlugin from "draft-js-prism-plugin";
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
      <style jsx global>{`
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

        .Shell select {
          float: right;
          border: 0;
          background: none;
          color: ${DefaultStyles.colors.blue700};
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica,
            Arial, sans-serif;
        }

        .RichEditor-root {
          font-size: 14px;
        }

        .RichEditor-editor {
          cursor: text;
          position: relative;
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
          font-family: "Input Mono", "SFMono-Regular", Consolas, "Liberation Mono",
            Menlo, Courier, monospace;
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

        .NightMode .RichEditor-editor pre {
          color: #4c4c4c;
        }

        .public-DraftStyleDefault-orderedListItem > *,
        .public-DraftStyleDefault-unorderedListItem > * {
          display: inline;
        }
      `}</style>
    </div>
  );
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

function getBlockStyle(block: Draft.ContentBlock) {
  switch (block.getType()) {
    case "blockquote":
      return "RichEditor-blockquote";
    default:
      return null;
  }
}

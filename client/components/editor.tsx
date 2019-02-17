import PluginsEditor from "draft-js-plugins-editor";
import * as React from "react";
import * as Draft from "draft-js";
import Prism from "prismjs";
import styled from "styled-components";

import createMarkdownPlugin from "draft-js-markdown-plugin";
import createPrismPlugin from "draft-js-prism-plugin";
import DraftStyles from "./draft-styles";
import { LocalUISettings, ILocalUISettings } from "./local-ui-settings";
import { __IS_TEST__ } from "../utils/dev";

import * as DefaultStyles from "../utils/defaultStyles";

const EditorWrapper = styled.div`
  padding-left: 0px;
  padding-right: 0px;
  padding-top: 16px;
  padding-bottom: 16px;
  height: 100%;
  width: 100%;

  select {
    float: right;
    border: 0;
    background: none;
    color: ${DefaultStyles.colors.blue700};
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial,
      sans-serif;
  }
`;

const EditorShell = styled.div<{ font: string }>`
  border-top: 0px;
  position: relative;
  padding-top: 24px;
  padding-bottom: 128px;
  font-family: ${props => props.font};
`;

type Handler = "handled" | "not-handled";

interface IEditorProps {
  editorCommand: string;
  editorState: Draft.EditorState;
  onChange: (e: Draft.EditorState) => void;
  onSave: () => void;
  onFocus?: () => void;
  toolbar?: boolean;
}

interface IEditorState {
  plugins: any[];
}

export default class DWEditor extends React.Component<IEditorProps, IEditorState> {
  public static displayName = "DWEditor";

  public static defaultProps = {
    toolbar: false
  };

  public static contextType: React.Context<ILocalUISettings> = LocalUISettings;

  private editor: PluginsEditor = null as PluginsEditor;

  public readonly state = {
    plugins: __IS_TEST__
      ? []
      : [createPrismPlugin({ prism: Prism }), createMarkdownPlugin()]
  };

  private focus = (): void => this.editor.focus();

  private onChange = (editorState: Draft.EditorState) =>
    this.props.onChange(editorState);

  private onTab = (e: React.KeyboardEvent<{}>) => {
    const maxDepth = 4;
    this.onChange(Draft.RichUtils.onTab(e, this.props.editorState, maxDepth));
  };

  // private _toggleBlockType = (blockType: Draft.DraftBlockType) => {
  //   this.onChange(
  //     Draft.RichUtils.toggleBlockType(this.props.editorState, blockType)
  //   );
  // };

  // private _toggleInlineStyle = (inlineStyle: string) => {
  //   this.onChange(
  //     Draft.RichUtils.toggleInlineStyle(this.props.editorState, inlineStyle)
  //   );
  // };

  private handleKeyCommand = (
    command: string,
    editorState: Draft.EditorState
  ): Handler => {
    const newState = Draft.RichUtils.handleKeyCommand(editorState, command);

    if (newState) {
      this.onChange(newState);
      return "handled";
    }

    if (command === this.props.editorCommand) {
      this.props.onSave();
      return "handled";
    }

    return "not-handled";
  };

  private saveKeyListener = (e: React.KeyboardEvent): string => {
    if (e.keyCode === 83 && Draft.KeyBindingUtil.hasCommandModifier(e)) {
      return this.props.editorCommand;
    }

    return Draft.getDefaultKeyBinding(e);
  };

  public render(): JSX.Element {
    const { editorState } = this.props;
    const { plugins } = this.state;

    const { monospace } = this.context;

    // If the user changes block type before entering any text, we can
    // either style the placeholder or hide it. Let's just hide it now.
    let className = "RichEditor-editor";
    let contentState = editorState.getCurrentContent();
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

    return (
      <EditorShell font={monospace}>
        <DraftStyles />
        <EditorWrapper className={className} onClick={this.focus}>
          <PluginsEditor
            onFocus={this.props.onFocus}
            handleKeyCommand={this.handleKeyCommand}
            keyBindingFn={this.saveKeyListener}
            blockStyleFn={getBlockStyle}
            customStyleMap={styleMap}
            editorState={editorState}
            onChange={this.onChange}
            onTab={this.onTab}
            placeholder="History will be kind to me for I intend to write it. — Winston Churchill"
            ref={(x: PluginsEditor) => (this.editor = x)}
            spellCheck
            plugins={plugins}
          />
        </EditorWrapper>
      </EditorShell>
    );
  }
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

import Editor from 'draft-js-plugins-editor';
import * as React from 'react';
import * as Draft from 'draft-js';
import Prism from 'prismjs';
import styled from 'styled-components';

import createMarkdownPlugin from 'draft-js-markdown-plugin';
import createPrismPlugin from 'draft-js-prism-plugin';
import { fonts, colors } from '../utils/defaultStyles';
import './draft.css';
import './ganymede.css';

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
    color: ${colors.blue700};
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial,
      sans-serif;
  }
`;

const EditorShell = styled.div`
  border-top: 0px;
  position: relative;
  padding-top: 24px;
  padding-bottom: 128px;
`;

interface IEditorProps {
  editorState: Draft.EditorState;
  onChange: (e: Draft.EditorState) => void;
  toolbar?: boolean;
  handleKeyCommand: () => void;
  keyBindingFn: () => void;
}

interface IEditorState {
  editorState: Draft.EditorState;
  plugins: any[];
}

export default class extends React.Component<IEditorProps, IEditorState> {
  static displayName = 'DWEditor';

  static defaultProps = {
    toolbar: false
  };

  state = {
    editorState: this.props.editorState,
    plugins: [createPrismPlugin({ prism: Prism }), createMarkdownPlugin()]
  };

  focus = () => this.editor.focus();

  onChange = editorState => this.props.onChange(editorState);

  onTab = e => {
    const maxDepth = 4;
    this.onChange(Draft.RichUtils.onTab(e, this.props.editorState, maxDepth));
  };

  _toggleBlockType = blockType => {
    this.onChange(
      Draft.RichUtils.toggleBlockType(this.props.editorState, blockType)
    );
  };

  _toggleInlineStyle = inlineStyle => {
    this.onChange(
      Draft.RichUtils.toggleInlineStyle(this.props.editorState, inlineStyle)
    );
  };

  render() {
    const { editorState, handleKeyCommand, keyBindingFn } = this.props;
    const { plugins } = this.state;
    // If the user changes block type before entering any text, we can
    // either style the placeholder or hide it. Let's just hide it now.
    let className = 'RichEditor-editor';
    var contentState = editorState.getCurrentContent();
    if (!contentState.hasText()) {
      if (
        contentState
          .getBlockMap()
          .first()
          .getType() !== 'unstyled'
      ) {
        className += ' RichEditor-hidePlaceholder';
      }
    }

    return (
      <EditorShell>
        <EditorWrapper className={className} onClick={this.focus}>
          <Editor
            handleKeyCommand={handleKeyCommand}
            keyBindingFn={keyBindingFn}
            blockStyleFn={getBlockStyle}
            customStyleMap={styleMap}
            editorState={editorState}
            onChange={editorState => this.onChange(editorState)}
            onTab={this.onTab}
            placeholder="History will be kind to me for I intend to write it. — Winston Churchill"
            ref={(x: Draft.Editor) => (this.editor = x)}
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
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    fontFamily: fonts.monospace,
    fontSize: 14,
    padding: 2
  }
};

function getBlockStyle(block) {
  switch (block.getType()) {
    case 'blockquote':
      return 'RichEditor-blockquote';
    default:
      return null;
  }
}

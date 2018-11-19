import * as React from "react";
import * as Draft from "draft-js";
import styled from "styled-components";
import { ToastNoPosition as Toast } from "./toast";

const Meta = styled.div`
  opacity: 0.5;
  font-size: small;
  padding: 8px;
`;

const WordCounterContainer = styled.div`
  margin: 16px 8px;
  right: 0;
  bottom: 0;
  z-index: 50;
  position: fixed;
`;

interface IWordCounterers {
  limit?: number;
  editorState: Draft.EditorState;
}

export default class WordCounter extends React.Component<IWordCounterers, any> {
  static displayName = "WordCounter";

  getSelectionCount(editorState: Draft.EditorState): number {
    let selectionState = editorState.getSelection();
    let anchorKey = selectionState.getAnchorKey();
    let currentContent = editorState.getCurrentContent();
    let currentContentBlock = currentContent.getBlockForKey(anchorKey);
    let start = selectionState.getStartOffset();
    let end = selectionState.getEndOffset();
    let selectedText = currentContentBlock.getText().slice(start, end);

    return this.createWordCount(selectedText);
  }

  createWordCount(str: string): number {
    let regex = /(?:\r\n|\r|\n)/g; // new line, carriage return, line feed
    let cleanString = str.replace(regex, " ").trim(); // replace above characters w/ space
    let wordArray = cleanString.match(/\S+/g); // matches words according to whitespace

    return wordArray ? wordArray.length : 0;
  }

  getWordCount(editorState: Draft.EditorState): number {
    let plainText = editorState.getCurrentContent().getPlainText("");

    return this.createWordCount(plainText);
  }

  render() {
    const { editorState } = this.props;

    let count: number = this.getWordCount(editorState);
    let selectionCount: number = this.getSelectionCount(editorState);

    let displayCount: number = selectionCount > 0 ? selectionCount : count;

    return (
      <WordCounterContainer>
        <Toast>
          <Meta>
            <small>Word Count: {displayCount}</small>
          </Meta>
        </Toast>
      </WordCounterContainer>
    );
  }
}

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

function getSelectionCount(editorState: Draft.EditorState): number {
  let selectionState = editorState.getSelection();
  let anchorKey = selectionState.getAnchorKey();
  let currentContent = editorState.getCurrentContent();
  let currentContentBlock = currentContent.getBlockForKey(anchorKey);
  let start = selectionState.getStartOffset();
  let end = selectionState.getEndOffset();
  let selectedText = currentContentBlock.getText().slice(start, end);

  return createWordCount(selectedText);
}

function createWordCount(str: string): number {
  let regex = /(?:\r\n|\r|\n)/g; // new line, carriage return, line feed
  let cleanString = str.replace(regex, " ").trim(); // replace above characters w/ space
  let wordArray = cleanString.match(/\S+/g); // matches words according to whitespace

  return wordArray ? wordArray.length : 0;
}

function getWordCount(editorState: Draft.EditorState): number {
  let plainText = editorState.getCurrentContent().getPlainText("");

  return createWordCount(plainText);
}

const WordCounter: React.FC<IWordCounterers> = function(props) {
  const displayCount = React.useMemo(() => {
    const selection = getSelectionCount(props.editorState);
    const words = getWordCount(props.editorState);
    return selection > 0 ? selection : words;
  }, [props.editorState]);

  return (
    <WordCounterContainer>
      <Toast>
        <Meta>
          <small>Word Count: {displayCount}</small>
        </Meta>
      </Toast>
    </WordCounterContainer>
  );
};

export default WordCounter;

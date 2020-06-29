import { useMemo } from "react";
import * as Draft from "draft-js";

interface IWordCounterProps {
  limit?: number;
  editorState: Draft.EditorState;
}

function createWordCount(str: string): number {
  let regex = /(?:\r\n|\r|\n)/g; // new line, carriage return, line feed
  let cleanString = str.replace(regex, " ").trim(); // replace above characters w/ space
  let wordArray = cleanString.match(/\S+/g); // matches words according to whitespace

  return wordArray ? wordArray.length : 0;
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

function getWordCount(editorState: Draft.EditorState): number {
  let plainText = editorState.getCurrentContent().getPlainText("");

  return createWordCount(plainText);
}

export default function WordCounter(props: IWordCounterProps): JSX.Element {
  const displayCount = useMemo<number>(() => {
    const selection = getSelectionCount(props.editorState);
    const words = getWordCount(props.editorState);
    return selection > 0 ? selection : words;
  }, [props.editorState]);

  return (
    <div className="Sheet WordCountContainer">
      <div className="WordCount">
        <small className="WordCountMeta">Word Count: {displayCount}</small>
      </div>
    </div>
  );
}

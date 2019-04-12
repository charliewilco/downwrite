import * as React from "react";
import * as Draft from "draft-js";
import * as DefaultStyles from "../utils/defaultStyles";

interface IWordCounterProps {
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

export default function WordCounter(props: IWordCounterProps): JSX.Element {
  const displayCount = React.useMemo<number>(() => {
    const selection = getSelectionCount(props.editorState);
    const words = getWordCount(props.editorState);
    return selection > 0 ? selection : words;
  }, [props.editorState]);

  return (
    <div className="container">
      <div className="Toast">
        <small className="Meta">Word Count: {displayCount}</small>
      </div>
      <style jsx>{`
        .Toast {
          color: ${DefaultStyles.colors.text};
          background-color: white;
          box-shadow: var(--shadow);
          padding: 12px;
        }
        .container {
          margin: 16px 8px;
          right: 0;
          bottom: 0;
          z-index: 50;
          position: fixed;
        }
        .Meta {
          opacity: 0.5;
          font-size: small;
        }
      `}</style>
    </div>
  );
}

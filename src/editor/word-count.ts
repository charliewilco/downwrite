import type { EditorState } from "draft-js";

export function createWordCount(str: string): number {
	let regex = /(?:\r\n|\r|\n)/g; // new line, carriage return, line feed
	let cleanString = str.replace(regex, " ").trim(); // replace above characters w/ space
	let wordArray = cleanString.match(/\S+/g); // matches words according to whitespace

	return wordArray ? wordArray.length : 0;
}

export function getSelectionCount(editorState: EditorState): number {
	let selectionState = editorState.getSelection();
	let anchorKey = selectionState.getAnchorKey();
	let currentContent = editorState.getCurrentContent();
	let currentContentBlock = currentContent.getBlockForKey(anchorKey);
	let start = selectionState.getStartOffset();
	let end = selectionState.getEndOffset();
	let selectedText = currentContentBlock.getText().slice(start, end);

	return createWordCount(selectedText);
}

export function getWordCount(editorState: EditorState): number {
	let plainText = editorState.getCurrentContent().getPlainText("");

	return createWordCount(plainText);
}

import {
	genKey,
	RichUtils,
	EditorState,
	Modifier,
	ContentState,
	BlockMap,
	SelectionState,
	ContentBlock,
	DraftInlineStyle,
	DraftBlockType,
	EditorChangeType
} from "draft-js";
import { List, Map } from "immutable";
import { CHECKABLE_LIST_ITEM } from "./checklist";

export const leaveList = (editorState: EditorState) => {
	const contentState = editorState.getCurrentContent();
	const selection = editorState.getSelection();
	const key = selection.getStartKey();
	const currentBlock = contentState.getBlockForKey(key);
	const type = currentBlock.getType();
	return RichUtils.toggleBlockType(editorState, type);
};

export const insertText = (editorState: EditorState, text: string) => {
	const selection = editorState.getSelection();
	const content = editorState.getCurrentContent();
	const newContentState = Modifier.insertText(
		content,
		selection,
		text,
		editorState.getCurrentInlineStyle()
	);
	return EditorState.push(editorState, newContentState, "insert-fragment");
};

export const changeCurrentBlockType = (
	editorState: EditorState,
	type: DraftBlockType,
	text: string,
	blockMetadata: any = {}
) => {
	const t = type as unknown as Iterable<[string, any]>;
	const currentContent: ContentState = editorState.getCurrentContent();
	const selection: SelectionState = editorState.getSelection();
	const key: string = selection.getStartKey();
	const blockMap: BlockMap = currentContent.getBlockMap();
	const block: ContentBlock | undefined = blockMap.get(key);
	const data = block?.getData().merge(blockMetadata);
	const newBlock: ContentBlock = block?.merge({
		type: t,
		data,
		text: text || ""
	}) as any;
	const newSelection = selection.merge({
		anchorOffset: 0,
		focusOffset: 0
	});
	const newContentState = currentContent.merge({
		blockMap: blockMap.set(key, newBlock),
		selectionAfter: newSelection
	}) as ContentState;
	return EditorState.push(editorState, newContentState, "change-block-type");
};

export const changeCurrentInlineStyle = (
	editorState: EditorState,
	matchArr: RegExpExecArray,
	style: string | DraftInlineStyle
) => {
	const currentContent = editorState.getCurrentContent();
	const selection = editorState.getSelection();
	const key = selection.getStartKey();
	const { index } = matchArr;

	const blockMap = currentContent.getBlockMap();
	const block = blockMap.get(key);
	const currentInlineStyle = block?.getInlineStyleAt(index).merge();
	const newStyle: DraftInlineStyle = currentInlineStyle.merge([style as any]);
	const focusOffset = index + matchArr[0].length;
	const wordSelection = SelectionState.createEmpty(key).merge({
		anchorOffset: index + matchArr[0].indexOf(matchArr[1]),
		focusOffset
	});
	let newContentState = Modifier.replaceText(
		currentContent,
		wordSelection,
		matchArr[2],
		newStyle
	);
	newContentState = Modifier.insertText(
		newContentState,
		newContentState.getSelectionAfter(),
		matchArr[4]
	);
	const newEditorState = EditorState.push(
		editorState,
		newContentState,
		"change-inline-style"
	);
	return EditorState.forceSelection(
		newEditorState,
		newContentState.getSelectionAfter()
	);
};

export function addText(editorState: EditorState, bufferText: string) {
	const contentState = Modifier.insertText(
		editorState.getCurrentContent(),
		editorState.getSelection(),
		bufferText
	);
	return EditorState.push(editorState, contentState, "insert-characters");
}

export function replaceText(editorState: EditorState, bufferText: string) {
	const contentState = Modifier.replaceText(
		editorState.getCurrentContent(),
		editorState.getSelection(),
		bufferText
	);
	return EditorState.push(editorState, contentState, "insert-characters");
}

export const sharps = (len: number) => {
	let ret = "";
	while (ret.length < len) {
		ret += "#";
	}
	return ret;
};

const blockTypes: DraftBlockType[] = [
	"null",
	"header-one",
	"header-two",
	"header-three",
	"header-four",
	"header-five",
	"header-six",
	"blockquote"
];

export const handleBlockType = (editorState: EditorState, character: string) => {
	const currentSelection = editorState.getSelection();
	const key = currentSelection.getStartKey();
	const text = editorState.getCurrentContent().getBlockForKey(key).getText();
	const position = currentSelection.getAnchorOffset();
	const line = [text.slice(0, position), character, text.slice(position)].join("");
	const blockType = RichUtils.getCurrentBlockType(editorState);
	for (let i = 1; i <= 6; i += 1) {
		if (line.indexOf(`${sharps(i)} `) === 0 && blockType !== "code-block") {
			return changeCurrentBlockType(
				editorState,
				blockTypes[i],
				line.replace(/^#+\s/, "")
			);
		}
	}
	let matchArr = line.match(/^[*-] (.*)$/);
	if (matchArr) {
		return changeCurrentBlockType(editorState, "unordered-list-item", matchArr[1]);
	}
	matchArr = line.match(/^[\d]\. (.*)$/);
	if (matchArr) {
		return changeCurrentBlockType(editorState, "ordered-list-item", matchArr[1]);
	}
	matchArr = line.match(/^> (.*)$/);
	if (matchArr) {
		return changeCurrentBlockType(editorState, "blockquote", matchArr[1]);
	}
	matchArr = line.match(/^\[([x ])] (.*)$/i);
	if (matchArr && blockType === "unordered-list-item") {
		return changeCurrentBlockType(editorState, CHECKABLE_LIST_ITEM, matchArr[2], {
			checked: matchArr[1] !== " "
		});
	}
	return editorState;
};

export const handleImage = (editorState: EditorState, character: string) => {
	const re = /!\[([^\]]*)]\(([^)"]+)(?: "([^"]+)")?\)/g;
	const key = editorState.getSelection().getStartKey();
	const text = editorState.getCurrentContent().getBlockForKey(key).getText();
	const line = `${text}${character}`;
	let newEditorState = editorState;
	let matchArr;
	do {
		matchArr = re.exec(line);
		if (matchArr) {
			newEditorState = insertImage(newEditorState, matchArr);
		}
	} while (matchArr);
	return newEditorState;
};

type Matchers = {
	BOLD: RegExp;
	ITALIC: RegExp;
	CODE: RegExp;
	STRIKETHROUGH: RegExp;
};

const inlineMatchers: Matchers = {
	BOLD: /(?:^|\s|\n|[^A-z0-9_*~`])(\*{2}|_{2})((?!\1).*?)(\1)($|\s|\n|[^A-z0-9_*~`])/g,
	ITALIC:
		/(?:^|\s|\n|[^A-z0-9_*~`])(\*{1}|_{1})((?!\1).*?)(\1)($|\s|\n|[^A-z0-9_*~`])/g,
	CODE: /(?:^|\s|\n|[^A-z0-9_*~`])(`)((?!\1).*?)(\1)($|\s|\n|[^A-z0-9_*~`])/g,
	STRIKETHROUGH:
		/(?:^|\s|\n|[^A-z0-9_*~`])(~{2})((?!\1).*?)(\1)($|\s|\n|[^A-z0-9_*~`])/g
};

export const handleInlineStyle = (editorState: EditorState, character: string) => {
	const key = editorState.getSelection().getStartKey();
	const text = editorState.getCurrentContent().getBlockForKey(key).getText();
	const line = `${text}${character}`;
	let newEditorState = editorState;
	Object.keys(inlineMatchers).some((k) => {
		const re = inlineMatchers[k as keyof Matchers];
		let matchArr;
		do {
			matchArr = re.exec(line);
			if (matchArr) {
				newEditorState = changeCurrentInlineStyle(newEditorState, matchArr, k);
			}
		} while (matchArr);
		return newEditorState !== editorState;
	});
	return newEditorState;
};

export const insertEmptyBlock = (
	editorState: EditorState,
	blockType = "unstyled",
	data = {}
) => {
	const contentState = editorState.getCurrentContent();
	const selection = editorState.getSelection();
	const key = selection.getStartKey();
	const currentBlock = contentState.getBlockForKey(key);
	const emptyBlockKey = genKey();
	const emptyBlock = new ContentBlock({
		characterList: List(),
		depth: 0,
		key: emptyBlockKey,
		text: "",
		type: blockType,
		data: Map().merge(data)
	});
	const blockMap = contentState.getBlockMap();
	const blocksBefore = blockMap.toSeq().takeUntil((value) => value === currentBlock);
	const blocksAfter = blockMap
		.toSeq()
		.skipUntil((value) => value === currentBlock)
		.rest();
	const augmentedBlocks = [
		[currentBlock.getKey(), currentBlock],
		[emptyBlockKey, emptyBlock]
	];
	const newBlocks = blocksBefore.concat(augmentedBlocks, blocksAfter).toOrderedMap();
	const focusKey = emptyBlockKey;
	const newContentState: ContentState = contentState.merge({
		blockMap: newBlocks,
		selectionBefore: selection,
		selectionAfter: selection.merge({
			anchorKey: focusKey,
			anchorOffset: 0,
			focusKey,
			focusOffset: 0,
			isBackward: false
		})
	}) as ContentState;
	return EditorState.push(editorState, newContentState, "split-block");
};

export const insertImage = (editorState: EditorState, matchArr: any) => {
	const currentContent = editorState.getCurrentContent();
	const selection = editorState.getSelection();
	const key = selection.getStartKey();
	const [matchText, alt, src, title] = matchArr;
	const { index } = matchArr;
	const focusOffset = index + matchText.length;
	const wordSelection = SelectionState.createEmpty(key).merge({
		anchorOffset: index,
		focusOffset
	});
	const nextContent = currentContent.createEntity("IMG", "IMMUTABLE", {
		alt,
		src,
		title
	});
	const entityKey = nextContent.getLastCreatedEntityKey();
	let newContentState = Modifier.replaceText(
		nextContent,
		wordSelection,
		"\u200B",
		undefined,
		entityKey
	);
	newContentState = Modifier.insertText(
		newContentState,
		newContentState.getSelectionAfter(),
		" "
	);
	const newWordSelection = wordSelection.merge({
		focusOffset: index + 1
	});
	let newEditorState = EditorState.push(
		editorState,
		newContentState,
		"insert-image" as EditorChangeType
	);
	newEditorState = RichUtils.toggleLink(newEditorState, newWordSelection, entityKey);
	return EditorState.forceSelection(
		newEditorState,
		newContentState.getSelectionAfter()
	);
};

export const insertLink = (editorState: EditorState, matchArr: any) => {
	const currentContent = editorState.getCurrentContent();
	const selection = editorState.getSelection();
	const key = selection.getStartKey();
	const [matchText, text, href, title] = matchArr;
	const { index } = matchArr;
	const focusOffset = index + matchText.length;
	const wordSelection = SelectionState.createEmpty(key).merge({
		anchorOffset: index,
		focusOffset
	});
	const nextContent = currentContent.createEntity("LINK", "MUTABLE", {
		href,
		title
	});
	const entityKey = nextContent.getLastCreatedEntityKey();
	let newContentState = Modifier.replaceText(
		nextContent,
		wordSelection,
		text,
		undefined,
		entityKey
	);
	newContentState = Modifier.insertText(
		newContentState,
		newContentState.getSelectionAfter(),
		" "
	);
	const newWordSelection = wordSelection.merge({
		focusOffset: index + text.length
	});
	let newEditorState = EditorState.push(
		editorState,
		newContentState,
		"insert-link" as EditorChangeType
	);
	newEditorState = RichUtils.toggleLink(newEditorState, newWordSelection, entityKey);
	return EditorState.forceSelection(
		newEditorState,
		newContentState.getSelectionAfter()
	);
};

export const handleLink = (editorState: EditorState, character: string) => {
	const re = /\[([^\]]+)]\(([^)"]+)(?: "([^"]+)")?\)/g;
	const key = editorState.getSelection().getStartKey();
	const text = editorState.getCurrentContent().getBlockForKey(key).getText();
	const line = `${text}${character}`;
	let newEditorState = editorState;
	let matchArr;
	do {
		matchArr = re.exec(line);
		if (matchArr) {
			newEditorState = insertLink(newEditorState, matchArr);
		}
	} while (matchArr);
	return newEditorState;
};

export const handleNewCodeBlock = (editorState: EditorState) => {
	const contentState = editorState.getCurrentContent();
	const selection = editorState.getSelection();
	const key = selection.getStartKey();
	const currentBlock = contentState.getBlockForKey(key);
	const matchData = /^```([\w-]+)?$/.exec(currentBlock.getText());
	const isLast = selection.getEndOffset() === currentBlock.getLength();
	if (matchData && isLast) {
		const data: any = {};
		const language = matchData[1];
		if (language) {
			data.language = language;
		}
		return changeCurrentBlockType(editorState, "code-block", "", data);
	}
	const type = currentBlock.getType();
	if (type === "code-block" && isLast) {
		return insertEmptyBlock(editorState, "code-block", currentBlock.getData());
	}
	return editorState;
};

import { useState, useCallback, useMemo } from "react";
import {
	EditorState,
	EditorProps,
	RichUtils,
	CompositeDecorator,
	convertFromRaw,
	ContentState
} from "draft-js";
import { getWordCount, getSelectionCount } from "../editor/word-count";
import { createEditorProps, IPropCreation } from "../editor/create-editor-props";
import { MultiDecorator } from "../editor/multidecorator";

interface IInitializeEditorState {
	contentState?: ContentState;
	decorators?: CompositeDecorator;
}

export const emptyContentState = convertFromRaw({
	entityMap: {},
	blocks: [
		{
			text: "",
			depth: 0,
			key: "foo",
			type: "unstyled",
			inlineStyleRanges: [],
			entityRanges: []
		}
	]
});

export const useEditorState = ({
	contentState,
	decorators
}: IInitializeEditorState) => {
	const [editorState, setEditorState] = useState(() => {
		const state = EditorState.createWithContent(
			contentState ?? emptyContentState,
			decorators
		);

		return state;
	});

	const getEditorState = () => editorState;

	return [editorState, { setEditorState, getEditorState }] as const;
};

export const useDecorators = (
	decorators: CompositeDecorator[]
): CompositeDecorator => {
	return useMemo(() => new MultiDecorator(decorators), [decorators]);
};

export const useEditor = (
	state: IPropCreation
): Omit<EditorProps, "editorState"> => {
	return useMemo<Omit<EditorProps, "editorState">>(() => {
		const props = createEditorProps(state);
		return {
			...props,
			// onTab: (e: React.KeyboardEvent<{}>) =>
			//   state.setEditorState(RichUtils.onTab(e, state.getEditorState(), 4)),
			onChange: (editorState) => state.setEditorState(editorState)
		};
	}, [state]);
};

export const useInlineStyles = ({
	onChange,
	editorState
}: Pick<EditorProps, "onChange" | "editorState">) => {
	const onBold = useCallback(() => {
		const n = (editorState: EditorState) =>
			RichUtils.toggleInlineStyle(editorState, "BOLD");
		onChange(n(editorState));
	}, [onChange, editorState]);

	const onItalic = useCallback(() => {
		const n = (editorState: EditorState) =>
			RichUtils.toggleInlineStyle(editorState, "ITALIC");
		onChange(n(editorState));
	}, [onChange, editorState]);

	return {
		onBold,
		onItalic
	};
};

export const useWordCount = (editorState: EditorState | null) => {
	return useMemo<number>(() => {
		if (editorState === null) {
			return 0;
		}

		const selection = getSelectionCount(editorState);
		const words = getWordCount(editorState);
		return selection > 0 ? selection : words;
	}, [editorState]);
};

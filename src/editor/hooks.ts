import { useState, useCallback, useMemo } from "react";
import {
  EditorState,
  EditorProps,
  RichUtils,
  CompositeDecorator,
  convertFromRaw,
  ContentState
} from "draft-js";
import { createEditorProps, IPropCreation } from "./create-editor-props";
import { MultiDecorator } from "./multidecorator";

interface IInitializeEditorState {
  contentState: ContentState;
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
      contentState || emptyContentState,
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
  const handleKeyCommand = useCallback(
    (command, editorState) => {
      const newState = RichUtils.handleKeyCommand(editorState, command);

      if (newState) {
        state.setEditorState(newState);
        return "handled";
      }

      return "not-handled";
    },
    [state]
  );

  return useMemo<Omit<EditorProps, "editorState">>(() => {
    const props = createEditorProps(state);
    return {
      ...props,
      onTab: (e: React.KeyboardEvent<{}>) =>
        state.setEditorState(RichUtils.onTab(e, state.getEditorState(), 4)),
      onChange: (editorState) => state.setEditorState(editorState),
      handleKeyCommand
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

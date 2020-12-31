import { useEffect } from "react";
import { EditActions } from "@reducers/editor";
import { useEditQuery } from "@utils/generated";
import { useEditReducer } from "./useEditReducer";
import { useUpdateEntry } from "./useUpdateEntryMutation";
import {
  useEditorState,
  useDecorators,
  imageLinkDecorators,
  prismHighlightDecorator
} from "../editor";
import { convertFromRaw, RawDraftContentState } from "draft-js";

export function useEdit(id: string, raw: RawDraftContentState) {
  const { loading, data, error } = useEditQuery({
    variables: {
      id
    }
  });

  const [state, dispatch] = useEditReducer(data);
  const decorators = useDecorators([imageLinkDecorators, prismHighlightDecorator]);
  const [editorState, editorActions] = useEditorState({
    decorators,
    contentState: convertFromRaw(raw)
  });

  const handleSubmit = useUpdateEntry(id, editorActions.getEditorState);

  useEffect(() => {
    if (data && data.entry) {
      dispatch({ type: EditActions.INITIALIZE_EDITOR, payload: data.entry });
    }
  }, [data, dispatch]);

  return [
    { data, loading, error, state, id, editorState, editorActions },
    {
      handleSubmit,
      handleFocus() {
        dispatch({ type: EditActions.SET_INITIAL_FOCUS });
      },
      handleTitleChange({ target: { value } }: React.ChangeEvent<HTMLInputElement>) {
        dispatch({ type: EditActions.UPDATE_TITLE, payload: value });
      },
      handleStatusChange() {
        dispatch({ type: EditActions.TOGGLE_PUBLIC_STATUS });
      }
    }
  ] as const;
}

import * as React from "react";
import * as Draft from "draft-js";
import { EditActions } from "../reducers/editor";
import { useEditQuery } from "../utils/generated";
import { useUpdateEntry, useEditReducer } from "./";

export function useEdit(id: string) {
  const { loading, data, error } = useEditQuery({
    variables: {
      id
    }
  });

  const [state, dispatch] = useEditReducer(data);
  const handleSubmit = useUpdateEntry(id, state);

  React.useEffect(() => {
    if (data && data.entry) {
      dispatch({ type: EditActions.INITIALIZE_EDITOR, payload: data.entry });
    }
  }, [data]);

  return [
    { data, loading, error, state, id },
    {
      handleSubmit,
      handleEditorChange(editorState: Draft.EditorState) {
        dispatch({ type: EditActions.UPDATE_EDITOR, payload: editorState });
      },
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

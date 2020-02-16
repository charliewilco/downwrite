import * as React from "react";
import * as Draft from "draft-js";
import { draftToMarkdown } from "markdown-draft-js";
import { useUINotifications, NotificationType } from "../reducers/notifications";
import {
  initializer,
  reducer,
  EditActions,
  IEditorState,
  EditorActions
} from "../reducers/editor";
import useLogging from "./logging";
import {
  useEditQuery,
  useUpdateEntryMutation,
  IEditQuery
} from "../utils/generated";

export default function useEdit(id: string) {
  const [, { addNotification }] = useUINotifications();
  const { loading, data, error } = useEditQuery({
    variables: {
      id
    }
  });
  const [updateEntry] = useUpdateEntryMutation();
  const [state, dispatch] = React.useReducer<
    React.Reducer<IEditorState, EditorActions>,
    IEditQuery
  >(reducer, data, initializer);

  React.useEffect(() => {
    if (data && data.entry) {
      dispatch({ type: EditActions.INITIALIZE_EDITOR, payload: data.entry });
    }
  }, [data]);

  useLogging("EDITOR QUERY", [data]);

  const handleSubmit = React.useCallback(async () => {
    const content = Draft.convertToRaw(state.editorState.getCurrentContent());
    await updateEntry({
      variables: {
        id,
        content: draftToMarkdown(content),
        title: state.title,
        status: state.publicStatus
      }
    }).catch(err => addNotification(err.message, NotificationType.ERROR));
  }, [state, id, updateEntry, addNotification]);

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

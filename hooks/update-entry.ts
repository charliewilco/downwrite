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
  useEditLazyQuery,
  useUpdateEntryMutation,
  IEditQuery
} from "../utils/generated";

export default function useEdit(id: string) {
  // TODO: Refactor to pass `id` from query as a parameter

  const [, { addNotification }] = useUINotifications();

  const [getEntry, { loading, data, error }] = useEditLazyQuery({
    ssr: true,
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
    getEntry();
  }, []);

  React.useEffect(() => {
    if (data && data.entry) {
      dispatch({ type: EditActions.INITIALIZE_EDITOR, payload: data.entry });
    }
  }, [data]);

  useLogging("EDITOR QUERY", [data]);

  const handleSubmit = React.useCallback(async () => {
    const content = Draft.convertToRaw(state.editorState.getCurrentContent());
    console.log(state);
    await updateEntry({
      variables: {
        id,
        content: draftToMarkdown(content),
        title: state.title,
        status: state.publicStatus
      }
    }).catch(err => addNotification(err.message, NotificationType.ERROR));
  }, [state, id]);

  function handleTitleChange({
    target: { value }
  }: React.ChangeEvent<HTMLInputElement>) {
    dispatch({ type: EditActions.UPDATE_TITLE, payload: value });
  }

  function handleEditorChange(editorState: Draft.EditorState) {
    dispatch({ type: EditActions.UPDATE_EDITOR, payload: editorState });
  }

  const handleStatusChange = () =>
    dispatch({ type: EditActions.TOGGLE_PUBLIC_STATUS });

  const handleFocus = () => dispatch({ type: EditActions.SET_INITIAL_FOCUS });

  return [
    { data, loading, error, state, id },
    {
      handleEditorChange,
      handleFocus,
      handleSubmit,
      handleTitleChange,
      handleStatusChange
    }
  ] as const;
}

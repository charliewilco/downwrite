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
import {
  useEditQuery,
  useUpdateEntryMutation,
  IEditQuery,
  EditDocument
} from "../utils/generated";

export default function useEdit(id: string) {
  const [, { addNotification }] = useUINotifications();
  const { loading, data, error } = useEditQuery({
    variables: {
      id
    }
  });

  const [updateEntry] = useUpdateEntryMutation({
    update(cache, { data: { updateEntry } }) {
      const { entry } = cache.readQuery<IEditQuery>({
        query: EditDocument,
        variables: { id }
      });

      cache.writeQuery<IEditQuery>({
        query: EditDocument,
        variables: { id },
        data: { entry: Object.assign({}, entry, updateEntry) }
      });
    }
  });

  const [state, dispatch] = React.useReducer<
    React.Reducer<IEditorState, EditorActions>,
    IEditQuery
  >(reducer, data, initializer);

  React.useEffect(() => {
    if (data && data.entry) {
      dispatch({ type: EditActions.INITIALIZE_EDITOR, payload: data.entry });
    }
  }, [data]);

  React.useEffect(() => {
    console.log("EDITOR DATA", data);
  }, [data]);

  const handleSubmit = React.useCallback(async () => {
    console.log("Submitting..");
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

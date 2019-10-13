import * as React from "react";
import * as Draft from "draft-js";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { MutationUpdateEntryArgs } from "../types/generated";
import { draftToMarkdown } from "markdown-draft-js";
import { useRouter } from "next/router";
import { useUINotifications, NotificationType } from "../reducers/notifications";
import { EDIT_QUERY, UPDATE_ENTRY_MUTATION } from "../utils/queries";
import {
  initializer,
  reducer,
  EditActions,
  IEditorState,
  EditorActions,
  IQueryResult,
  IQueryVars
} from "../reducers/editor";
import useLogging from "./logging";

export default function useEdit() {
  const {
    actions: { addNotification }
  } = useUINotifications();

  const router = useRouter();
  const { loading, data, error } = useQuery<IQueryResult, IQueryVars>(EDIT_QUERY, {
    ssr: true,
    variables: {
      id: router.query.id as string
    }
  });

  const [updateEntry] = useMutation<any, MutationUpdateEntryArgs>(
    UPDATE_ENTRY_MUTATION
  );

  const [state, dispatch] = React.useReducer<
    React.Reducer<IEditorState, EditorActions>,
    IQueryResult
  >(reducer, data, initializer);

  useLogging("QUERY", [data]);

  async function handleSubmit() {
    const content = Draft.convertToRaw(state.editorState.getCurrentContent());
    await updateEntry({
      variables: {
        id: router.query.id as string,
        content: draftToMarkdown(content),
        title: state.title,
        status: state.publicStatus
      }
    }).catch(err => addNotification(err.message, NotificationType.ERROR));
  }

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
    { data, loading, error, state, id: router.query.id },
    {
      handleEditorChange,
      handleFocus,
      handleSubmit,
      handleTitleChange,
      handleStatusChange
    }
  ] as const;
}

import * as Draft from "draft-js";
import { useRouter } from "next/router";
import { useMutation } from "@apollo/react-hooks";
import { draftToMarkdown } from "markdown-draft-js";
import { useUINotifications, NotificationType } from "../reducers/notifications";
import { MutationCreateEntryArgs } from "../types/generated";
import { CREATE_ENTRY_MUTATION } from "../utils/queries";
import useLogging from "./logging";

export interface IFields {
  title: string;
  editorState: Draft.EditorState;
}

export function useNew() {
  const [, actions] = useUINotifications();
  const router = useRouter();
  const [createEntry, { data }] = useMutation<any, MutationCreateEntryArgs>(
    CREATE_ENTRY_MUTATION
  );
  useLogging("MUTATION", [data]);

  async function onSubmit(values: IFields) {
    const ContentState: Draft.ContentState = values.editorState.getCurrentContent();
    const content = draftToMarkdown(Draft.convertToRaw(ContentState));

    await createEntry({
      variables: {
        title: values.title,
        content
      }
    })
      .then(value =>
        router.push({
          pathname: `/edit`,
          query: { id: value.data.id }
        })
      )
      .catch(err => actions.addNotification(err.message, NotificationType.ERROR));
  }

  return [onSubmit] as const;
}

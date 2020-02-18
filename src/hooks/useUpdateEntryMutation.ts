import * as React from "react";
import * as Draft from "draft-js";
import { draftToMarkdown } from "markdown-draft-js";
import { useUINotifications, NotificationType } from "../reducers/notifications";
import {
  useUpdateEntryMutation,
  IEditQuery,
  EditDocument,
  IAllPostsQuery,
  AllPostsDocument
} from "../utils/generated";
import { IEditorState } from "../reducers/editor";

export function useUpdateEntry(id: string, state: IEditorState) {
  const [, { addNotification }] = useUINotifications();
  const [updateEntry] = useUpdateEntryMutation({
    update(cache, { data }) {
      if (data) {
        const { entry } = cache.readQuery<IEditQuery>({
          query: EditDocument,
          variables: { id }
        });

        const { feed } = cache.readQuery<IAllPostsQuery>({
          query: AllPostsDocument
        });

        cache.writeQuery<IAllPostsQuery>({
          query: AllPostsDocument,
          data: {
            feed: feed.map(item =>
              item.id !== data.updateEntry.id ? data.updateEntry : item
            )
          }
        });

        cache.writeQuery<IEditQuery>({
          query: EditDocument,
          variables: { id },
          data: { entry: Object.assign({}, entry, data.updateEntry) }
        });
      }
    }
  });

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

  return handleSubmit;
}

import { useCallback } from "react";
import * as Draft from "draft-js";
import { draftToMarkdown } from "markdown-draft-js";
import {
  useUpdateEntryMutation,
  IEditQuery,
  EditDocument,
  IAllPostsQuery,
  AllPostsDocument
} from "../utils/generated";
import { IEditorState } from "../reducers/editor";
import { useNotifications, NotificationType } from "../atoms";

export function useUpdateEntry(id: string, state: IEditorState) {
  const [, { addNotification }] = useNotifications();
  const [updateEntry] = useUpdateEntryMutation({
    update(cache, { data }) {
      if (data) {
        const editQuery = cache.readQuery<IEditQuery>({
          query: EditDocument,
          variables: { id }
        });

        const allPosts = cache.readQuery<IAllPostsQuery>({
          query: AllPostsDocument
        });

        if (data && editQuery?.entry) {
          cache.writeQuery<IAllPostsQuery>({
            query: AllPostsDocument,
            data: {
              feed: allPosts!.feed.map(item =>
                item.id !== data.updateEntry!.id ? item : data.updateEntry!
              )
            }
          });

          cache.writeQuery<IEditQuery>({
            query: EditDocument,
            variables: { id },
            data: { entry: Object.assign({}, editQuery.entry, data.updateEntry) }
          });
        }
      }
    }
  });

  const handleSubmit = useCallback(async () => {
    if (state.editorState !== null) {
      const content = Draft.convertToRaw(state.editorState.getCurrentContent());
      await updateEntry({
        variables: {
          id,
          content: draftToMarkdown(content),
          title: state.title,
          status: state.publicStatus
        }
      }).catch(err => addNotification(err.message, NotificationType.ERROR));
    }
  }, [state, id, updateEntry, addNotification]);

  return handleSubmit;
}

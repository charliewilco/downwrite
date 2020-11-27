import { useCallback } from "react";
import { ApolloCache, FetchResult } from "@apollo/client";
import { convertToRaw } from "draft-js";
import {
  useUpdateEntryMutation,
  IEditQuery,
  EditDocument,
  IAllPostsQuery,
  AllPostsDocument,
  IUpdateEntryMutation
} from "@utils/generated";
import { useNotifications, NotificationType } from "@reducers/app";
import { EditorStateGetter, draftToMarkdown } from "../editor";

function updateEntry(
  cache: ApolloCache<IUpdateEntryMutation>,
  { data }: FetchResult<IUpdateEntryMutation>
) {
  if (data) {
    const id = data.updateEntry!.id;
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

export function useUpdateEntry(id: string, getEditorState: EditorStateGetter) {
  const [, { addNotification }] = useNotifications();
  const [mutationFn] = useUpdateEntryMutation({
    update: updateEntry
  });

  const handleSubmit = useCallback(
    async (title: string, publicStatus: boolean) => {
      const editorState = getEditorState();
      if (editorState !== null) {
        const content = convertToRaw(editorState.getCurrentContent());
        await mutationFn({
          variables: {
            id,
            content: draftToMarkdown(content, { preserveNewlines: true }),
            title: title,
            status: publicStatus
          }
        }).catch(err => addNotification(err.message, NotificationType.ERROR));
      }
    },
    [id, mutationFn, addNotification, getEditorState]
  );

  return handleSubmit;
}

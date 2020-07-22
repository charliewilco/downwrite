import { useCallback } from "react";
import { ApolloCache, FetchResult } from "@apollo/client";
import { convertToRaw } from "draft-js";
import { draftToMarkdown } from "markdown-draft-js";
import {
  useUpdateEntryMutation,
  IEditQuery,
  EditDocument,
  IAllPostsQuery,
  AllPostsDocument,
  IUpdateEntryMutation
} from "@utils/generated";
import { IEditorState } from "@reducers/editor";
import { useNotifications, NotificationType } from "@reducers/app";

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

export function useUpdateEntry(id: string, state: IEditorState) {
  const [, { addNotification }] = useNotifications();
  const [mutationFn] = useUpdateEntryMutation({
    update: updateEntry
  });

  const handleSubmit = useCallback(async () => {
    if (state.editorState !== null) {
      const content = convertToRaw(state.editorState.getCurrentContent());
      await mutationFn({
        variables: {
          id,
          content: draftToMarkdown(content),
          title: state.title,
          status: state.publicStatus
        }
      }).catch(err => addNotification(err.message, NotificationType.ERROR));
    }
  }, [state, id, mutationFn, addNotification]);

  return handleSubmit;
}

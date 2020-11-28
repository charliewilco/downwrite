import { useCallback } from "react";
import { ApolloCache, FetchResult } from "@apollo/client";
import { useRouter } from "next/router";
import { ContentState, EditorState, convertToRaw } from "draft-js";
import { draftToMarkdown } from "../editor";
import {
  useCreateEntryMutation,
  AllPostsDocument,
  IAllPostsQuery,
  ICreateEntryMutation,
  IEntry
} from "@utils/generated";
import { useNotifications, NotificationType } from "@reducers/app";

export interface INewEditorValues {
  title: string;
}

function updateEntries(
  cache: ApolloCache<ICreateEntryMutation>,
  { data }: FetchResult<ICreateEntryMutation>
) {
  const result = cache.readQuery<IAllPostsQuery>({
    query: AllPostsDocument
  });

  if (result !== null && !!data) {
    const updatedFeed: Pick<IEntry, "title" | "dateAdded" | "id" | "public">[] = [
      ...result.feed,
      data.createEntry!
    ];

    cache.writeQuery<IAllPostsQuery>({
      query: AllPostsDocument,
      data: {
        feed: updatedFeed
      }
    });
  }
}

export function useNewEntry() {
  const [, actions] = useNotifications();
  const router = useRouter();
  const [createEntry] = useCreateEntryMutation();

  const onSubmit = useCallback(
    async (title: string, editorState: EditorState) => {
      const ContentState: ContentState = editorState.getCurrentContent();
      const state = convertToRaw(ContentState);
      const content = draftToMarkdown(state, { preserveNewlines: true });

      await createEntry({
        variables: {
          title,
          content
        },
        update: updateEntries
      })
        .then(({ data }) => {
          if (!!data) {
            router.push(`/${data.createEntry?.id}/edit`);
          }
        })
        .catch((err) =>
          actions.addNotification(err.message, NotificationType.ERROR)
        );
    },
    [actions, createEntry]
  );

  return [onSubmit] as const;
}

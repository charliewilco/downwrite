import { useCallback } from "react";
import { ApolloCache, FetchResult } from "@apollo/client";
import { useRouter } from "next/router";
import { ContentState, EditorState, convertToRaw } from "draft-js";
import { draftToMarkdown } from "markdown-draft-js";
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
  editorState: EditorState;
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
    async (values: INewEditorValues) => {
      const ContentState: ContentState = values.editorState.getCurrentContent();
      const state = convertToRaw(ContentState);
      const content = draftToMarkdown(state);

      await createEntry({
        variables: {
          title: values.title,
          content
        },
        update: updateEntries
      })
        .then(({ data }) => {
          if (!!data) {
            router.push(`/${data.createEntry?.id}/edit`);
          }
        })
        .catch(err => actions.addNotification(err.message, NotificationType.ERROR));
    },
    [actions, createEntry]
  );

  return [onSubmit] as const;
}

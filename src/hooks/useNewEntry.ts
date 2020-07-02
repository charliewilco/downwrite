import { useCallback } from "react";
import * as Draft from "draft-js";
import { useRouter } from "next/router";
import { draftToMarkdown } from "markdown-draft-js";
import {
  useCreateEntryMutation,
  AllPostsDocument,
  IAllPostsQuery,
  IEntry
} from "../utils/generated";
import { useNotifications, NotificationType } from "../atoms";

export interface INewEditorValues {
  title: string;
  editorState: Draft.EditorState;
}

export function useNewEntry() {
  const [, actions] = useNotifications();
  const router = useRouter();
  const [createEntry] = useCreateEntryMutation();

  const onSubmit = useCallback(
    async (values: INewEditorValues) => {
      const ContentState: Draft.ContentState = values.editorState.getCurrentContent();
      const content = draftToMarkdown(Draft.convertToRaw(ContentState));

      await createEntry({
        variables: {
          title: values.title,
          content
        },
        update(cache, { data }) {
          const result = cache.readQuery<IAllPostsQuery>({
            query: AllPostsDocument
          });

          if (result !== null && !!data) {
            const updatedFeed: Pick<
              IEntry,
              "title" | "dateAdded" | "id" | "public"
            >[] = [...result.feed, data.createEntry!];

            cache.writeQuery<IAllPostsQuery>({
              query: AllPostsDocument,
              data: {
                feed: updatedFeed
              }
            });
          }
        }
      })
        .then(({ data }) => {
          if (!!data) {
            router.push(`/edit/${data.createEntry?.id}`);
          }
        })
        .catch(err => actions.addNotification(err.message, NotificationType.ERROR));
    },
    [actions, createEntry]
  );

  return [onSubmit] as const;
}

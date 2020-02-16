import * as React from "react";
import * as Draft from "draft-js";
import { useHistory } from "react-router-dom";
import { draftToMarkdown } from "markdown-draft-js";
import { useUINotifications, NotificationType } from "../reducers/notifications";
import {
  useCreateEntryMutation,
  AllPostsDocument,
  IAllPostsQuery
} from "../utils/generated";

export interface IFields {
  title: string;
  editorState: Draft.EditorState;
}

export function useNew() {
  const [, actions] = useUINotifications();
  const history = useHistory();
  const [createEntry] = useCreateEntryMutation();

  const onSubmit = React.useCallback(
    async (values: IFields) => {
      const ContentState: Draft.ContentState = values.editorState.getCurrentContent();
      const content = draftToMarkdown(Draft.convertToRaw(ContentState));

      await createEntry({
        variables: {
          title: values.title,
          content
        },
        update(cache, { data: { createEntry } }) {
          const { feed } = cache.readQuery<IAllPostsQuery>({
            query: AllPostsDocument
          });

          const updatedFeed = [...feed, { ...createEntry }];

          cache.writeQuery<IAllPostsQuery>({
            query: AllPostsDocument,
            data: {
              feed: updatedFeed
            }
          });
        }
      })
        .then(({ data: { createEntry } }) => {
          if (createEntry) {
            history.push(`/edit/${createEntry.id}`);
          }
        })
        .catch(err => actions.addNotification(err.message, NotificationType.ERROR));
    },
    [history, actions, createEntry]
  );

  return [onSubmit] as const;
}

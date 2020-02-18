import * as React from "react";
import {
  useRemoveEntryMutation,
  IAllPostsQuery,
  AllPostsDocument
} from "../utils/generated";

type RemoveFn = (id: string) => Promise<void>;

export function useRemovePost(): RemoveFn {
  const [deleteEntry] = useRemoveEntryMutation();

  const onConfirmDelete = React.useCallback<RemoveFn>(
    async function(id: string): Promise<void> {
      await deleteEntry({
        variables: { id },
        update(cache, { data: { deleteEntry } }) {
          const { feed } = cache.readQuery<IAllPostsQuery>({
            query: AllPostsDocument
          });

          cache.writeQuery<IAllPostsQuery>({
            query: AllPostsDocument,
            data: {
              feed: feed.filter(item => item.id !== deleteEntry.id)
            }
          });
        }
      }).catch(err => console.log(err));
    },
    [deleteEntry]
  );

  return onConfirmDelete;
}

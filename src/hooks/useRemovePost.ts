import { useCallback } from "react";
import {
  useRemoveEntryMutation,
  IAllPostsQuery,
  AllPostsDocument
} from "../utils/generated";

type RemoveFn = (id: string) => Promise<void>;

export function useRemovePost(): RemoveFn {
  const [deleteEntry] = useRemoveEntryMutation();

  const onConfirmDelete = useCallback<RemoveFn>(
    async function(id: string): Promise<void> {
      await deleteEntry({
        variables: { id },
        update(cache, { data }) {
          const allPosts = cache.readQuery<IAllPostsQuery>({
            query: AllPostsDocument
          });

          if (data) {
            cache.writeQuery<IAllPostsQuery>({
              query: AllPostsDocument,
              data: {
                feed: allPosts!.feed.filter(item => item.id !== data.deleteEntry!.id)
              }
            });
          }
        }
      }).catch(err => console.log(err));
    },
    [deleteEntry]
  );

  return onConfirmDelete;
}

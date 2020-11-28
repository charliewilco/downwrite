import { useCallback } from "react";
import { ApolloCache, FetchResult } from "@apollo/client";
import {
  useRemoveEntryMutation,
  IRemoveEntryMutation,
  IAllPostsQuery,
  AllPostsDocument
} from "@utils/generated";

type RemoveFn = (id: string) => Promise<void>;

function updateFeed(
  cache: ApolloCache<IRemoveEntryMutation>,
  { data }: FetchResult<IRemoveEntryMutation>
) {
  const allPosts = cache.readQuery<IAllPostsQuery>({
    query: AllPostsDocument
  });

  if (data) {
    cache.writeQuery<IAllPostsQuery>({
      query: AllPostsDocument,
      data: {
        feed: allPosts!.feed.filter((item) => item.id !== data.deleteEntry!.id)
      }
    });
  }
}

export function useRemovePost(): RemoveFn {
  const [mutationFn] = useRemoveEntryMutation();

  const onConfirmDelete = useCallback<RemoveFn>(
    async function (id: string): Promise<void> {
      await mutationFn({
        variables: { id },
        update: updateFeed
      }).catch((err) => console.log(err));
    },
    [mutationFn]
  );

  return onConfirmDelete;
}

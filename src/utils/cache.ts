import { ApolloCache, FetchResult } from "@apollo/client";
import {
  IEntry,
  ICreateEntryMutation,
  IEditQuery,
  EditDocument,
  IAllPostsQuery,
  AllPostsDocument,
  IRemoveEntryMutation,
  IUpdateEntryMutation,
  IUpdateUserSettingsMutation,
  IUserDetailsQuery,
  UserDetailsDocument
} from "../__generated__/client";

export function updateEntryCache(
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

    if (data && editQuery?.entry && allPosts && allPosts.feed) {
      cache.writeQuery<IAllPostsQuery>({
        query: AllPostsDocument,
        data: {
          feed: allPosts.feed.map((item) =>
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

export function updateCreateEntryCache(
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

export function updateFeedCache(
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

export function updateSettingsCache(
  cache: ApolloCache<IUpdateUserSettingsMutation>,
  result: FetchResult<IUpdateUserSettingsMutation>
) {
  if (result.data) {
    cache.writeQuery<IUserDetailsQuery>({
      query: UserDetailsDocument,
      data: {
        settings: {
          username: result.data.updateUserSettings?.username!,
          email: result.data.updateUserSettings?.email!
        }
      }
    });
  }
}

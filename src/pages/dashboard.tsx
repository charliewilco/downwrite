import { useCallback } from "react";
import { NextPage } from "next";
import Head from "next/head";
import useSWR from "swr";

import DeleteModal from "@components/delete-modal";
import PostList from "@components/post-list";
import EmptyPosts from "@components/empty-posts";
import { LoadingDashboard, ErrorDashboard } from "@components/dashboard-helpers";
import { useStore } from "@reducers/app";
import { IPartialFeedItem } from "@reducers/dashboard";

const DashboardUI: NextPage = () => {
  const store = useStore();
  const { data, error, mutate } = useSWR(["dashboard"], store.dashboard.getFeed);

  const loading = !data;

  const handleDelete = useCallback((selected: IPartialFeedItem) => {
    if (selected !== null) {
      store.dashboard.remove(selected.id).then((value) => {
        store.dashboard.cancel();

        const index = data.feed.findIndex(({ id }) => value.deleteEntry.id === id);
        if (index > -1) {
          data.feed.splice(index, 1);
          mutate(
            {
              ...data,
              feed: {
                ...data.feed
              }
            },
            false
          );
        }
      });
    }
  }, []);

  if (loading || (data === undefined && error === undefined)) {
    return <LoadingDashboard />;
  }

  if (error) {
    return <ErrorDashboard error={error} />;
  }

  if (data) {
    const titlePrefix =
      data.feed.length > 0
        ? data.feed.length.toString().concat(" Entries ")
        : "No Entries ";
    return (
      <section className="py-4 px-2 min-h-screen">
        <Head>
          <title>{titlePrefix}| Downwrite</title>
        </Head>
        {store.dashboard.selected !== null && (
          <DeleteModal
            title={store.dashboard.selected.title}
            onDelete={() => handleDelete(store.dashboard.selected)}
            onCancelDelete={store.dashboard.cancel}
            closeModal={store.dashboard.cancel}
          />
        )}
        {data.feed.length > 0 ? (
          <PostList onSelect={store.dashboard.selectEntry} posts={data.feed} />
        ) : (
          <EmptyPosts />
        )}
      </section>
    );
  }

  return null;
};

export default DashboardUI;

import { useCallback } from "react";
import { NextPage } from "next";
import Head from "next/head";
import useSWR from "swr";

import { DeleteModal } from "@components/delete-modal";
import { PostList } from "@components/post-list";
import { EmptyPosts } from "@components/empty-posts";
import { LoadingDashboard, ErrorDashboard } from "@components/dashboard-helpers";
import { IPartialFeedItem } from "@store/dashboard";
import { useEnhancedReducer, useDataSource } from "@hooks/index";

const DashboardUI: NextPage = () => {
  const store = useDataSource();
  const [selected, dispatch] = useEnhancedReducer<IPartialFeedItem | null>(null);
  const { data, error, mutate } = useSWR(["dashboard"], () =>
    store.dashboard.getFeed()
  );

  const loading = !data;

  const handleDelete = useCallback(() => {
    if (selected !== null) {
      store.dashboard.remove(selected.id).then((value) => {
        dispatch(null);

        const mutated = store.dashboard.mutateFeedList(data, value.deleteEntry.id);

        mutate(mutated, false);
      });
    }
  }, [selected, data, mutate]);

  const handleCancel = useCallback(() => {
    dispatch(null);
  }, [dispatch]);

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
      <section className="py-4 px-2">
        <Head>
          <title>{titlePrefix}| Downwrite</title>
        </Head>
        {selected !== null && (
          <DeleteModal
            title={selected.title}
            onDelete={handleDelete}
            onCancelDelete={handleCancel}
            closeModal={handleCancel}
          />
        )}
        {data.feed.length > 0 ? (
          <PostList onSelect={dispatch} posts={data.feed} />
        ) : (
          <EmptyPosts />
        )}

        <style jsx>{`
          section {
            min-height: 100vh;
          }
        `}</style>
      </section>
    );
  }

  return null;
};

export default DashboardUI;

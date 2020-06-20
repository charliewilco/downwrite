import * as React from "react";
import Head from "next/head";
import DeleteModal from "../components/delete-modal";
import PostList from "../components/post-list";
import EmptyPosts from "../components/empty-posts";
import { LoadingDashboard, ErrorDashboard } from "../components/dashboard-helpers";
import { useRemovePost, useDashboard } from "../hooks";
import { useAllPostsQuery } from "../utils/generated";

export default function DashboardUI() {
  const [{ selectedPost, modalOpen }, actions] = useDashboard();
  const { data, loading, error } = useAllPostsQuery();
  const onConfirmDelete = useRemovePost();

  const onDelete = React.useCallback(() => {
    onConfirmDelete(selectedPost.id);
    actions.onCloseModal();
  }, [selectedPost, onConfirmDelete, actions]);

  if (loading || (data === undefined && error === undefined)) {
    return <LoadingDashboard />;
  }

  if (error) {
    return <ErrorDashboard error={error} />;
  }

  if (data) {
    return (
      <React.Fragment>
        {modalOpen && (
          <DeleteModal
            title={selectedPost.title}
            onDelete={onDelete}
            onCancelDelete={actions.onCancel}
            closeModal={actions.onCloseModal}
          />
        )}
        <Head>
          <title>
            {data.feed.length > 0 && data.feed.length.toString().concat(" ")}Entries
            | Downwrite
          </title>
        </Head>
        <section className="PostContainer">
          {data.feed.length > 0 ? (
            <PostList
              onSelect={({ title, id }) => actions.onSelect({ title, id })}
              posts={data.feed}
            />
          ) : (
            <EmptyPosts />
          )}
        </section>
      </React.Fragment>
    );
  }

  return null;
}

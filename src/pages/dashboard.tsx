import * as React from "react";
import { Helmet } from "react-helmet-async";
import DeleteModal from "../components/delete-modal";
import PostList from "../components/post-list";
import EmptyPosts from "../components/empty-posts";
import { LoadingDashboard, ErrorDashboard } from "../components/dashboard-helpers";
import useDashboard from "../hooks/manage-dashboard";
import { useRemoveEntryMutation, useAllPostsQuery } from "../utils/generated";

export default function DashboardUI() {
  const [state, actions] = useDashboard();

  const { data, loading, error, refetch } = useAllPostsQuery();

  const [deleteEntry] = useRemoveEntryMutation();

  const onConfirmDelete = React.useCallback(
    async function(): Promise<void> {
      await deleteEntry({ variables: { id: state.selectedPost.id } })
        .then(() => refetch())
        .catch();
    },
    [state.selectedPost, deleteEntry, refetch]
  );

  if (loading || data === undefined) {
    return <LoadingDashboard />;
  }

  if (error) {
    return <ErrorDashboard error={error} />;
  }

  if (data) {
    return (
      <React.Fragment>
        {state.modalOpen && (
          <DeleteModal
            title={state.selectedPost.title}
            onDelete={onConfirmDelete}
            onCancelDelete={actions.onCancel}
            closeModal={actions.onCloseModal}
          />
        )}
        <Helmet>
          <title>Entries | Downwrite</title>
        </Helmet>
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
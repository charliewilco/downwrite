import * as React from "react";
import { Helmet } from "react-helmet-async";
import DeleteModal from "../components/delete-modal";
import PostList from "../components/post-list";
import EmptyPosts from "../components/empty-posts";
import { LoadingDashboard, ErrorDashboard } from "../components/dashboard-helpers";
import useDashboard from "../hooks/manage-dashboard";
import { useRemovePost } from "../hooks/delete-post";
import { useAllPostsQuery } from "../utils/generated";

export default function DashboardUI() {
  const [state, actions] = useDashboard();

  const { data, loading, error } = useAllPostsQuery();
  const onConfirmDelete = useRemovePost();

  if (loading || data === undefined) {
    return <LoadingDashboard />;
  }

  if (error) {
    return <ErrorDashboard error={error} />;
  }

  if (data) {
    return (
      <React.StrictMode>
        <React.Fragment>
          {state.modalOpen && (
            <DeleteModal
              title={state.selectedPost.title}
              onDelete={() => onConfirmDelete(state.selectedPost.id)}
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
      </React.StrictMode>
    );
  }

  return null;
}

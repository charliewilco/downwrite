import * as React from "react";
import { NextPage } from "next";
import Head from "next/head";
import DeleteModal from "../components/delete-modal";
import PostList from "../components/post-list";
import EmptyPosts from "../components/empty-posts";
import { LoadingDashboard, ErrorDashboard } from "../components/dashboard-helpers";
import useDashboard from "../hooks/manage-dashboard";
import { withApolloAuth } from "../utils/apollo-auth";
import { useRemoveEntryMutation, useAllPostsQuery } from "../utils/generated";

export const DashboardUI: NextPage<{}> = () => {
  const [state, actions] = useDashboard();

  const { data, loading, error, refetch } = useAllPostsQuery({
    ssr: false
  });

  const [deleteEntry] = useRemoveEntryMutation();

  const onConfirmDelete = React.useCallback(
    async function(): Promise<void> {
      await deleteEntry({ variables: { id: state.selectedPost.id } })
        .then(() => refetch())
        .catch();
    },
    [state.selectedPost]
  );

  if (loading || data === undefined) {
    <LoadingDashboard />;
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
        <Head>
          <title>Entries | Downwrite</title>
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

  console.log(state, data, loading, error);

  return null;
};

export default withApolloAuth(DashboardUI, { ssr: false });

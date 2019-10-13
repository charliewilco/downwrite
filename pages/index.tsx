import * as React from "react";
import * as Dwnxt from "downwrite";
import { NextPage } from "next";
import Head from "next/head";
import DeleteModal from "../components/delete-modal";
import PostList from "../components/post-list";
import Loading from "../components/loading";
import EmptyPosts from "../components/empty-posts";
import InvalidToken from "../components/invalid-token";
import useDashboard from "../hooks/manage-dashboard";
import { withApolloAuth } from "../utils/apollo-auth";

// TODO: refactor to have selected post, deletion to be handled by a lower level component
// should be opened at this level and be handed a token and post to delete
export const DashboardUI: NextPage<{}> = () => {
  const [
    {
      loading,
      error,
      data,
      state: { selectedPost, modalOpen }
    },
    actions
  ] = useDashboard();

  if (loading) {
    return (
      <React.Fragment>
        <Head>
          <title>Loading | Downwrite</title>
        </Head>
        <Loading size={100} />
      </React.Fragment>
    );
  }

  if (error) {
    return <InvalidToken error={error.message} />;
  }

  return (
    <React.Fragment>
      {modalOpen && (
        <DeleteModal
          title={selectedPost.title}
          onDelete={actions.onConfirmDelete}
          onCancelDelete={actions.onCancel}
          closeModal={actions.onCloseModal}
        />
      )}
      <Head>
        <title>{data.feed.length} Entries | Downwrite</title>
      </Head>
      <section className="PostContainer">
        {data.feed.length > 0 ? (
          <PostList
            onSelect={({ title, id }) => actions.onSelect({ title, id })}
            posts={data.feed as Dwnxt.IPost[]}
          />
        ) : (
          <EmptyPosts />
        )}
      </section>
    </React.Fragment>
  );
};

export default withApolloAuth(DashboardUI, { ssr: true });

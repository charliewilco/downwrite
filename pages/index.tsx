import * as React from "react";
import * as Dwnxt from "downwrite";
import { useQuery } from "@apollo/react-hooks";
import { NextPage } from "next";
import Head from "next/head";
import DeleteModal from "../components/delete-modal";
import PostList from "../components/post-list";
import Loading from "../components/loading";
import EmptyPosts from "../components/empty-posts";
import InvalidToken from "../components/invalid-token";
import useManagedDashboard from "../hooks/manage-dashboard";
import { withApollo } from "../utils/apollo-auth";
import { ALL_POSTS_QUERY } from "../utils/queries";

// TODO: refactor to have selected post, deletion to be handled by a lower level component
// should be opened at this level and be handed a token and post to delete
export const DashboardUI: NextPage<{}> = () => {
  const [{ selectedPost, modalOpen }, ManagedDashboard] = useManagedDashboard();

  const { data, loading, error } = useQuery(ALL_POSTS_QUERY, {
    ssr: true
  });

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
          onDelete={ManagedDashboard.onConfirmDelete}
          onCancelDelete={ManagedDashboard.onCancel}
          closeModal={ManagedDashboard.onCloseModal}
        />
      )}
      <Head>
        <title>{data.feed.length} Entries | Downwrite</title>
      </Head>
      <section className="PostContainer">
        {data.feed.length > 0 ? (
          <PostList
            onSelect={ManagedDashboard.onSelect}
            posts={data.feed as Dwnxt.IPost[]}
          />
        ) : (
          <EmptyPosts />
        )}
      </section>
    </React.Fragment>
  );
};

export default withApollo(DashboardUI, { ssr: true });

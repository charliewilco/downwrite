import * as React from "react";
import * as Dwnxt from "downwrite";
import Head from "next/head";
import "isomorphic-unfetch";
import gql from "graphql-tag";
import DeleteModal from "../components/delete-modal";
import PostList from "../components/post-list";
import Loading from "../components/loading";
import EmptyPosts from "../components/empty-posts";
import InvalidToken from "../components/invalid-token";
import useManagedDashboard from "../hooks/manage-dashboard";
import { useQuery } from "@apollo/react-hooks";
import { NextPage } from "next";
import { withApollo } from "../utils/with-apollo-client";

export const ALL_POSTS_QUERY = gql`
  query {
    feed {
      title
      dateAdded
      id
      public
    }
  }
`;

// TODO: refactor to have selected post, deletion to be handled by a lower level component
// should be opened at this level and be handed a token and post to delete
export const DashboardUI: NextPage<{}> = () => {
  const [{ selectedPost, modalOpen }, ManagedDashboard] = useManagedDashboard();

  const { data, loading, error } = useQuery(ALL_POSTS_QUERY, {
    ssr: true
  });

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
        <title>
          {loading ? "Loading" : `${data.feed.length} Entries`} | Downwrite
        </title>
      </Head>
      <section className="PostContainer">
        {!loading ? (
          Array.isArray(data.feed) && data.feed.length > 0 ? (
            <PostList
              onSelect={ManagedDashboard.onSelect}
              posts={data.feed as Dwnxt.IPost[]}
            />
          ) : error.message.length > 0 ? (
            <InvalidToken error={error.message} />
          ) : (
            <EmptyPosts />
          )
        ) : (
          <Loading size={100} />
        )}
      </section>
    </React.Fragment>
  );
};

export default withApollo(DashboardUI, { ssr: true });

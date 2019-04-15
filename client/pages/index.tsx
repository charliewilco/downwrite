import * as React from "react";
import * as Dwnxt from "downwrite";
import Head from "next/head";
import "isomorphic-fetch";

import DeleteModal from "../components/delete-modal";
import PostList from "../components/post-list";
import Loading from "../components/loading";
import EmptyPosts from "../components/empty-posts";
import InvalidToken from "../components/invalid-token";
import useManagedDashboard from "../hooks/manage-dashboard";
import { IDashboardProps, getInitialPostList } from "../utils/initial-props";

// TODO: refactor to have selected post, deletion to be handled by a lower level component
// should be opened at this level and be handed a token and post to delete
export function DashboardUI(props: IDashboardProps) {
  const [
    { entries, selectedPost, modalOpen, loaded, error },
    ManagedDashboard
  ] = useManagedDashboard(props.entries);

  return (
    <>
      {modalOpen && (
        <DeleteModal
          title={selectedPost.title}
          onDelete={ManagedDashboard.onConfirmDelete}
          onCancelDelete={ManagedDashboard.onCancel}
          closeModal={ManagedDashboard.onCloseModal}
        />
      )}
      <Head>
        <title>{Array.isArray(entries) && entries.length} Entries | Downwrite</title>
      </Head>
      <section className="PostContainer">
        {loaded ? (
          Array.isArray(entries) && entries.length > 0 ? (
            <PostList
              onSelect={ManagedDashboard.onSelect}
              posts={entries as Dwnxt.IPost[]}
            />
          ) : error.length > 0 ? (
            <InvalidToken error={error} />
          ) : (
            <EmptyPosts />
          )
        ) : (
          <Loading size={100} />
        )}
      </section>
    </>
  );
}

DashboardUI.getInitialProps = getInitialPostList;

DashboardUI.defaultProps = {
  entries: []
};

export default DashboardUI;

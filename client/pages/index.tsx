import * as React from "react";
import * as Dwnxt from "downwrite";
import { NextContext } from "next";
import Head from "next/head";
import orderBy from "lodash/orderBy";
import isEmpty from "lodash/isEmpty";
import "isomorphic-fetch";
import useManagedDashboard from "../hooks/manage-dashboard";

import DeleteModal from "../components/delete-modal";
import PostList from "../components/post-list";
import Loading from "../components/loading";
import EmptyPosts from "../components/empty-posts";
import InvalidToken from "../components/invalid-token";
import * as API from "../utils/api";
import { authMiddleware } from "../utils/auth-middleware";

interface IDashboardProps {
  entries: Dwnxt.IPost[] | Dwnxt.IPostError;
}

// TODO: refactor to have selected post, deletion to be handled by a lower level component
// should be opened at this level and be handed a token and post to delete
export function DashboardUI(props: IDashboardProps) {
  const [
    { entries, selectedPost, modalOpen, loaded, error },
    ManagedDashboard
  ] = useManagedDashboard(props.entries);

  return (
    <>
      <Head>
        <title>{Array.isArray(entries) && entries.length} Entries | Downwrite</title>
      </Head>
      {modalOpen && !isEmpty(selectedPost) && (
        <DeleteModal
          title={selectedPost.title}
          onDelete={ManagedDashboard.onConfirmDelete}
          onCancelDelete={ManagedDashboard.onCancel}
          closeModal={ManagedDashboard.onCloseModal}
        />
      )}
      <section className="PostContainer">
        {loaded ? (
          Array.isArray(entries) && entries.length > 0 ? (
            <PostList
              onDelete={ManagedDashboard.onSelect}
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

DashboardUI.getInitialProps = async function(
  ctx: NextContext<{ token: string }>
): Promise<Partial<IDashboardProps>> {
  let host: string;

  if (ctx.req) {
    const serverURL: string = ctx.req.headers.host;
    host = serverURL;
  }

  const token = authMiddleware(ctx);
  const entries = await API.getPosts({ token, host });

  return {
    entries: orderBy(entries, ["dateModified"], ["desc"])
  };
};

DashboardUI.defaultProps = {
  entries: []
};

export default DashboardUI;

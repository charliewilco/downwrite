import * as React from "react";
import * as Dwnxt from "downwrite";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Cookies from "universal-cookie";
import * as jwt from "jsonwebtoken";

import { getPosts } from "../legacy/posts";
import { dbConnect } from "../legacy/util/db";
import DeleteModal from "../components/delete-modal";
import PostList from "../components/post-list";
import Loading from "../components/loading";
import EmptyPosts from "../components/empty-posts";
import InvalidToken from "../components/invalid-token";
import useManagedDashboard from "../hooks/manage-dashboard";
import * as InitialProps from "../utils/initial-props";

export const getServerSideProps: GetServerSideProps<InitialProps.IDashboardProps> = async context => {
  const cookie = new Cookies(context.req.headers.cookie);
  const { DW_TOKEN: token } = cookie.getAll();

  const x = jwt.decode(token) as { user: string };
  await dbConnect();
  const posts = await getPosts(x.user);
  console.log("SERVER_SIDE PROPS", x);
  console.log("POSTS", posts);
  return {
    props: {
      entries: [
        ...posts.map(p => {
          p._id = p._id.toString();
          p.dateAdded = p.dateAdded.toString();
          p.dateModified = p.dateModified.toString();
          p.user = p.user.toString();
          return p;
        })
      ],
      token
    }
  };
};

// TODO: refactor to have selected post, deletion to be handled by a lower level component
// should be opened at this level and be handed a token and post to delete
function DashboardUI(props: InitialProps.IDashboardProps) {
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

export default DashboardUI;

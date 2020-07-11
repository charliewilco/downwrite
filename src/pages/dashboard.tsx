import { useCallback, useEffect } from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import decode from "jwt-decode";
import DeleteModal from "../components/delete-modal";
import PostList from "../components/post-list";
import EmptyPosts from "../components/empty-posts";
import { LoadingDashboard, ErrorDashboard } from "../components/dashboard-helpers";
import { useRemovePost, useDashboard } from "../hooks";
import { useAllPostsQuery, AllPostsDocument } from "../utils/generated";
import { initializeApollo } from "../lib/apollo";
import { parseCookies } from "../lib/cookie-managment";
import { TokenContents } from "../lib/token";
import { IInitialState } from "../atoms/initial";
import { useNotifications, NotificationType } from "../atoms";

export default function DashboardUI() {
  const [{ selectedPost, modalOpen }, actions] = useDashboard();
  const { data, loading, error } = useAllPostsQuery();
  const onConfirmDelete = useRemovePost();
  const [, { addNotification }] = useNotifications();

  useEffect(() => {
    addNotification("Hello", NotificationType.DEFAULT, false);
    addNotification("Not Now", NotificationType.WARNING, false);
    addNotification("Hello", NotificationType.ERROR, false);
  }, []);

  const onDelete = useCallback(() => {
    onConfirmDelete(selectedPost!.id);
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
      <>
        {modalOpen && selectedPost !== null && (
          <DeleteModal
            title={selectedPost.title}
            onDelete={onDelete}
            onCancelDelete={actions.onCancel}
            closeModal={actions.onCloseModal}
          />
        )}
        <Head>
          <title>
            {data.feed.length > 0
              ? data.feed.length.toString().concat(" Entries ")
              : "No Entries "}
            | Downwrite
          </title>
        </Head>
        <section className="py-4 px-2">
          {data.feed.length > 0 ? (
            <PostList onSelect={actions.onSelect} posts={data.feed} />
          ) : (
            <EmptyPosts />
          )}
        </section>
      </>
    );
  }

  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const client = initializeApollo({}, { req, res });
  await client.query({
    query: AllPostsDocument,
    context: { req, res }
  });
  const { DW_TOKEN } = parseCookies(req);

  const d = decode<TokenContents>(DW_TOKEN);

  const initialState: IInitialState = { username: d.name, userId: d.user };

  return {
    props: {
      initialState,
      initialApolloState: client.cache.extract()
    }
  };
};

import { useCallback } from "react";
import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import DeleteModal from "@components/delete-modal";
import PostList from "@components/post-list";
import EmptyPosts from "@components/empty-posts";
import { LoadingDashboard, ErrorDashboard } from "@components/dashboard-helpers";
import { useRemovePost, useDashboard } from "../hooks";
import { useAllPostsQuery, AllPostsDocument } from "@utils/generated";
import { initializeApollo } from "@lib/apollo";
import { getInitialStateFromCookie } from "@lib/cookie-managment";

const DashboardUI: NextPage = () => {
  const [{ selectedPost, modalOpen }, actions] = useDashboard();
  const { data, loading, error } = useAllPostsQuery();
  const onConfirmDelete = useRemovePost();

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
};

export default DashboardUI;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const client = initializeApollo({}, { req, res });
  await client.query({
    query: AllPostsDocument,
    context: { req, res }
  });

  const initialAppState = getInitialStateFromCookie(req);

  return {
    props: {
      initialAppState,
      initialApolloState: client.cache.extract()
    }
  };
};

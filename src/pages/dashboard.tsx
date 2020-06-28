import { useCallback } from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import DeleteModal from "../components/delete-modal";
import PostList from "../components/post-list";
import EmptyPosts from "../components/empty-posts";
import { LoadingDashboard, ErrorDashboard } from "../components/dashboard-helpers";
import { useRemovePost, useDashboard } from "../hooks";
import { useAllPostsQuery, AllPostsDocument } from "../utils/generated";
import { initializeApollo } from "../lib/apollo";
import { parseCookies } from "../lib/cookie-managment";
import { useRecoilValue } from "recoil";
import { notificationState } from "../reducers/app-state";

export default function DashboardUI() {
  const [{ selectedPost, modalOpen }, actions] = useDashboard();
  const { data, loading, error } = useAllPostsQuery({ ssr: true });
  const onConfirmDelete = useRemovePost();

  const notifications = useRecoilValue(notificationState);

  console.log(notifications);

  const onDelete = useCallback(() => {
    onConfirmDelete(selectedPost.id);
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
        {modalOpen && (
          <DeleteModal
            title={selectedPost.title}
            onDelete={onDelete}
            onCancelDelete={actions.onCancel}
            closeModal={actions.onCloseModal}
          />
        )}
        <Head>
          <title>
            {data.feed.length > 0 && data.feed.length.toString().concat(" ")}Entries
            | Downwrite
          </title>
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
      </>
    );
  }

  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const { DW_TOKEN } = parseCookies(req);

  const client = initializeApollo({}, { req, res });
  await client.query({
    query: AllPostsDocument,
    context: { req, res }
  });

  return {
    props: {
      token: DW_TOKEN,
      initialApolloState: client.cache.extract()
    }
  };
};

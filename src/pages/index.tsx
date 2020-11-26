import { useCallback } from "react";
import { NextPage, GetServerSideProps } from "next";
import Head from "next/head";

import DeleteModal from "../components/delete-modal";
import PostList from "../components/post-list";
import Loading from "../components/loading";
import EmptyPosts from "../components/empty-posts";
import InvalidToken from "../components/invalid-token";
import { IAppState } from "@reducers/app";
import { NormalizedCacheObject, ApolloError } from "@apollo/client";
import { useAllPostsQuery, AllPostsDocument } from "@utils/generated";
import { initializeApollo } from "@lib/apollo";
import { getInitialStateFromCookie } from "@lib/cookie-managment";
import { useDashboard } from "@hooks/useDashboard";
import { useRemovePost } from "@hooks/useRemovePost";

interface IErrorDashboard {
  error: ApolloError;
}

export const ErrorDashboard = (props: IErrorDashboard) => {
  return (
    <>
      <Head>
        <title>Error | Downwrite</title>
      </Head>
      <InvalidToken error={props.error.message} />
    </>
  );
};

interface IDashboardProps {
  initialAppState: IAppState;
  initialApolloState: NormalizedCacheObject;
}

export const getServerSideProps: GetServerSideProps<IDashboardProps> = async ({
  req,
  res
}) => {
  const client = initializeApollo({}, { req, res });
  await client.query({
    query: AllPostsDocument,
    context: { req, res }
  });

  const initialAppState = await getInitialStateFromCookie(req);

  return {
    props: {
      initialAppState,
      initialApolloState: client.cache.extract()
    }
  };
};

// TODO: refactor to have selected post, deletion to be handled by a lower level component
// should be opened at this level and be handed a token and post to delete
const DashboardUI: NextPage = () => {
  const [{ selectedPost, modalOpen }, actions] = useDashboard();
  const { data, loading, error } = useAllPostsQuery();
  const onConfirmDelete = useRemovePost();
  const onDelete = useCallback(() => {
    onConfirmDelete(selectedPost!.id);
    actions.onCloseModal();
  }, [selectedPost, onConfirmDelete, actions]);

  if (loading || (data === undefined && error === undefined)) {
    return <Loading size={100} />;
  }

  if (error) {
    return <ErrorDashboard error={error} />;
  }

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
          {data.feed.length > 0
            ? data.feed.length.toString().concat(" Entries ")
            : "No Entries "}
          | Downwrite
        </title>
      </Head>
      <section className="PostContainer">
        {data.feed.length > 0 ? (
          <PostList onSelect={actions.onSelect} posts={[]} />
        ) : (
          <EmptyPosts />
        )}
      </section>
    </>
  );
};

export default DashboardUI;

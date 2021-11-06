import { useCallback } from "react";
import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import DeleteModal from "@components/delete-modal";
import PostList from "@components/post-list";
import EmptyPosts from "@components/empty-posts";
import { LoadingDashboard, ErrorDashboard } from "@components/dashboard-helpers";
import { useRemovePost, useDashboard } from "../hooks";
import { getInitialStateFromCookie } from "@lib/cookie-managment";
import { IAppState } from "@reducers/app";
import useSWR from "swr";
import { dwClient } from "@lib/client";

interface IDashboardProps {
  initialAppState: IAppState;
}

export const getServerSideProps: GetServerSideProps<IDashboardProps> = async ({
  req
}) => {
  const initialAppState = await getInitialStateFromCookie(req);

  return {
    props: {
      initialAppState
    }
  };
};

const DashboardUI: NextPage = () => {
  const [{ selectedPost, modalOpen }, actions] = useDashboard();
  const { data, error } = useSWR(["dashboard"], () => dwClient.AllPosts());
  const onConfirmDelete = useRemovePost();

  const loading = !data;

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
    const titlePrefix =
      data.feed.length > 0
        ? data.feed.length.toString().concat(" Entries ")
        : "No Entries ";
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
          <title>{titlePrefix}| Downwrite</title>
        </Head>
        <section className="py-4 px-2 min-h-screen">
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

import { useCallback, useEffect } from "react";
import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

import useSWR from "swr";

import { DeleteModal } from "@components/delete-modal";
import { PostList } from "@components/post-list";
import { EmptyPosts } from "@components/empty-posts";
import { Loading } from "@components/loading";

import { DashboardState, IPartialFeedItem } from "@store/modules/dashboard";
import { useEnhancedReducer, useDataFactory } from "@hooks/index";
import { Routes } from "@utils/routes";

const DashboardUI: NextPage = () => {
  const factory = useDataFactory(DashboardState);
  const [selected, dispatch] = useEnhancedReducer<IPartialFeedItem | null>(null);
  const { data, error, mutate } = useSWR(["dashboard"], () => factory.getFeed());

  const loading = !data;

  const handleDelete = useCallback(() => {
    if (selected !== null) {
      factory.remove(selected.id).then((value) => {
        dispatch(null);

        const mutated = factory.mutateFeedList(data, value.deleteEntry.id);

        mutate(mutated, false);
      });
    }
  }, [selected, data, mutate]);

  const handleCancel = useCallback(() => dispatch(null), [dispatch]);

  useEffect(() => {
    async function getDraft() {
      const m = await import("draft-js");

      console.log(m);
    }

    getDraft();
  }, []);

  if (loading || (data === undefined && error === undefined)) {
    return (
      <div className="outer">
        <Head>
          <title>Loading | Downwrite</title>
        </Head>
        <Loading />
        <style jsx>{`
          .outer {
            min-height: 100%;
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="outer">
        <Head>
          <title>Error | Downwrite</title>
        </Head>
        <div data-testid="INVALID_TOKEN_CONTAINER">
          <p>{error.message}</p>
          <Link href={Routes.LOGIN} passHref>
            <a>Let's sign in again.</a>
          </Link>
        </div>
        <style jsx>{`
          .outer {
            min-height: 100%;
          }
        `}</style>
      </div>
    );
  }

  if (data) {
    const titlePrefix =
      data.feed.length > 0
        ? data.feed.length.toString().concat(" Entries ")
        : "No Entries ";
    return (
      <section className="outer">
        <Head>
          <title>{titlePrefix}| Downwrite</title>
        </Head>
        {selected !== null && (
          <DeleteModal
            title={selected.title}
            onDelete={handleDelete}
            onCancelDelete={handleCancel}
            closeModal={handleCancel}
          />
        )}
        {data.feed.length > 0 ? (
          <PostList onSelect={dispatch} posts={data.feed} />
        ) : (
          <EmptyPosts />
        )}

        <style jsx>{`
          .outer {
            min-height: 100%;
          }
        `}</style>
      </section>
    );
  }

  return null;
};

export default DashboardUI;

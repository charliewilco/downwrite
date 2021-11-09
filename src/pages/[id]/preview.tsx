import { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import useSWR from "swr";

import { getPreviewEntry } from "@server/preview";
import { Content } from "@components/content";
import { AuthorBlock } from "@components/user-blocks";
import { Loading } from "@components/loading";
import { NotFound } from "@components/not-found";
import { Routes } from "@shared/routes";
import { AvatarColors } from "@shared/gradients";

import { IPreview } from "../../__generated__/server";
import { useSubjectSubscription, useDataSource } from "@hooks/index";

type PreviewPageHandler = GetServerSideProps<
  { id: string; preview: IPreview },
  { id: string }
>;

export const getServerSideProps: PreviewPageHandler = async ({ params }) => {
  const id = params!.id;

  try {
    const preview = await getPreviewEntry(id);

    return {
      props: {
        id,
        preview
      }
    };
  } catch (error) {
    return {
      notFound: true
    };
  }
};

const PreviewEntry: NextPage<{ id: string }> = (props) => {
  const dataSource = useDataSource();
  const me = useSubjectSubscription(dataSource.me.state);

  const router = useRouter();
  const { error, data } = useSWR(props.id, (id) => dataSource.graphql.preview(id));

  const loading = !data;

  if (error) {
    return (
      <div>
        <Head>
          <title>{error.name} | Downwrite</title>
        </Head>
        <NotFound error={error.name} message={error.message} />
      </div>
    );
  }

  if (loading) {
    return <Loading />;
  }

  if (!!data) {
    return (
      <Content
        title={data.preview?.title!}
        content={data.preview?.content!}
        dateAdded={data.preview?.dateAdded!}>
        <Head>
          <title>{data.preview?.title} | Downwrite</title>
          <meta name="og:title" content={data.preview?.title!} />
          <meta
            name="og:description"
            content={data.preview?.content!.substr(0, 75)}
          />
          <meta name="og:url" content={router.pathname} />
          <meta name="description" content={data.preview?.content!.substr(0, 75)} />
        </Head>
        <AuthorBlock name={data.preview?.author?.username!} colors={AvatarColors} />
        {!me.authed && (
          <div>
            <p>
              <span>
                You can write and share on Downwrite, you can sign up or log in{" "}
              </span>
              <Link href={Routes.LOGIN} passHref>
                <a>here</a>
              </Link>
            </p>
          </div>
        )}
      </Content>
    );
  }

  return <div />;
};

export default PreviewEntry;

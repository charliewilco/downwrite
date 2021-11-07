import { GetStaticProps, NextPage } from "next";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import useSWR from "swr";
import Content from "@components/content";
import AuthorBlock from "@components/author-block";
import Loading from "@components/loading";
import NotFound from "@components/not-found";
import { Routes } from "@utils/routes";
import { AvatarColors } from "@utils/default-styles";
import { useStore } from "@reducers/app";

type PreviewPageHandler = GetStaticProps<{ id: string }, { id: string }>;

export const getStaticProps: PreviewPageHandler = async ({ params }) => {
  const id = params!.id;

  return {
    props: {
      id
    }
  };
};

const PreviewEntry: NextPage<{ id: string }> = (props) => {
  const router = useRouter();
  const store = useStore();

  const { error, data } = useSWR(props.id, (id) => store.graphql.preview(id));

  const loading = !data;

  if (error) {
    return (
      <>
        <Head>
          <title>{error.name} | Downwrite</title>
        </Head>
        <NotFound error={error.name} message={error.message} />
      </>
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
        {!store.authed && (
          <div className="space-y-8 py-8">
            <p className="text-sm italic mb-0">
              <span>
                You can write and share on Downwrite, you can sign up or log in{" "}
              </span>
              <Link href={Routes.LOGIN} passHref>
                <a className="text-pixieblue-500 font-bold">here</a>
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

import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next";
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
import { useCurrentUser } from "@reducers/app";
import { getInitialStateFromCookie } from "@lib/cookie-managment";
import { dwClient } from "@lib/client";

type PreviewPageHandler = GetServerSideProps<{ id: string }, { id: string }>;

export const getServerSideProps: PreviewPageHandler = async ({ req, params }) => {
  const id = params!.id;
  const initialAppState = await getInitialStateFromCookie(req);

  return {
    props: {
      initialAppState,
      id
    }
  };
};

const PreviewEntry: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = (props) => {
  const router = useRouter();
  const [currentUser] = useCurrentUser();

  const { error, data } = useSWR(props.id, (id) => dwClient.Preview({ id }));

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
        {!currentUser.authed && (
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

import {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
  NextPage
} from "next";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import Content from "@components/content";
import AuthorBlock from "@components/author-block";
import Loading from "@components/loading";
import NotFound from "@components/not-found";
import {
  usePreviewQuery,
  PreviewDocument,
  IPreviewQuery,
  IPreviewQueryVariables
} from "@utils/generated";
import dbConnect from "@lib/db";
import { PostModel } from "@lib/models";
import { initializeApollo } from "@lib/apollo";
import { Routes } from "@utils/routes";
import { AvatarColors } from "@utils/default-styles";
import { useCurrentUser } from "@reducers/app";

export const getStaticPaths: GetStaticPaths = async () => {
  await dbConnect();

  const publicPosts = await PostModel.find({ public: { $eq: true } });
  const paths = publicPosts.map(p => ({ params: { id: p.id } }));

  return {
    paths,
    fallback: true
  };
};

export const getStaticProps: GetStaticProps<any, { id: string }> = async ({
  params
}) => {
  const client = initializeApollo({});

  await client.query<IPreviewQuery, IPreviewQueryVariables>({
    query: PreviewDocument,
    variables: {
      id: params!.id
    }
  });

  return {
    props: {
      initialApolloState: client.cache.extract(),
      id: params!.id
    }
  };
};

const PreviewEntry: NextPage<InferGetStaticPropsType<
  typeof getStaticProps
>> = props => {
  const router = useRouter();
  const [currentUser] = useCurrentUser();
  const { error, loading, data } = usePreviewQuery({
    variables: { id: props.id }
  });

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
        title={data?.preview?.title!}
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

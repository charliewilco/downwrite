import * as React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Content from "../components/content";
import AuthorBlock from "../components/author-block";
import Loading from "../components/loading";
import { AvatarColors } from "../components/avatar";
import NotFound from "../components/not-found";
import { withApolloAuth } from "../utils/apollo-auth";
import { usePreviewQuery } from "../utils/generated";

function usePreview(id: string) {
  return usePreviewQuery({
    ssr: true,
    variables: {
      id
    }
  });
}

export function PreviewEntry() {
  const router = useRouter();

  const { error, loading, data } = usePreview(router.query.id as string);

  if (error) {
    return (
      <React.Fragment>
        <Head>
          <title>{error.name} | Downwrite</title>
        </Head>
        <NotFound error={error.name} message={error.message} />
      </React.Fragment>
    );
  }

  if (loading) {
    return <Loading size={100} />;
  }

  const excerpt: string = data.preview.content.substr(0, 75);

  return (
    <React.Fragment>
      <Head>
        <title>{data.preview.title} | Downwrite</title>
        <meta name="og:title" content={data.preview.title} />
        <meta name="og:description" content={excerpt} />
        <meta name="og:url" content={router.route} />
        <meta name="description" content={excerpt} />
      </Head>
      <Content
        title={data.preview.title}
        content={data.preview.content}
        dateAdded={data.preview.dateAdded}>
        <AuthorBlock
          name={data.preview.author.username}
          colors={AvatarColors}
          authed={false}
        />
      </Content>
    </React.Fragment>
  );
}

export default withApolloAuth(PreviewEntry, { ssr: true });

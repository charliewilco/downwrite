import { Fragment } from "react";
import Head from "next/head";
import Content from "../components/content";
import AuthorBlock from "../components/author-block";
import Loading from "../components/loading";
import { AvatarColors } from "../components/avatar";
import NotFound from "../components/not-found";
import { usePreviewQuery } from "../utils/generated";
import { useRouter } from "next/router";

export default function PreviewEntry() {
  const router = useRouter();
  const { error, loading, data } = usePreviewQuery({
    variables: { id: router.query.id! as string }
  });

  if (error) {
    return (
      <Fragment>
        <Head>
          <title>{error.name} | Downwrite</title>
        </Head>
        <NotFound error={error.name} message={error.message} />
      </Fragment>
    );
  }

  if (loading) {
    return <Loading size={100} />;
  }

  return (
    <Content
      title={data?.preview?.title}
      content={data.preview.content}
      dateAdded={data.preview.dateAdded}>
      <Head>
        <title>{data.preview.title} | Downwrite</title>
        <meta name="og:title" content={data.preview.title} />
        <meta name="og:description" content={data.preview.content.substr(0, 75)} />
        <meta name="og:url" content={router.pathname} />
        <meta name="description" content={data.preview.content.substr(0, 75)} />
      </Head>
      <AuthorBlock
        name={data.preview.author.username}
        colors={AvatarColors}
        authed={false}
      />
    </Content>
  );
}

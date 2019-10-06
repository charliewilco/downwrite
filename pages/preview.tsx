import * as React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useQuery } from "@apollo/react-hooks";
import Content from "../components/content";
import AuthorBlock from "../components/author-block";
import Loading from "../components/loading";
import { AuthContext } from "../components/auth";
import NotFound from "../components/not-found";
import { withApollo } from "../utils/apollo-auth";
import { PREVIEW_QUERY } from "../utils/queries";

import { AvatarColors } from "../components/avatar";

export default withApollo(function PreviewEntry() {
  const [{ authed }] = React.useContext(AuthContext);

  const router = useRouter();

  const { data, loading, error } = useQuery(PREVIEW_QUERY, {
    ssr: true,
    variables: {
      id: router.query.id
    }
  });

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

  return (
    <React.Fragment>
      <Head>
        <title>{data.preview.title} | Downwrite</title>
        <meta name="og:title" content={data.preview.title} />
        <meta name="og:description" content={data.preview.content.substr(0, 75)} />
        <meta name="og:url" content={router.route} />
        <meta name="description" content={data.preview.content.substr(0, 75)} />
      </Head>
      <Content
        title={data.preview.title}
        content={data.preview.content}
        dateAdded={data.preview.dateAdded}>
        <AuthorBlock
          name={data.preview.author.username}
          colors={AvatarColors}
          authed={authed}
        />
      </Content>
    </React.Fragment>
  );
});

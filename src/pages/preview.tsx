import * as React from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useLocation } from "react-router-dom";
import Content from "../components/content";
import AuthorBlock from "../components/author-block";
import Loading from "../components/loading";
import { AvatarColors } from "../components/avatar";
import NotFound from "../components/not-found";
import { usePreviewQuery } from "../utils/generated";

export default function PreviewEntry() {
  const { id } = useParams();
  const location = useLocation();
  const { error, loading, data } = usePreviewQuery({ variables: { id } });

  if (error) {
    return (
      <React.Fragment>
        <Helmet>
          <title>{error.name} | Downwrite</title>
        </Helmet>
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
      <Helmet>
        <title>{data.preview.title} | Downwrite</title>
        <meta name="og:title" content={data.preview.title} />
        <meta name="og:description" content={excerpt} />
        <meta name="og:url" content={location.pathname} />
        <meta name="description" content={excerpt} />
      </Helmet>
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

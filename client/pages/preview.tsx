import * as React from "react";
import Head from "next/head";
import isEmpty from "lodash/isEmpty";
import * as Dwnxt from "downwrite";
import "isomorphic-fetch";
import Content from "../components/content";
import AuthorBlock from "../components/author-block";
import { AuthContext } from "../components/auth";
import NotFound from "../components/not-found";
import { IPreviewProps, getInitialPreview } from "../utils/initial-props";

function PreviewEntry({ entry, url }: IPreviewProps) {
  const { authed } = React.useContext(AuthContext);
  return (
    <>
      {!isEmpty((entry as Dwnxt.IPreviewEntryError).message) ? (
        <>
          <Head>
            <title>{(entry as Dwnxt.IPreviewEntryError).error} | Downwrite</title>
          </Head>
          <NotFound {...entry as Dwnxt.IPreviewEntryError} />
        </>
      ) : (
        <>
          <Head>
            <title>{(entry as Dwnxt.IPreviewEntry).title} | Downwrite</title>
            <meta name="og:title" content={(entry as Dwnxt.IPreviewEntry).title} />
            <meta
              name="og:description"
              content={(entry as Dwnxt.IPreviewEntry).content.substr(0, 75)}
            />
            <meta name="og:url" content={url} />
            <meta
              name="description"
              content={(entry as Dwnxt.IPreviewEntry).content.substr(0, 75)}
            />
          </Head>
          <Content {...entry as Dwnxt.IPreviewEntry}>
            <AuthorBlock
              name={(entry as Dwnxt.IPreviewEntry).author.username}
              colors={(entry as Dwnxt.IPreviewEntry).author.gradient}
              authed={authed}
            />
          </Content>
        </>
      )}
    </>
  );
}

PreviewEntry.defaultProps = {
  entry: {}
};

PreviewEntry.getInitialProps = getInitialPreview;

export default PreviewEntry;

import * as React from "react";
import Head from "next/head";
import isEmpty from "lodash/isEmpty";
import * as Dwnxt from "downwrite";
import Content from "../components/content";
import AuthorBlock from "../components/author-block";
import { AuthContext } from "../components/auth";
import NotFound from "../components/not-found";
import * as InitialProps from "../utils/initial-props";

function PreviewEntry(props: InitialProps.IPreviewProps) {
  const [{ authed }] = React.useContext(AuthContext);
  return (
    <>
      {!isEmpty((props.entry as Dwnxt.IPreviewEntryError).message) ? (
        <>
          <Head>
            <title>
              {(props.entry as Dwnxt.IPreviewEntryError).error} | Downwrite
            </title>
          </Head>
          <NotFound {...(props.entry as Dwnxt.IPreviewEntryError)} />
        </>
      ) : (
        <>
          <Head>
            <title>{(props.entry as Dwnxt.IPreviewEntry).title} | Downwrite</title>
            <meta
              name="og:title"
              content={(props.entry as Dwnxt.IPreviewEntry).title}
            />
            <meta
              name="og:description"
              content={(props.entry as Dwnxt.IPreviewEntry).content.substr(0, 75)}
            />
            <meta name="og:url" content={props.url} />
            <meta
              name="description"
              content={(props.entry as Dwnxt.IPreviewEntry).content.substr(0, 75)}
            />
          </Head>
          <Content {...(props.entry as Dwnxt.IPreviewEntry)}>
            <AuthorBlock
              name={(props.entry as Dwnxt.IPreviewEntry).author.username}
              colors={(props.entry as Dwnxt.IPreviewEntry).author.gradient}
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

PreviewEntry.getInitialProps = InitialProps.getInitialPreview;

export default PreviewEntry;

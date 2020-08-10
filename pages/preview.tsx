import * as React from "react";
import Head from "next/head";
import isEmpty from "lodash/isEmpty";
import * as Dwnxt from "downwrite";
import Content from "../components/content";
import AuthorBlock from "../components/author-block";
import { AuthContext } from "../components/auth";
import NotFound from "../components/not-found";
import { IPreviewProps } from "../utils/initial-props";

const isError = (entry: any): entry is Dwnxt.IPreviewEntryError => {
  return !isEmpty(entry.message);
};

function PreviewEntry(props: IPreviewProps) {
  const [{ authed }] = React.useContext(AuthContext);
  return isError(props.entry) ? (
    <>
      <Head>
        <title>{props.entry.error} | Downwrite</title>
      </Head>
      <NotFound {...props.entry} />
    </>
  ) : (
    <>
      <Head>
        <title>{props.entry.title} | Downwrite</title>
        <meta name="og:title" content={props.entry.title} />
        <meta name="og:description" content={props.entry.content.substr(0, 75)} />
        <meta name="og:url" content={props.url} />
        <meta name="description" content={props.entry.content.substr(0, 75)} />
      </Head>
      <Content {...props.entry}>
        <AuthorBlock
          name={props.entry.author.username}
          colors={props.entry.author.gradient}
          authed={authed}
        />
      </Content>
    </>
  );
}

PreviewEntry.defaultProps = {
  entry: {}
};

export default PreviewEntry;

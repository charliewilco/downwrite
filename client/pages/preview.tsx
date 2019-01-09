import * as React from "react";
import Head from "next/head";
import { NextContext } from "next";
import isEmpty from "lodash/isEmpty";
import "isomorphic-fetch";
import Content from "../components/content";
import AuthorBlock from "../components/author-block";
import NotFound from "../components/not-found";
import * as API from "../utils/api";

type AuthorType = {
  username: string;
  gradient: string[];
};

interface IEntry {
  title: string;
  content: string;
  author: AuthorType;
  dateAdded: Date;
}

interface IEntryError {
  message: string;
  error: string;
}

type StatedEntry = IEntry & IEntryError;

interface IPreviewProps {
  authed: boolean;
  entry: StatedEntry;
  id: string;
}

export default class PreviewEntry extends React.Component<IPreviewProps, any> {
  static async getInitialProps(
    ctx: NextContext<{ id: string }>
  ): Promise<Partial<IPreviewProps>> {
    let { id } = ctx.query;
    let host: string;

    if (ctx.req) {
      const serverURL: string =
        ctx.req && (ctx.req.headers["X-Now-Deployment-Url"] as string);

      host = serverURL;
    }

    const entry = await API.findPreviewEntry(id, { host });

    return {
      id,
      entry
    };
  }

  static defaultProps = {
    entry: {}
  };

  static displayName = "PreviewEntry";

  render() {
    const {
      entry: { author },
      entry,
      authed
    } = this.props;
    return (
      <>
        {!isEmpty(entry.message) && entry.message.length > 0 ? (
          <>
            <Head>
              <title>{entry.error} | Downwrite</title>
            </Head>
            <NotFound {...entry} />
          </>
        ) : (
          <>
            <Head>
              <title>{entry.title} | Downwrite</title>
              <meta name="description" content={entry.content.substr(0, 75)} />
            </Head>
            <Content {...entry}>
              <AuthorBlock
                name={author.username}
                colors={author.gradient}
                authed={authed}
              />
            </Content>
          </>
        )}
      </>
    );
  }
}

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

export interface IEntry {
  title: string;
  content: string;
  author: AuthorType;
  dateAdded: Date;
}

export interface IEntryError {
  message: string;
  error: string;
}

interface IPreviewProps {
  authed: boolean;
  entry: IEntry | IEntryError;
  id: string;
}

export default class PreviewEntry extends React.Component<IPreviewProps, any> {
  static async getInitialProps(
    ctx: NextContext<{ id: string }>
  ): Promise<Partial<IPreviewProps>> {
    let { id } = ctx.query;
    let host: string;

    if (ctx.req) {
      const serverURL: string = ctx.req.headers.host;

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

  public render(): JSX.Element {
    const { entry, authed } = this.props;
    return (
      <>
        {!isEmpty((entry as IEntryError).message) ? (
          <>
            <Head>
              <title>{(entry as IEntryError).error} | Downwrite</title>
            </Head>
            <NotFound {...entry as IEntryError} />
          </>
        ) : (
          <>
            <Head>
              <title>{(entry as IEntry).title} | Downwrite</title>
              <meta
                name="description"
                content={(entry as IEntry).content.substr(0, 75)}
              />
            </Head>
            <Content {...entry as IEntry}>
              <AuthorBlock
                name={(entry as IEntry).author.username}
                colors={(entry as IEntry).author.gradient}
                authed={authed}
              />
            </Content>
          </>
        )}
      </>
    );
  }
}

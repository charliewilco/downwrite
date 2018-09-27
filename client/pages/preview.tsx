import * as React from 'react';
import Head from 'next/head';
import isEmpty from 'lodash/isEmpty';
import 'universal-fetch';
import Content from '../components/content';
import AuthorBlock from '../components/author-block';
import NotFound from '../components/not-found';
import { PREVIEW_ENDPOINT } from '../utils/urls';

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
  static async getInitialProps({ query }) {
    let { id } = query;

    const url = `${PREVIEW_ENDPOINT}/${id}`;

    const entry = await fetch(url, { method: 'GET', mode: 'cors' }).then(res =>
      res.json()
    );

    return {
      id,
      entry
    };
  }

  static defaultProps = {
    entry: {}
  };

  static displayName = 'PreviewEntry';

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

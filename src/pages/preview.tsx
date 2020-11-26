import * as React from "react";
import Head from "next/head";
import { GetServerSideProps } from "next";
import isEmpty from "lodash/isEmpty";
import Cookies from "universal-cookie";

import * as Dwnxt from "downwrite";

import { getMarkdownPreview } from "@legacy/posts";
import { dbConnect } from "@legacy/util/db";
import Content from "../components/content";
import AuthorBlock from "../components/author-block";
import NotFound from "../components/not-found";
import { IPreviewProps } from "../utils/initial-props";
import { startColors } from "../utils/default-styles";
import { useCurrentUser } from "@reducers/app";

const isError = (entry: any): entry is Dwnxt.IPreviewEntryError => {
  return !isEmpty(entry.message);
};

export const getServerSideProps: GetServerSideProps<
  IPreviewProps & { token: string },
  { id: string }
> = async context => {
  await dbConnect();
  const { DW_TOKEN: token } = new Cookies(context.req.headers.cookie).getAll();

  const id = Array.isArray(context.query.id)
    ? context.query.id.join("")
    : context.query.id;

  try {
    const markdown = await getMarkdownPreview(id);
    return {
      props: {
        id,
        url: `https://next.downwrite.us/preview?id=${id}`,
        entry: {
          ...markdown,
          author: {
            username: markdown.author.username,
            gradient: markdown.author.avatar || startColors
          }
        },
        token
      }
    };
  } catch (error) {
    return {
      props: {
        id,
        url: `https://next.downwrite.us/preview?id=${id}`,
        entry: {
          ...error
        },
        token
      }
    };
  }
};

function PreviewEntry(props: IPreviewProps) {
  const [{ authed }] = useCurrentUser();
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

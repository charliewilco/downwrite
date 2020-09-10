import * as React from "react";
import Head from "next/head";
import { GetServerSideProps } from "next";
import Cookies from "universal-cookie";

import Content from "../components/content";
import About from "../markdown/about.md";
import Features from "../markdown/features.md";
import Details from "../markdown/details.md";
import Markdown from "../markdown/markdown.md";

export const getServerSideProps: GetServerSideProps<{
  token: string;
}> = async context => {
  const { DW_TOKEN } = new Cookies(context.req.headers.cookie).getAll();

  return {
    props: {
      token: DW_TOKEN || null
    }
  };
};

export default function AboutDetails(): JSX.Element {
  return (
    <Content title="About Downwrite">
      <Head>
        <title>About Downwrite</title>
      </Head>
      <About />
      <Features />
      <Details />
      <Markdown />
    </Content>
  );
}

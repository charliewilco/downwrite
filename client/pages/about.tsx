import * as React from "react";
import Head from "next/head";
import Content from "../components/content";
import About from "../markdown/about.md";
import Features from "../markdown/features.md";
import Details from "../markdown/details.md";
import Markdown from "../markdown/markdown.md";

export default (): JSX.Element => (
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

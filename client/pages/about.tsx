import * as React from "react";
import Head from "next/head";
import Content from "../components/content";
import About from "../markdown/about.mdx";

export default (): JSX.Element => (
  <Content title="About Downwrite">
    <Head>
      <title>About Downwrite</title>
    </Head>
    <About />
  </Content>
);

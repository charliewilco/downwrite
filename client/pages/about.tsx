import * as React from "react";
import Head from "next/head";
import Content from "../components/content";
import About from "../markdown/about.mdx";

export default (): JSX.Element => (
  <>
    <Head>
      <title>About Downwrite</title>
    </Head>
    <Content title="About Downwrite">
      <About />
    </Content>
  </>
);

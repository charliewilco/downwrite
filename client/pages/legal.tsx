import * as React from "react";
import Head from "next/head";
import Content from "../components/content";
import Legal from "../markdown/legal.md";

export default (): JSX.Element => (
  <Content title="Legal">
    <Head>
      <title>Legal Nonsense</title>
    </Head>
    <Legal />
  </Content>
);

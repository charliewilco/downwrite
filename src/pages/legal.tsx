import * as React from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Cookies from "universal-cookie";
import Content from "../components/content";
import Legal from "../markdown/legal.md";

export const getServerSideProps: GetServerSideProps = async context => {
  const cookies = new Cookies(context.req.headers.cookie);
  const { DW_TOKEN } = cookies.getAll();

  return {
    props: {
      token: DW_TOKEN || null
    }
  };
};

export default function LegalView(): JSX.Element {
  return (
    <Content title="Legal">
      <Head>
        <title>Legal Nonsense</title>
      </Head>
      <Legal />
    </Content>
  );
}

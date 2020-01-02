import * as React from "react";
import { NextPage } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import Loading from "../components/loading";
import Landing from "../components/landing";
import Features from "../components/landing-features";
import { withApolloAuth } from "../utils/apollo-auth";

const LoginTabs = dynamic(import("../components/login-tabs"), {
  loading: () => <Loading size={75} />,
  ssr: false
});

export const LoginPage: NextPage = () => {
  return (
    <main className="HomeContainer" data-testid="LOGIN_PAGE_CONTAINER">
      <Head>
        <title>Downwrite</title>
      </Head>
      <Landing>
        <Features />
      </Landing>
      <LoginTabs />
    </main>
  );
};

export default withApolloAuth(LoginPage, {
  ssr: false
});

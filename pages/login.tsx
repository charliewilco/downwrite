import * as React from "react";
import Head from "next/head";
import LoginTabs from "../components/login-tabs";
import Landing from "../components/landing";
import Features from "../components/landing-features";

export default function LoginPage(): JSX.Element {
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
}

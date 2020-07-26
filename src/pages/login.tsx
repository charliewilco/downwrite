import { NextPage } from "next";
import Head from "next/head";
import Landing from "@components/landing";
import Features from "@components/landing-features";
import LoginTabs from "@components/login-tabs";

const LoginPage: NextPage = () => {
  return (
    <main data-testid="LOGIN_PAGE_CONTAINER" className="my-16">
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

export default LoginPage;

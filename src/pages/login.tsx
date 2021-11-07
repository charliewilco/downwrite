import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import Landing from "@components/landing";
import LoginTabs from "@components/login-tabs";
import { Routes } from "@utils/routes";

const LoginPage: NextPage = () => {
  const router = useRouter();
  return (
    <div data-testid="LOGIN_PAGE_CONTAINER" className="my-16">
      <Head>
        <title>Downwrite</title>
      </Head>
      <article className="max-w-lg mx-auto mb-24">
        <header className="text-center mb-24">
          <Landing />

          <h1
            className="text-3xl font-sans font-black mb-8"
            data-testid="Login Page Container">
            Login
          </h1>
        </header>

        <LoginTabs onSuccess={() => router.push(Routes.DASHBOARD)} />
      </article>
    </div>
  );
};

export default LoginPage;

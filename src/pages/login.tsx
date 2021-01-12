import { NextPage } from "next";
import Head from "next/head";
import Landing from "@components/landing";
import LoginTabs from "@components/login-tabs";

const LoginPage: NextPage = () => {
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

        <LoginTabs />
      </article>
    </div>
  );
};

export default LoginPage;

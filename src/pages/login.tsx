import * as React from "react";
import Head from "next/head";
import LoginTabs from "../components/login-tabs";
import Landing from "../components/landing";
import Features from "../components/landing-features";

// TODO: Migrate back to dynamic element ASAP
// import dynamic from "next/dynamic";
// import Loading from "../components/loading";

// type Dynamic = Promise<React.ComponentType<{}>>;

// const Login = dynamic(import('../components/login-form'), {
//   loading: () => <Loading size={75} />
// });
//
// const Register = dynamic(import("../components/register"), {
//   loading: () => <Loading size={75} />
// });

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

import * as React from "react";
import Head from "react-helmet";
import Landing from "../components/landing";
import Features from "../components/landing-features";

const LoginTabs = React.lazy(() => import("../components/login-tabs"));

export default function LoginPage() {
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

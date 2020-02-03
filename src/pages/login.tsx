import * as React from "react";
import { Helmet } from "react-helmet-async";
import Landing from "../components/landing";
import Features from "../components/landing-features";

const LoginTabs = React.lazy(() => import("../components/login-tabs"));

export default function LoginPage() {
  return (
    <main className="HomeContainer" data-testid="LOGIN_PAGE_CONTAINER">
      <Helmet>
        <title>Downwrite</title>
      </Helmet>
      <Landing>
        <Features />
      </Landing>
      <LoginTabs />
    </main>
  );
}

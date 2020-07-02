import Head from "next/head";
import Landing from "../components/landing";
import Features from "../components/landing-features";
import LoginTabs from "../components/login-tabs";

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

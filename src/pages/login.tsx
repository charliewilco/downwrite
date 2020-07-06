import Head from "next/head";
import Landing from "../components/landing";
import Features from "../components/landing-features";
import LoginTabs from "../components/login-tabs";

export default function LoginPage() {
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
}

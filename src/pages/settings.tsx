import { GetServerSideProps } from "next";
import Head from "next/head";
import SettingsUser from "../components/settings-user-form";
import SettingsPassword from "../components/settings-password";
import SettingsLocal from "../components/settings-markdown";
import Loading from "../components/loading";
import { initializeApollo } from "../lib/apollo";
import { getInitialStateFromCookie } from "../lib/cookie-managment";
import { useUserDetailsQuery, UserDetailsDocument } from "../utils/generated";

export default function SettingsPage() {
  const { error, loading, data } = useUserDetailsQuery();
  if (loading) {
    return <Loading size={50} />;
  }

  if (error) {
    return (
      <div>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-2">
      <Head>
        <title>User Settings</title>
      </Head>

      <h1 className="font-black text-xl mb-8">Settings</h1>
      <SettingsUser user={data?.settings!} />
      <SettingsPassword />
      <SettingsLocal />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const client = initializeApollo({}, { req, res });

  await client.query({
    query: UserDetailsDocument,
    context: { req, res }
  });

  const initialState = getInitialStateFromCookie(req);

  return {
    props: {
      initialState,
      initialApolloState: client.cache.extract()
    }
  };
};

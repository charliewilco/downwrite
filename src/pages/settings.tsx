import Head from "next/head";
import useSWR from "swr";

import UsageDetails from "@components/usage-details";
import SettingsUser from "@components/settings-user-form";
import SettingsLocal from "@components/settings-markdown";
import SettingsPassword from "@components/settings-password";
import Loading from "@components/loading";
import { PageTitle } from "@components/page-title";
import { useDataSource } from "@store/provider";

const SettingsPage = () => {
  const store = useDataSource();
  const { error, data } = useSWR([], () => store.graphql.userDetails());
  console.log(error, data);
  const loading = !data;
  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }

  return (
    <div className="max-w-4xl p-2 mx-auto mt-12" data-testid="SETTINGS_CONTAINER">
      <Head>
        <title>User Settings</title>
      </Head>
      <header className="flex items-center justify-between mb-6">
        <PageTitle>Settings</PageTitle>
      </header>
      <UsageDetails
        count={data?.me.usage.entryCount}
        private={data?.me.usage.privateEntries}
        public={data?.me.usage.publicEntries}
      />
      <SettingsUser user={data?.settings} />
      <SettingsPassword username={data?.settings.username} />
      <SettingsLocal />
    </div>
  );
};

export default SettingsPage;

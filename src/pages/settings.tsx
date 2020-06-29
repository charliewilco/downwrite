import Head from "next/head";
import SettingsUser from "../components/settings-user-form";
import SettingsPassword from "../components/settings-password";
import SettingsLocal from "../components/settings-markdown";
import Loading from "../components/loading";
import { useUserDetailsQuery } from "../utils/generated";

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
    <div className="Wrapper Wrapper--md" style={{ padding: 8 }}>
      <Head>
        <title>User Settings</title>
      </Head>

      <h1 className="ContainerTitle" style={{ marginBottom: 16 }}>
        Settings
      </h1>
      <SettingsUser user={data?.settings!} />
      <SettingsPassword />
      <SettingsLocal />
    </div>
  );
}

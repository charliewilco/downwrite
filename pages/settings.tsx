import * as React from "react";
import Head from "next/head";
import "isomorphic-unfetch";
import SettingsUser from "../components/settings-user-form";
import SettingsPassword from "../components/settings-password";
import SettingsLocal from "../components/settings-markdown";
import * as InitialProps from "../utils/initial-props";

function Settings(props: InitialProps.IUserSettingsProps) {
  return (
    <div className="Wrapper Wrapper--md" style={{ padding: 8 }}>
      <Head>
        <title>User Settings</title>
      </Head>

      <h1 className="ContainerTitle" style={{ marginBottom: 16 }}>
        Settings
      </h1>
      <SettingsUser user={props.user} />
      <SettingsPassword />
      <SettingsLocal />
    </div>
  );
}

Settings.getInitialProps = InitialProps.getInitialSettings;

export default Settings;

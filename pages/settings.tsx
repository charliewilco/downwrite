import * as React from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import SettingsUser from "../components/settings-user-form";
import SettingsPassword from "../components/settings-password";
import SettingsLocal from "../components/settings-markdown";
import { IUserSettingsProps } from "../utils/initial-props";

export const getServerSideProps: GetServerSideProps = async context => {};

function Settings(props: IUserSettingsProps) {
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

export default Settings;

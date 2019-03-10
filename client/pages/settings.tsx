import * as React from "react";
import Head from "next/head";
import { NextContext } from "next";

import "isomorphic-fetch";
import SettingsUser from "../components/settings-user-form";
import SettingsPassword from "../components/settings-password";
import SettingsLocal from "../components/settings-markdown";

import * as API from "../utils/api";
import { authMiddleware } from "../utils/auth-middleware";

interface IUserSettingsProps {
  user: {
    username: string;
    email: string;
  };
  token: string;
}

// interface IUserSettingsState {
//   colors: {
//     a: string;
//     b: string;
//   };
// }

function Settings(props: IUserSettingsProps) {
  return (
    <div className="Wrapper">
      <Head>
        <title>User Settings</title>
      </Head>

      <h1 className="ContainerTitle">Settings</h1>
      <SettingsUser user={props.user} />
      <SettingsPassword />
      <SettingsLocal />
      <style jsx>{`
        h1 {
          margin-bottom: 16px;
        }

        .Wrapper {
          margin-left: auto;
          margin-right: auto;
          padding: 8px;
          max-width: 768px;
        }
      `}</style>
    </div>
  );
}

Settings.getInitialProps = async function(
  ctx: NextContext<{ token: string }>
): Promise<Partial<IUserSettingsProps>> {
  const token = authMiddleware(ctx);

  let host: string;

  if (ctx.req) {
    const serverURL: string = ctx.req.headers.host;

    host = serverURL;
  }

  const user = await API.getUserDetails({ token, host });

  return {
    token,
    user
  };
};

export default Settings;

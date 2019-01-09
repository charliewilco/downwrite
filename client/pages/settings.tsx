import * as React from "react";
import Head from "next/head";
import { NextContext } from "next";
import styled from "styled-components";
import "isomorphic-fetch";
import SettingsUser from "../components/settings-user-form";
import SettingsPassword from "../components/settings-password";
import SettingsLocal from "../components/settings-markdown";
import Wrapper from "../components/wrapper";
import ContainerTitle from "../components/container-title";
import * as API from "../utils/api";
import { authMiddleware } from "../utils/auth-middleware";

const SettingsWrapper = styled(Wrapper)`
  padding: 8px;
`;

const SettingsTitle = styled(ContainerTitle)`
  margin-bottom: 16px;
`;

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

export default class Settings extends React.Component<IUserSettingsProps, {}> {
  static displayName = "Settings";

  static async getInitialProps(
    ctx: NextContext<{ token: string }>
  ): Promise<Partial<IUserSettingsProps>> {
    const token = authMiddleware(ctx);

    let host: string;

    if (ctx.req) {
      const serverURL: string =
        ctx.req && (ctx.req.headers["X-Now-Deployment-Url"] as string);

      host = serverURL;
    }

    const user = await API.getUserDetails({ token, host });

    return {
      token,
      user
    };
  }

  render() {
    const { user } = this.props;
    return (
      <SettingsWrapper sm>
        <Head>
          <title>User Settings</title>
        </Head>
        <SettingsTitle>Settings</SettingsTitle>
        <SettingsUser user={user} />
        <SettingsPassword />
        <SettingsLocal />
      </SettingsWrapper>
    );
  }
}

import * as React from "react";
import Head from "next/head";
import styled from "styled-components";
import "isomorphic-fetch";
import SettingsUser from "../components/settings-user-form";
import SettingsPassword from "../components/settings-password";
import SettingsLocal from "../components/settings-markdown";
import Wrapper from "../components/wrapper";
import ContainerTitle from "../components/container-title";
import * as API from "../utils/api";
import { getToken } from "../utils/responseHandler";

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
}

// interface IUserSettingsState {
//   colors: {
//     a: string;
//     b: string;
//   };
// }

export default class Settings extends React.Component<IUserSettingsProps, {}> {
  static displayName = "Settings";

  static async getInitialProps({ req, query }) {
    const { token } = getToken(req, query);

    const user = await API.getUserDetails({ token });
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

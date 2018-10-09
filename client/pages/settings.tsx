import * as React from "react";
import styled from "styled-components";
import "isomorphic-fetch";
import SettingsBlock from "../components/settings-block";
import GradientEditor from "../components/gradient-editor";
import MarkdownExtension from "../components/settings-markdown";
import Wrapper from "../components/wrapper";
import LoginInput from "../components/login-input";
import ContainerTitle from "../components/container-title";
import { getToken, createHeader } from "../utils/responseHandler";
import { USER_ENDPOINT } from "../utils/urls";

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

export default class UserSettings extends React.Component<IUserSettingsProps> {
  static displayName = "UserSettings";

  static async getInitialProps({ req, query }) {
    const { token } = getToken(req, query);

    const user = await fetch(USER_ENDPOINT, createHeader("GET", token)).then(res =>
      res.json()
    );

    return {
      token,
      user
    };
  }

  state = {};

  async componentDidMount() {}

  render() {
    const { user } = this.props;
    return (
      <SettingsWrapper>
        <SettingsTitle>Settings</SettingsTitle>
        <SettingsBlock title="User Settings">
          <LoginInput value={user.username} />
          username, {user.username} {user.email} display name
        </SettingsBlock>
        <SettingsBlock title="Password">Password</SettingsBlock>
        <SettingsBlock title="Avatar">
          <GradientEditor />
        </SettingsBlock>
        <SettingsBlock title="Markdown">
          <MarkdownExtension />
        </SettingsBlock>
      </SettingsWrapper>
    );
  }
}

import * as React from "react";
import Head from "next/head";
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
import { gradientPoints } from "../components/avatar";

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

interface IUserSettingsState {
  username: string;
  email: string;
  colors: {
    a: string;
    b: string;
  };
}

export default class UserSettings extends React.Component<
  IUserSettingsProps,
  IUserSettingsState
> {
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

  state = {
    username: this.props.user.username,
    email: this.props.user.email,
    colors: gradientPoints()
  };

  handleColorChange = (value, name) =>
    this.setState(({ colors }) => {
      colors[name] = value;

      return {
        colors
      };
    });

  handleUpdate = ({ target }) =>
    this.setState({ username: (target as HTMLInputElement).value });

  async componentDidMount() {}

  render() {
    const { username, email, colors } = this.state;
    return (
      <SettingsWrapper>
        <Head>
          <title>User Settings</title>
        </Head>
        <SettingsTitle>Settings</SettingsTitle>
        <SettingsBlock title="User Settings">
          <LoginInput
            placeholder="user@email.com"
            label="Username"
            autoComplete="username"
            value={username}
            onChange={this.handleUpdate}
          />
          <LoginInput
            placeholder="user@email.com"
            label="Email"
            autoComplete="email"
            value={email}
            onChange={this.handleUpdate}
          />
          username, {username} {email} display name
        </SettingsBlock>
        <SettingsBlock title="Password">Password</SettingsBlock>
        <SettingsBlock title="Avatar">
          <GradientEditor colors={colors} onColorChange={this.handleColorChange} />
        </SettingsBlock>
        <SettingsBlock title="Markdown">
          <p>Also font-family for editor</p>
          <MarkdownExtension />
        </SettingsBlock>
      </SettingsWrapper>
    );
  }
}

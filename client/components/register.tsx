import * as React from "react";
import Link from "next/link";
import styled from "styled-components";
import "universal-fetch";
import LoginInput from "./login-input";
import Button from "./button";
import Checkbox from "./checkbox";
import { USER_ENDPOINT } from "../utils/urls";

interface RegisterType {
  username: string;
  password: string;
  email: string;
  checked: boolean;
}

interface LoginProps {
  signIn: (x: boolean, y: string) => void;
  setError: (x: string, y: string) => void;
}

export const InlineBlock = styled.span`
  display: inline-block;
`;

const LegalInfo = styled.small`
  flex: 1;
  line-height: 1.2;
`;

const LegalCheck = styled(Checkbox)`
  margin-right: 16px;
  display: block;
  max-width: 20px;
`;

const LegalContainer = styled.label`
  display: flex;
  align-items: center;
  margin: 16px;
  background: #d8eaf1;
  padding: 8px;
`;

export const Padded = styled.div`
  padding: 16px;
  text-align: ${(props: { align?: string }) => props.align};
`;

const LegalLink = () => (
  <Link href="/legal">
    <a>legal stuff</a>
  </Link>
);

export default class Register extends React.Component<LoginProps, RegisterType> {
  state = {
    username: "",
    password: "",
    email: "",
    checked: false
  };

  handleSubmit = (event: React.SyntheticEvent<any>) => {
    if (event && event.preventDefault) {
      event.preventDefault();
    }

    this.onSubmit();
  };

  onSubmit = async () => {
    const { signIn, setError } = this.props;

    const { username, password, email } = this.state;

    const response = await fetch(USER_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password, email })
    });

    const user: {
      userID: string;
      id_token: string;
      username: string;
      message?: string;
    } = await response.json();

    if (user.userID) {
      signIn(user.id_token !== undefined, user.id_token);
    } else {
      setError(user.message, "error");
    }
  };

  toggleChecked = () => this.setState(({ checked }) => ({ checked: !checked }));

  render() {
    const { username, password, email, checked } = this.state;
    return (
      <form onSubmit={this.handleSubmit}>
        <Padded>
          <LoginInput
            placeholder="Try for something unique"
            label="Username"
            autoComplete="username"
            value={username}
            onChange={({ target }) =>
              this.setState({ username: (target as HTMLInputElement).value })
            }
          />

          <LoginInput
            placeholder="mail@email.com"
            label="Email"
            autoComplete="email"
            value={email}
            onChange={({ target }) =>
              this.setState({ email: (target as HTMLInputElement).value })
            }
          />

          <LoginInput
            placeholder="*********"
            label="Password"
            value={password}
            autoComplete="current-password"
            type="password"
            onChange={({ target }) =>
              this.setState({ password: (target as HTMLInputElement).value })
            }
          />
        </Padded>
        <LegalContainer>
          <LegalCheck checked={checked} onChange={this.toggleChecked} />
          <LegalInfo>
            I'm agreeing to abide in all the <LegalLink />.
          </LegalInfo>
        </LegalContainer>

        <Padded align="right">
          <InlineBlock>
            <Button disabled={!checked} onClick={this.onSubmit}>
              Register
            </Button>
          </InlineBlock>
        </Padded>
      </form>
    );
  }
}

import * as React from 'react';
import LoginInput from './login-input';
import Button from './button';
import { AUTH_ENDPOINT } from '../utils/urls';
import { Padded, InlineBlock } from './register';

interface LoginState {
  user: string;
  password: string;
}

interface LoginProps {
  signIn: (x: boolean, y: string) => void;
  setError: (x: string, y: string) => void;
}

export default class Login extends React.Component<LoginProps, LoginState> {
  state = {
    user: '',
    password: ''
  };

  handleSubmit = (event: React.SyntheticEvent<any>) => {
    if (event && event.preventDefault) {
      event.preventDefault();
    }

    this.onSubmit();
  };

  onSubmit = async () => {
    const { signIn, setError } = this.props;
    const authRequest = await fetch(AUTH_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ...this.state })
    });

    const auth = await authRequest.json();

    if (auth.error) {
      setError(auth.message, 'error');
    }

    if (auth.token) {
      signIn(auth.token !== undefined, auth.token);
    }
  };

  render() {
    const { user, password } = this.state;

    return (
      <Padded>
        <form onSubmit={this.handleSubmit}>
          <LoginInput
            placeholder="user@email.com"
            label="Username or Email"
            autoComplete="username"
            value={user}
            onChange={(e: React.SyntheticEvent<any>) =>
              this.setState({ user: e.target.value })
            }
          />
          <LoginInput
            placeholder="*********"
            label="Password"
            value={password}
            type="password"
            autoComplete="current-password"
            onChange={(e: React.SyntheticEvent<any>) =>
              this.setState({ password: e.target.value })
            }
          />
          <Padded align="right">
            <InlineBlock>
              <Button onClick={this.onSubmit}>Login</Button>
            </InlineBlock>
          </Padded>
        </form>
      </Padded>
    );
  }
}

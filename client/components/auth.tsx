import * as React from 'react';
import Cookies from 'universal-cookie';
import Router from 'next/router';
import jwt from 'jwt-decode';
import addDays from 'date-fns/add_days';

const AuthContext = React.createContext({});

// NOTE:
// This component should passdown the state of authed from withAuthCheck() HOC
// There is only one single point of state that needs to be rendered

// One other pattern we could consider is passing down user and token as state
// and login and logout functions from authed. this would allow an initial check
// of the cookie on a refresh and as the user is logged in have an updated source of the token
// this would solve that single point of state to be updated.
// We would pass down signIn and signOut to <Login /> & <Register />

/*
	<Auth>
		{(authed, login, logout, token, user) => <App {...args} />}
	</Auth>
*/

// state needs to evaluate the existence of
// token + decode the content of the token

const cookie = new Cookies();
const COOKIE_EXPIRATION = 180;
const cookieOptions = {
  path: '/',
  expires: addDays(Date.now(), COOKIE_EXPIRATION)
};

interface AuthProps {
  children: React.ReactNode;
  token: string;
  authed: boolean;
}

interface AuthState {
  token: string;
  name?: string;
  authed: boolean;
}

interface AuthActions {
  signIn: () => void;
  signOut: () => void;
}

const EMPTY_USER = {
  user: null,
  name: null
};

// Should be able to just request user details from another call
export default class AuthMegaProvider extends React.Component<AuthProps, AuthState> {
  constructor(props: AuthProps) {
    super(props);

    let token = this.props.token || cookie.get('DW_TOKEN');

    let __TOKEN_EXISTS__: boolean = token !== undefined && token !== 'undefined';
    const { name } = __TOKEN_EXISTS__ ? jwt(token) : EMPTY_USER;

    this.state = {
      token,
      authed: __TOKEN_EXISTS__,
      name: name || null
    };
  }

  signIn = (authed: boolean, token: string) => {
    const { name } = jwt(token);
    return this.setState({ authed, token, name }, () =>
      cookie.set('DW_TOKEN', token, cookieOptions)
    );
  };

  signOut = () => {
    return this.setState(
      {
        authed: false,
        token: undefined,
        name: undefined
      },
      () => cookie.remove('DW_TOKEN', cookieOptions)
    );
  };

  componentDidUpdate(prevState) {
    const { authed } = this.state;
    if (prevState.authed !== authed) {
      Router.push({ pathname: authed ? '/' : '/login' });
    }
  }

  render() {
    const value = {
      ...this.state,
      signIn: this.signIn,
      signOut: this.signOut
    };

    return (
      <AuthContext.Provider value={value}>
        {this.props.children}
      </AuthContext.Provider>
    );
  }
}

interface AuthContext extends AuthState, AuthActions {}

// Component should be NextStatelessComponent type
export const withAuth = Component => {
  return class extends React.Component<any, any> {
    static displayName = `withAuth(${Component.displayName || Component.name})`;

    static getInitialProps = Component.getInitialProps;

    render() {
      return (
        <AuthContext.Consumer>
          {(auth: AuthActions) => <Component {...this.props} {...auth} />}
        </AuthContext.Consumer>
      );
    }
  };
};

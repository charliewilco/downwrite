import * as React from "react";
import Cookies from "universal-cookie";
import Router from "next/router";
import * as jwt from "jwt-decode";
import addDays from "date-fns/add_days";
import { NextComponentClass } from "next";
import { __IS_TEST__ } from "../utils/dev";

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
  path: "/",
  expires: addDays(Date.now(), COOKIE_EXPIRATION)
};

interface IAuthProps {
  children: React.ReactNode;
  token: string;
  authed: boolean;
}

interface IAuthState {
  token: string;
  name?: string;
  authed: boolean;
}

export interface IAuthActions {
  signIn: (authed: boolean, token: string) => void;
  signOut: () => void;
}

export interface IAuthContext extends IAuthState, IAuthActions {}

interface IToken {
  name: string;
  user: string;
}

const EMPTY_USER: IToken = {
  user: null,
  name: null
};

export const AuthContext = React.createContext({} as IAuthContext);

// Should be able to just request user details from another call
export default class AuthMegaProvider extends React.Component<
  IAuthProps,
  IAuthState
> {
  constructor(props: IAuthProps) {
    super(props);

    let token = this.props.token || cookie.get("DW_TOKEN");

    let __TOKEN_EXISTS__: boolean = token !== undefined && token !== "undefined";
    const { name } = __TOKEN_EXISTS__ ? jwt<IToken>(token) : EMPTY_USER;

    this.state = {
      token,
      authed: __TOKEN_EXISTS__,
      name: name || null
    };
  }

  private signIn = (authed: boolean, token: string): void => {
    const { name } = jwt(token);
    this.setState({ authed, token, name });
    cookie.set("DW_TOKEN", token, cookieOptions);
  };

  private signOut = (): void => {
    this.setState({
      authed: false,
      token: undefined,
      name: undefined
    });
  };

  public componentDidUpdate(prevProps: IAuthProps, prevState: IAuthState): void {
    const { authed } = this.state;
    if (prevState.authed !== authed) {
      Router.push({ pathname: authed ? "/" : "/login" });

      if (!authed) {
        cookie.remove("DW_TOKEN", cookieOptions);
      }
    }
  }

  public render(): JSX.Element {
    return (
      <AuthContext.Provider
        value={{
          ...this.state,
          signIn: this.signIn,
          signOut: this.signOut
        }}>
        {this.props.children}
      </AuthContext.Provider>
    );
  }
}

export const AuthConsumer = AuthContext.Consumer;

// TODO: Remove
// Component should be NextStatelessComponent type
export const withAuth = (Component: NextComponentClass<any>) => {
  return class extends React.Component<any, any> {
    public static displayName = `withAuth(${Component.displayName ||
      Component.name})`;

    public static getInitialProps = Component.getInitialProps;

    public render(): JSX.Element {
      return (
        <AuthContext.Consumer>
          {(auth: IAuthActions) => <Component {...this.props} {...auth} />}
        </AuthContext.Consumer>
      );
    }
  };
};

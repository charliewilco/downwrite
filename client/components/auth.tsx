import * as React from "react";
import Cookies from "universal-cookie";
import Router from "next/router";
import * as jwt from "jwt-decode";
import addDays from "date-fns/add_days";
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

export interface IAuthProps {
  children: React.ReactNode;
  token: string;
  authed: boolean;
}

export interface IAuthState {
  token: string;
  name?: string;
  authed: boolean;
}

export interface IAuthActions {
  signIn: (authed: boolean, token: string) => void;
  signOut: () => void;
}

export interface IAuthContext extends IAuthState, IAuthActions {}

export interface IToken {
  name: string;
  user: string;
}

const EMPTY_USER: IToken = {
  user: null,
  name: null
};

export enum AuthActions {
  SIGN_IN = "SIGN_IN",
  SIGN_OUT = "SIGN_OUT"
}

export const AuthContext = React.createContext<IAuthContext>({} as IAuthContext);

interface IAuthReducerAction {
  type: AuthActions;
  payload?: IAuthState;
}

function reducer(state: IAuthState, action: IAuthReducerAction) {
  switch (action.type) {
    case AuthActions.SIGN_IN:
      return { ...action.payload };
    case AuthActions.SIGN_OUT:
      return { token: null, authed: false, name: null };
    default:
      throw new Error();
  }
}

function initializer(tokenInitial?: string): IAuthState {
  let token = tokenInitial || cookie.get("DW_TOKEN");

  let __TOKEN_EXISTS__: boolean = token !== undefined && token !== "undefined";
  const { name } = __TOKEN_EXISTS__ ? jwt<IToken>(token) : EMPTY_USER;

  return {
    token,
    authed: __TOKEN_EXISTS__,
    name: name || null
  };
}

// Should be able to just request user details from another call
export function AuthProvider(props: IAuthProps) {
  const [state, dispatch] = React.useReducer<
    React.Reducer<IAuthState, IAuthReducerAction>,
    string
  >(reducer, props.token, initializer);

  React.useEffect(() => {
    if (state.authed && Router.route === "/login") {
      Router.push({ pathname: "/" });
    }

    if (!state.authed) {
      Router.push({ pathname: "/login" });
      cookie.remove("DW_TOKEN", cookieOptions);
    }
  }, [state.authed]);

  React.useEffect(() => {
    cookie.set("DW_TOKEN", state.token, cookieOptions);
  }, [state.token]);

  function signIn(authed: boolean, token: string) {
    const { name } = jwt<IToken>(token);

    dispatch({
      type: AuthActions.SIGN_IN,
      payload: {
        token,
        authed,
        name
      }
    });
  }

  function signOut() {
    dispatch({ type: AuthActions.SIGN_OUT });
  }

  const context: IAuthContext = {
    ...state,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={context}>{props.children}</AuthContext.Provider>
  );
}

import * as React from "react";
import Cookies from "universal-cookie";
import jwt from "jwt-decode";
import addDays from "date-fns/addDays";
import {
  AuthReducerAction,
  IAuthState,
  AuthActions,
  reducer
} from "../reducers/auth";
import { useRouter } from "next/router";

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

export interface IAuthProps extends React.PropsWithChildren<{}> {
  token: string;
  authed: boolean;
}

export interface IAuthActions {
  signIn: (authed: boolean, token: string) => void;
  signOut: () => void;
}

export type AuthContextType = [IAuthState, IAuthActions];

export interface IToken {
  name: string;
  user: string;
}

const EMPTY_USER: IToken = {
  user: null,
  name: null
};

export const AuthContext = React.createContext<AuthContextType>([
  null,
  null
] as AuthContextType);

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

export function useAuthReducer(tokenInitial?: string): [IAuthState, IAuthActions] {
  const [state, dispatch] = React.useReducer<
    React.Reducer<IAuthState, AuthReducerAction>,
    string
  >(reducer, tokenInitial, initializer);

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

  return [state, { signIn, signOut }];
}

export function useAuthSideEffects({ authed, token }: IAuthState): void {
  const router = useRouter();
  React.useEffect(() => {
    if (authed && router.pathname === "/login") {
      router.push({ pathname: "/" });
    }

    if (!authed) {
      router.push({ pathname: "/login" });
      cookie.remove("DW_TOKEN", cookieOptions);
    }
  }, [router, router.pathname, authed]);

  React.useEffect(() => {
    if (token) {
      cookie.set("DW_TOKEN", token, cookieOptions);
    }
  }, [token]);
}

// Should be able to just request user details from another call
export function AuthProvider({ token, children }: IAuthProps) {
  const [state, { signIn, signOut }] = useAuthReducer(token);

  useAuthSideEffects(state);

  const getAuthContext = React.useCallback((): AuthContextType => {
    return [
      state,
      {
        signIn,
        signOut
      }
    ];
  }, [state, signIn, signOut]);

  const value = React.useMemo<AuthContextType>(() => getAuthContext(), [
    getAuthContext
  ]);

  return React.createElement(AuthContext.Provider, { value }, children);
}

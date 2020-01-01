/* eslint-disable no-console */
import * as React from "react";
import { AuthContext, IAuthActions } from "../../components/auth";
import { IAuthState } from "../../reducers/auth";

interface IMockAuthProps extends IAuthState, IAuthActions {}

export function MockAuthProvider(
  props: React.PropsWithChildren<Partial<IMockAuthProps>>
): JSX.Element {
  const defaultSignIn = () => console.log("Sign in mock");
  const defaultSignOut = () => console.log("Sign out mock");

  return (
    <AuthContext.Provider
      value={[
        {
          authed: props.authed || false,
          token: props.token || ".....SOME_RANDOM_TOKEN....",
          name: props.token || "Charles"
        },
        {
          signIn: props.signIn || defaultSignIn,
          signOut: props.signOut || defaultSignOut
        }
      ]}>
      {props.children}
    </AuthContext.Provider>
  );
}

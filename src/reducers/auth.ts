export enum AuthActions {
  SIGN_IN = "SIGN_IN",
  SIGN_OUT = "SIGN_OUT"
}

export interface IAuthState {
  token: string;
  name?: string;
  authed: boolean;
}

export interface IAuthReducerAction {
  type: AuthActions;
  payload?: IAuthState;
}

export type AuthReducerAction =
  | { type: AuthActions.SIGN_IN; payload: IAuthState }
  | { type: AuthActions.SIGN_OUT };

export const reducer = (
  state: IAuthState,
  action: AuthReducerAction
): IAuthState => {
  switch (action.type) {
    case AuthActions.SIGN_IN: {
      return { ...action.payload };
    }
    case AuthActions.SIGN_OUT: {
      return {
        authed: false,
        name: null,
        token: null
      };
    }
  }
};

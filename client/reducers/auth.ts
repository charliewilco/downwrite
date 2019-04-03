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

export function reducer(state: IAuthState, action: IAuthReducerAction) {
  switch (action.type) {
    case AuthActions.SIGN_IN:
      return { ...action.payload };
    case AuthActions.SIGN_OUT:
      return { token: null, authed: false, name: null };
    default:
      throw new Error();
  }
}

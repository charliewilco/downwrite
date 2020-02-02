import produce from "immer";

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

export const reducer = produce((draft: IAuthState, action: IAuthReducerAction) => {
  switch (action.type) {
    case AuthActions.SIGN_IN: {
      draft = { ...action.payload };
      break;
    }
    case AuthActions.SIGN_OUT: {
      draft.authed = false;
      draft.name = null;
      draft.token = null;

      break;
    }
    default:
      throw new Error();
  }
});

import { reducer, AuthActions, IAuthState } from "../reducers/auth";
import uuid from "uuid/v4";

const initialState: IAuthState = {
  token: "",
  name: "",
  authed: false
};

describe("Auth Reducers", () => {
  it("can log in", () => {
    const token = uuid();
    const state = reducer(initialState, {
      type: AuthActions.SIGN_IN,
      payload: {
        token,
        name: "charliewilco",
        authed: true
      }
    });

    expect(state.authed).toBeTruthy();
    expect(state.token).toEqual(token);
  });
  it("can log out", () => {
    const state: IAuthState = reducer(initialState, {
      type: AuthActions.SIGN_IN,
      payload: {
        token: uuid(),
        name: "charliewilco",
        authed: true
      }
    });

    const logoutState = reducer(state, {
      type: AuthActions.SIGN_OUT
    });

    expect(state.token.length).toBeGreaterThan(1);
    expect(logoutState.authed).toBeFalsy();
    expect(logoutState.token).toBeFalsy();
  });
});

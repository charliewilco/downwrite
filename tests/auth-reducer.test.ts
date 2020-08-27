import { reducer, AuthActions, IAuthState } from "../reducers/auth";
import uuid from "uuid/v4";

const initialState: IAuthState = {
  token: "",
  name: "",
  authed: false
};

describe("Auth Reducers", () => {
  it("can log out", () => {
    const state: IAuthState = reducer(initialState, {
      type: AuthActions.SIGN_IN,
      payload: {
        token: uuid(),
        name: "charliewilco",
        authed: true
      }
    });

    expect(state.token.length).toBeGreaterThan(1);
  });
});

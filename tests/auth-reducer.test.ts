import { reducer, AuthActions, IAuthState } from "../src/reducers/auth";
import { v4 as uuid } from "uuid";

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

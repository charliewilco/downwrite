import { reducer, initialState, DashActions } from "../reducers/dashboard";

describe("Dashboard Reducer", () => {
  it("runs without hook", () => {
    const state = reducer(initialState(), { type: DashActions.CANCEL_DELETE });

    expect(state.modalOpen).toBeFalsy();
    expect(state.selectedPost).toBeNull();
  });
});

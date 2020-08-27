import { reducer, initialState, DashboardAction } from "../src/reducers/dashboard";

describe("Dashboard Reducer", () => {
  it("runs without hook", () => {
    const state = reducer(initialState([]), {
      type: DashboardAction.FETCH_ENTRIES,
      payload: {
        entries: []
      }
    });

    expect(state.entries).toHaveLength(0);
  });
});

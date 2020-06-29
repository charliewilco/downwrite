import { reducer, initialState, DashActions } from "../reducers/dashboard";

// SELECT_POST = "SELECT_POST",
// CANCEL_DELETE = "CANCEL_DELETE",
// CLOSE_MODAL = "CLOSE_MODAL",
// DELETED = "DELETED"

describe("Dashboard Reducer", () => {
  it("runs without hook", () => {
    const state = initialState();

    expect(state.modalOpen).toBeFalsy();
    expect(state.selectedPost).toBeNull();
  });

  it("reducer SELECT_POST", () => {
    const state = reducer(initialState(), {
      type: DashActions.SELECT_POST,
      payload: {
        id: "dafdsfads",
        title: "Some Post"
      }
    });

    expect(state.selectedPost!.title).toBe("Some Post");
    expect(state.modalOpen).toBeTruthy();
  });

  it("reducer CANCEL_DELETE", () => {
    const initial = initialState();
    const state = reducer(initial, {
      type: DashActions.CANCEL_DELETE
    });

    expect(initial.modalOpen).toEqual(state.modalOpen);
    expect(initial.selectedPost).toEqual(state.selectedPost);
  });

  it("reducer CLOSE_MODAL", () => {
    const initial = initialState();
    const state = reducer(initial, {
      type: DashActions.CLOSE_MODAL
    });

    expect(initial.modalOpen).toEqual(state.modalOpen);
    expect(initial.selectedPost).toEqual(state.selectedPost);
  });

  it("reducer DELETE", () => {
    const initial = initialState();
    const state = reducer(initial, {
      type: DashActions.DELETED
    });

    expect(initial.modalOpen).toEqual(state.modalOpen);
    expect(initial.selectedPost).toEqual(state.selectedPost);
  });
});

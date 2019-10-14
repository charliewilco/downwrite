import { reducer, EditActions, initializer } from "../reducers/editor";

// UPDATE_TITLE = "UPDATE_TITLE",
// UPDATE_EDITOR = "UPDATE_EDITOR",
// TOGGLE_PUBLIC_STATUS = "TOGGLE_PUBLIC_STATUS",
// SET_INITIAL_FOCUS = "SET_INITIAL_FOCUS",
// EDITOR_COMMAND = "myeditor-save"

// type EditorActions =
//   | { type: EditActions.TOGGLE_PUBLIC_STATUS }
//   | { type: EditActions.SET_INITIAL_FOCUS }
//   | { type: EditActions.UPDATE_EDITOR; payload: Draft.EditorState }
//   | { type: EditActions.UPDATE_TITLE; payload: string };

const defaultState = initializer({
  entry: {
    public: false,
    title: "Some Post",
    content: `
          # Hello

          This is [an example](http://example.com "Example") link. This link has no title attr.

          > Something
        `
  }
});

describe("Dashboard Reducer", () => {
  it("has default state", () => {
    const state = defaultState;
    expect(state.title).toBe(defaultState.title);
    expect(state.publicStatus).toBeFalsy();
    expect(state.initialFocus).toBeFalsy();
    expect(state.editorState).not.toBeNull();
  });

  it("reducer updates title", () => {
    const state = reducer(defaultState, {
      type: EditActions.UPDATE_TITLE,
      payload: "New Title"
    });

    expect(state.title).not.toBe(defaultState.title);
    expect(state.title).toBe("New Title");
  });

  it("reducer updates public status", () => {
    const state = reducer(defaultState, {
      type: EditActions.TOGGLE_PUBLIC_STATUS
    });

    const newState = reducer(state, {
      type: EditActions.TOGGLE_PUBLIC_STATUS
    });

    expect(state.publicStatus).toBeTruthy();
    expect(newState.publicStatus).toBeFalsy();
  });

  it("sets initialFocus", () => {
    const state = reducer(defaultState, {
      type: EditActions.SET_INITIAL_FOCUS
    });

    expect(defaultState.initialFocus).toBeFalsy();
    expect(state.initialFocus).toBeTruthy();
  });
});

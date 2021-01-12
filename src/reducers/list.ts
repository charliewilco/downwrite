export enum ListActions {
  TOGGLE,
  SET
}

export type ListReducerAction =
  | {
      type: ListActions.TOGGLE;
    }
  | {
      type: ListActions.SET;
      payload: boolean;
    };

export interface IPostListState {
  isGridView: boolean;
}

export function listReducer(
  state: IPostListState,
  action: ListReducerAction
): IPostListState {
  switch (action.type) {
    case ListActions.TOGGLE:
      return { isGridView: !state.isGridView };
    case ListActions.SET:
      return { isGridView: action.payload };
    default:
      throw new Error("Must specify action type");
  }
}

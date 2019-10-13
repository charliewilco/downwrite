import { Entry } from "../types/generated";

export interface IDashboardState {
  selectedPost?: Entry;
  modalOpen: boolean;
}

export enum DashActions {
  SELECT_POST = "SELECT_POST",
  CANCEL_DELETE = "CANCEL_DELETE",
  CLOSE_MODAL = "CLOSE_MODAL",
  DELETED = "DELETED"
}

export function initialState(): IDashboardState {
  return {
    modalOpen: false,
    selectedPost: null
  };
}

export type DashboardActionType =
  | { type: DashActions.SELECT_POST; payload: Entry }
  | { type: DashActions.CANCEL_DELETE }
  | { type: DashActions.DELETED }
  | { type: DashActions.CLOSE_MODAL };

export function reducer(
  state: IDashboardState,
  action: DashboardActionType
): IDashboardState {
  switch (action.type) {
    case DashActions.SELECT_POST:
      return {
        ...state,
        modalOpen: true,
        selectedPost: action.payload
      };
    case DashActions.CLOSE_MODAL:
      return {
        ...state,
        modalOpen: false
      };
    case DashActions.DELETED:
      return {
        ...state,
        modalOpen: false,
        selectedPost: null
      };

    case DashActions.CANCEL_DELETE:
      return { ...state, modalOpen: false, selectedPost: null };

    default:
      throw new Error("Must specify action type");
  }
}

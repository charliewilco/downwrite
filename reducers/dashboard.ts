import * as Dwnxt from "downwrite";
import { Entry } from "../types/generated";

type Selected<T> = T | Partial<T>;

export type SelectedPost = Selected<Entry>;

export interface IDashboardState {
  selectedPost?: SelectedPost;
  modalOpen: boolean;
}

export enum DashActions {
  SELECT_POST = "SELECT_POST",
  CANCEL_DELETE = "CANCEL_DELETE",
  CLOSE_MODAL = "CLOSE_MODAL",
  DELETED = "DELETED"
}

export interface IDashboardAction {
  type: DashActions;
  payload?: {
    selectedPost?: SelectedPost;
  };
}

export function initialState(): IDashboardState {
  return {
    modalOpen: false,
    selectedPost: null
  };
}

export type DashboardActionType =
  | {
      type: DashActions.SELECT_POST;
      payload: SelectedPost;
    }
  | {
      type: DashActions.CANCEL_DELETE;
    }
  | {
      type: DashActions.DELETED;
    }
  | {
      type: DashActions.CLOSE_MODAL;
    };

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

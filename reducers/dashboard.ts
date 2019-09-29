import * as Dwnxt from "downwrite";
import orderBy from "lodash/orderBy";

type Selected<T> = T | Partial<T>;

export type SelectedPost = Selected<Dwnxt.IPost>;

export interface IDashboardState {
  entries: Dwnxt.IPost[] | Dwnxt.IPostError;
  loaded: boolean;
  selectedPost?: SelectedPost;
  modalOpen: boolean;
  error: string;
}

export enum DashboardAction {
  ERROR_BIG_TIME = "ERROR_BIG_TIME",
  SELECT_POST = "SELECT_POST",
  CANCEL_DELETE = "CANCEL_DELETE",
  FETCH_ENTRIES = "FETCH_ENTRIES",
  CLOSE_MODAL = "CLOSE_MODAL",
  DELETED = "DELETED"
}

export interface IDashboardAction {
  type: DashboardAction;
  payload?: {
    errorMessage?: Dwnxt.IPostError;
    selectedPost?: SelectedPost;
    entries?: Dwnxt.IPost[];
  };
}

export function initialState(
  entries?: Dwnxt.IPost[] | Dwnxt.IPostError
): IDashboardState {
  return {
    entries: [],
    error: "",
    loaded: true,

    modalOpen: false,
    selectedPost: null
  };
}

export function reducer(
  state: IDashboardState,
  action: IDashboardAction
): IDashboardState {
  switch (action.type) {
    case DashboardAction.SELECT_POST:
      return {
        ...state,
        modalOpen: true,
        selectedPost: action.payload.selectedPost
      };
    case DashboardAction.CLOSE_MODAL:
      return {
        ...state,
        modalOpen: false
      };
    case DashboardAction.DELETED:
      return {
        ...state,
        modalOpen: false,
        selectedPost: null
      };
    case DashboardAction.ERROR_BIG_TIME:
      return {
        ...state,
        error: action.payload.errorMessage.message,
        loaded: true,
        selectedPost: null
      };
    case DashboardAction.CANCEL_DELETE:
      return { ...state, modalOpen: false, selectedPost: null };
    case DashboardAction.FETCH_ENTRIES:
      return {
        ...state,
        selectedPost: null,
        loaded: true,
        modalOpen: false,
        entries: orderBy(action.payload.entries, "dateModified", ["desc"])
      };

    default:
      throw new Error("Must specify action type");
  }
}

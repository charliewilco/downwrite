export interface IDashboardState {
  selectedPost: IPartialFeedItem;
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

export interface IPartialFeedItem {
  id: string;
  title: string;
}

export type DashboardActionType =
  | { type: DashActions.SELECT_POST; payload: IPartialFeedItem }
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
        modalOpen: true,
        selectedPost: action.payload
      };
    case DashActions.CLOSE_MODAL:
    case DashActions.DELETED:
    case DashActions.CANCEL_DELETE:
      return initialState();

    default:
      throw new Error("Must specify action type");
  }
}

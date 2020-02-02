import * as React from "react";
import {
  IDashboardState,
  initialState,
  reducer,
  DashActions,
  DashboardActionType,
  IPartialFeedItem
} from "../reducers/dashboard";

export default function useDashboard() {
  const [state, dispatch] = React.useReducer<
    React.Reducer<IDashboardState, DashboardActionType>
  >(reducer, initialState());

  return [
    state,
    {
      onCancel: () => dispatch({ type: DashActions.CANCEL_DELETE }),
      onCloseModal: () => dispatch({ type: DashActions.CLOSE_MODAL }),
      onSelect: (payload: IPartialFeedItem) =>
        dispatch({
          type: DashActions.SELECT_POST,
          payload
        })
    }
  ] as const;
}

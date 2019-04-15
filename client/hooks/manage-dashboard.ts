import * as React from "react";
import { AuthContext, IAuthContext } from "../components/auth";
import {
  IDashboardAction,
  IDashboardState,
  initialState,
  reducer,
  DashboardAction,
  SelectedPost
} from "../reducers/dashboard";
import * as API from "../utils/api";
import * as Dwnxt from "downwrite";
import isEmpty from "lodash/isEmpty";

type Entries = Dwnxt.IPost[] | Dwnxt.IPostError;

interface IManagedDashboardActions {
  onCancel: () => void;
  onCloseModal: () => void;
  onSelect: (s: SelectedPost) => void;
  onConfirmDelete: () => void;
}

export default function useManagedDashboard(
  initialEntries: Entries
): [IDashboardState, IManagedDashboardActions] {
  const [state, dispatch] = React.useReducer<
    React.Reducer<IDashboardState, IDashboardAction>
  >(reducer, { ...initialState(initialEntries) });
  const { token } = React.useContext<IAuthContext>(AuthContext);

  React.useEffect(() => {
    if (isEmpty(state.entries)) {
      getPosts();
    }
  }, []);

  async function getPosts(close?: boolean): Promise<void> {
    const { host } = document.location;
    const entries = await API.getPosts({ token, host });

    if (Array.isArray(entries)) {
      dispatch({ type: DashboardAction.FETCH_ENTRIES, payload: { entries } });
    } else if (typeof entries === "object") {
      dispatch({
        type: DashboardAction.ERROR_BIG_TIME,
        payload: { errorMessage: entries }
      });
    }
  }

  async function onDelete({ id }: SelectedPost): Promise<void> {
    const { host } = document.location;

    const response = await API.removePost(id, { token, host });

    if (response.ok) {
      await getPosts(true);
    }
  }

  const ManagedDashboard: IManagedDashboardActions = {
    onCancel: () => dispatch({ type: DashboardAction.CANCEL_DELETE }),
    onCloseModal: () => dispatch({ type: DashboardAction.CLOSE_MODAL }),
    onSelect: (selectedPost: SelectedPost) =>
      dispatch({
        type: DashboardAction.SELECT_POST,
        payload: { selectedPost }
      }),
    onConfirmDelete: () => onDelete(state.selectedPost)
  };

  return [state, ManagedDashboard];
}

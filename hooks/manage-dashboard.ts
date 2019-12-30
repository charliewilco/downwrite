import * as React from "react";
import {
  IDashboardState,
  initialState,
  reducer,
  DashActions,
  DashboardActionType
} from "../reducers/dashboard";
import {
  useRemoveEntryMutation,
  useAllPostsQuery,
  IEntry
} from "../utils/generated";

export default function useDashboard() {
  const [state, dispatch] = React.useReducer<
    React.Reducer<IDashboardState, DashboardActionType>
  >(reducer, initialState());

  const { data, loading, error, refetch } = useAllPostsQuery({
    ssr: true
  });

  const [deleteEntry] = useRemoveEntryMutation();

  async function onDelete({ id }: IEntry): Promise<void> {
    await deleteEntry({ variables: { id } })
      .then(() => refetch())
      .catch();
  }

  return [
    { state, data, loading, error },
    {
      onCancel: () => dispatch({ type: DashActions.CANCEL_DELETE }),
      onCloseModal: () => dispatch({ type: DashActions.CLOSE_MODAL }),
      onSelect: (payload: IEntry) =>
        dispatch({
          type: DashActions.SELECT_POST,
          payload
        }),
      onConfirmDelete: () => onDelete(state.selectedPost)
    }
  ] as const;
}

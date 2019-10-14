import * as React from "react";
import { useQuery, useMutation } from "@apollo/react-hooks";
import {
  IDashboardState,
  initialState,
  reducer,
  DashActions,
  DashboardActionType
} from "../reducers/dashboard";

import { ALL_POSTS_QUERY, REMOVE_ENTRY_MUTATION } from "../utils/queries";
import { MutationDeleteEntryArgs, Entry } from "../types/generated";

export default function useDashboard() {
  const [state, dispatch] = React.useReducer<
    React.Reducer<IDashboardState, DashboardActionType>
  >(reducer, initialState());

  const { data, loading, error, refetch } = useQuery(ALL_POSTS_QUERY, {
    ssr: true
  });

  const [deleteEntry] = useMutation<Entry, MutationDeleteEntryArgs>(
    REMOVE_ENTRY_MUTATION
  );

  async function onDelete({ id }: Entry): Promise<void> {
    await deleteEntry({ variables: { id } })
      .then(() => refetch())
      .catch();
  }

  return [
    { state, data, loading, error },
    {
      onCancel: () => dispatch({ type: DashActions.CANCEL_DELETE }),
      onCloseModal: () => dispatch({ type: DashActions.CLOSE_MODAL }),
      onSelect: (payload: Entry) =>
        dispatch({
          type: DashActions.SELECT_POST,
          payload
        }),
      onConfirmDelete: () => onDelete(state.selectedPost)
    }
  ] as const;
}

import * as React from "react";
import { SelectedPost } from "../reducers/dashboard";
import { AuthContext, IAuthContext } from "../components/auth";
import * as API from "../utils/api";

type RemoveEntryCallBack = [(post: SelectedPost) => Promise<void>];

export default function useRemoveEntry(onSuccess: Function): RemoveEntryCallBack {
  const { token } = React.useContext<IAuthContext>(AuthContext);
  async function onDelete({ id }: SelectedPost): Promise<void> {
    const { host } = document.location;
    const response = await API.removePost(id, { token, host });

    if (response.ok) {
      onSuccess();
    }
  }

  return [(post: SelectedPost) => onDelete(post)];
}

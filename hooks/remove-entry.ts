import * as React from "react";
import { SelectedPost } from "../reducers/dashboard";
import { AuthContext, AuthContextType } from "../components/auth";
import { removePost } from "../utils/api";

type RemoveEntryCallBack = [(post: SelectedPost) => Promise<void>];

export default function useRemoveEntry(onSuccess: Function): RemoveEntryCallBack {
  const [{ token }] = React.useContext<AuthContextType>(AuthContext);
  async function onDelete({ id }: SelectedPost): Promise<void> {
    const response = await removePost(id!, { token });

    if (response.ok) {
      onSuccess();
    }
  }

  return [(post: SelectedPost) => onDelete(post)];
}

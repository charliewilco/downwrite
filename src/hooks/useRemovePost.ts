import { useCallback } from "react";
import { dwClient } from "@lib/client";

type RemoveFn = (id: string) => Promise<void>;

export function useRemovePost(): RemoveFn {
  const onConfirmDelete = useCallback<RemoveFn>(async function (
    id: string
  ): Promise<void> {
    await dwClient.RemoveEntry({ id }).catch((err) => console.log(err));
  },
  []);

  return onConfirmDelete;
}

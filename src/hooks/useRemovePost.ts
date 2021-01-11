import { useCallback } from "react";
import { updateFeedCache } from "@utils/cache";
import { useRemoveEntryMutation } from "../__generated__/client";

type RemoveFn = (id: string) => Promise<void>;

export function useRemovePost(): RemoveFn {
  const [mutationFn] = useRemoveEntryMutation();

  const onConfirmDelete = useCallback<RemoveFn>(
    async function (id: string): Promise<void> {
      await mutationFn({
        variables: { id },
        update: updateFeedCache
      }).catch((err) => console.log(err));
    },
    [mutationFn]
  );

  return onConfirmDelete;
}

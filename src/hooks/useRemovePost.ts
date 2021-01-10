import { useCallback } from "react";
import { useRemoveEntryMutation } from "@utils/generated";
import { updateFeedCache } from "@utils/cache";

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

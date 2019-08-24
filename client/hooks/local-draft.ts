import * as React from "react";
import { IFields } from "./create-entry";
import uuid from "uuid/v4";

export interface ILocalDraft extends IFields {
  id: string;
}

type LocalDraft = [
  () => ILocalDraft[],
  (post: IFields) => ILocalDraft,
  (id: string) => void
];

export function useLocalDraftUtils(): LocalDraft {
  const PREFIX = "DOWNWRITE_DRAFT";

  function removeDraft(id: string): void {
    localStorage.removeItem([PREFIX, id].join(" "));
  }

  function writeToStorage(draft: IFields): ILocalDraft {
    const id = uuid();
    const localDraft = Object.assign(draft, { id });
    localStorage.setItem([PREFIX, id].join(" "), JSON.stringify(localDraft));

    return localDraft;
  }

  function getAllDrafts(): ILocalDraft[] {
    const drafts: ILocalDraft[] = Object.keys(localStorage)
      .filter(function(key) {
        return key.includes(PREFIX);
      })
      .map(function(key) {
        const draft = localStorage.getItem(key);
        return JSON.parse(draft);
      });

    return drafts;
  }

  return [getAllDrafts, writeToStorage, removeDraft];
}

// TODO: Migrate to useReducer()
export default function useLocalDrafts() {
  const [drafts, setDrafts] = React.useState<ILocalDraft[]>([]);
  const [getAllDrafts, writeToStorage, removeFromStorage] = useLocalDraftUtils();

  React.useEffect(function() {
    setDrafts(getAllDrafts());
  }, []);

  function addDraft(draft: IFields): void {
    const localDraft = writeToStorage(draft);
    setDrafts(prev => [...prev, localDraft]);
  }

  function removeDraft(draft: ILocalDraft) {
    removeFromStorage(draft.id);
    setDrafts(getAllDrafts());
  }

  return {
    drafts,
    actions: {
      addDraft,
      removeDraft
    }
  };
}

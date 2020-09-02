import { useState, useEffect, useCallback, useReducer } from "react";
import { convertToRaw, RawDraftContentState, EditorState } from "draft-js";
import { v4 as uuid } from "uuid";
import produce from "immer";

export interface ILocalDraft {
  title: string;
  id: string;
  content: RawDraftContentState;
}

export const LOCAL_PREFIX = "DOWNWRITE_DRAFT";

export function useLocalDraftUtils(prefix = LOCAL_PREFIX) {
  const removeFromStorage = useCallback(
    (id: string) => {
      const key = [prefix, id].join(" ");

      localStorage.removeItem(key);
    },
    [prefix]
  );

  const writeToStorage = useCallback(
    (title: string, editorState: EditorState) => {
      const id = uuid();
      const content: RawDraftContentState = convertToRaw(
        editorState.getCurrentContent()
      );
      const localDraft = { title, content, id };

      localStorage.setItem([prefix, id].join(" "), JSON.stringify(localDraft));

      return localDraft;
    },
    [prefix]
  );

  const getAllDrafts = useCallback((): ILocalDraft[] => {
    const drafts: ILocalDraft[] = Object.keys(localStorage)
      .filter(function(key) {
        return key.includes(prefix);
      })
      .map(function(key) {
        // can assume this isn't null because it passes the filter
        const draft = localStorage.getItem(key)!;
        return JSON.parse(draft);
      });

    return drafts;
  }, [prefix]);

  return { getAllDrafts, writeToStorage, removeFromStorage } as const;
}

// TODO: Migrate to useReducer()
enum LocalDraftActionTypes {
  REMOVE_LOCAL_DRAFT,
  ADD_LOCAL_DRAFT,
}
type LocalDraftActions =
  | { type: LocalDraftActionTypes.REMOVE_LOCAL_DRAFT; id: string }
  | {
      type: LocalDraftActionTypes.ADD_LOCAL_DRAFT;
      item: ILocalDraft;
    };

const localDraftReducer: React.Reducer<ILocalDraft[], LocalDraftActions> = produce(
  (draft: ILocalDraft[], action: LocalDraftActions) => {
    switch (action.type) {
      case LocalDraftActionTypes.ADD_LOCAL_DRAFT:
        draft.push(action.item);
        break;
      case LocalDraftActionTypes.REMOVE_LOCAL_DRAFT:
        break;
      default:
        throw new Error("Must specify action type");
    }
  }
);

export function useLocalDrafts() {
  const [drafts, setDrafts] = useState<ILocalDraft[]>([]);
  const [state, dispatch] = useReducer(localDraftReducer, []);
  const { getAllDrafts, writeToStorage, removeFromStorage } = useLocalDraftUtils();

  useEffect(() => {
    setDrafts(getAllDrafts());
  }, [setDrafts, getAllDrafts]);

  const addDraft = useCallback(
    (title: string, editorState: EditorState): void => {
      const localDraft = writeToStorage(title, editorState);
      setDrafts((prev) => [...prev, localDraft]);
    },
    [setDrafts, writeToStorage]
  );

  const removeDraft = useCallback(
    (draft: ILocalDraft): void => {
      removeFromStorage(draft.id);
      setDrafts(getAllDrafts());
    },
    [removeFromStorage, setDrafts, getAllDrafts]
  );

  return [
    drafts,
    {
      addDraft,
      removeDraft,
    },
  ];
}

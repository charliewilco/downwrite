import { useEffect, useCallback, useReducer } from "react";
import { convertToRaw, RawDraftContentState, EditorState } from "draft-js";
import { v4 as uuid } from "uuid";
import {
  ILocalDraft,
  localDraftReducer,
  LocalDraftActionTypes
} from "@reducers/local";

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
      .filter(function (key) {
        return key.includes(prefix);
      })
      .map(function (key) {
        // can assume this isn't null because it passes the filter
        const draft = localStorage.getItem(key)!;
        return JSON.parse(draft);
      });

    return drafts;
  }, [prefix]);

  return { getAllDrafts, writeToStorage, removeFromStorage } as const;
}

export function useLocalDrafts() {
  const [state, dispatch] = useReducer(localDraftReducer, []);
  const { getAllDrafts, writeToStorage, removeFromStorage } = useLocalDraftUtils();

  useEffect(() => {
    dispatch({
      type: LocalDraftActionTypes.LOAD_LOCAL_DRAFTS,
      items: getAllDrafts()
    });
  }, [dispatch, getAllDrafts]);

  const addDraft = useCallback(
    (title: string, editorState: EditorState): void => {
      const item = writeToStorage(title, editorState);
      dispatch({ type: LocalDraftActionTypes.ADD_LOCAL_DRAFT, item });
    },
    [dispatch, writeToStorage]
  );

  const removeDraft = useCallback(
    (draft: ILocalDraft): void => {
      removeFromStorage(draft.id);
      dispatch({
        type: LocalDraftActionTypes.LOAD_LOCAL_DRAFTS,
        items: getAllDrafts()
      });
    },
    [removeFromStorage, dispatch, getAllDrafts]
  );

  return [
    state,
    {
      addDraft,
      removeDraft
    }
  ];
}

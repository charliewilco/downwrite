import { useState, useEffect } from "react";
import * as Draft from "draft-js";
import { INewEditorValues } from "./";
import { v4 as uuid } from "uuid";

export interface ILocalDraft {
  title: string;
  id: string;
  content: Draft.RawDraftContentState;
}

type LocalDraft = [
  () => ILocalDraft[],
  (post: INewEditorValues) => ILocalDraft,
  (id: string) => void
];

export function useLocalDraftUtils(): LocalDraft {
  const PREFIX = "DOWNWRITE_DRAFT";

  function removeDraft(id: string): void {
    const key = [PREFIX, id].join(" ");

    localStorage.removeItem(key);
  }

  function writeToStorage({ title, editorState }: INewEditorValues): ILocalDraft {
    const id = uuid();
    const content: Draft.RawDraftContentState = Draft.convertToRaw(
      editorState.getCurrentContent()
    );
    const localDraft = { title, content, id };

    localStorage.setItem([PREFIX, id].join(" "), JSON.stringify(localDraft));

    return localDraft;
  }

  function getAllDrafts(): ILocalDraft[] {
    const drafts: ILocalDraft[] = Object.keys(localStorage)
      .filter(function(key) {
        return key.includes(PREFIX);
      })
      .map(function(key) {
        // can assume this isn't null because it passes the filter
        const draft = localStorage.getItem(key)!;
        return JSON.parse(draft);
      });

    return drafts;
  }

  return [getAllDrafts, writeToStorage, removeDraft];
}

// TODO: Migrate to useReducer()

interface ILocalDraftActions {
  addDraft(draft: INewEditorValues): void;
  removeDraft(draft: ILocalDraft): void;
}

// function pushDraftToEditor({ title, content }: ILocalDraft) {
//   const editorState = Draft.EditorState.createWithContent(
//     Draft.convertFromRaw(content)
//   );
//   setInitialValues({ title, editorState });
// }

export function useLocalDrafts(): [ILocalDraft[], ILocalDraftActions] {
  const [drafts, setDrafts] = useState<ILocalDraft[]>([]);
  const [getAllDrafts, writeToStorage, removeFromStorage] = useLocalDraftUtils();

  useEffect(
    function() {
      setDrafts(getAllDrafts());
    },
    [getAllDrafts]
  );

  function addDraft(draft: INewEditorValues): void {
    const localDraft = writeToStorage(draft);
    setDrafts(prev => [...prev, localDraft]);
  }

  function removeDraft(draft: ILocalDraft): void {
    removeFromStorage(draft.id);
    setDrafts(getAllDrafts());
  }

  return [
    drafts,
    {
      addDraft,
      removeDraft
    }
  ];
}

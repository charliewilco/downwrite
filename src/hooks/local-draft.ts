import * as React from "react";
import * as Draft from "draft-js";
import { IFields } from "./create-entry";
import { v4 as uuid } from "uuid";

export interface ILocalDraft {
  title: string;
  id: string;
  content: Draft.RawDraftContentState;
}

type LocalDraft = [
  () => ILocalDraft[],
  (post: IFields) => ILocalDraft,
  (id: string) => void
];

export function useLocalDraftUtils(): LocalDraft {
  const PREFIX = "DOWNWRITE_DRAFT";

  function removeDraft(id: string): void {
    const key = [PREFIX, id].join(" ");

    localStorage.removeItem(key);
  }

  function writeToStorage({ title, editorState }: IFields): ILocalDraft {
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
        const draft = localStorage.getItem(key);
        return JSON.parse(draft);
      });

    return drafts;
  }

  return [getAllDrafts, writeToStorage, removeDraft];
}

// TODO: Migrate to useReducer()

interface ILocalDraftActions {
  addDraft(draft: IFields): void;
  removeDraft(draft: ILocalDraft): void;
}

// function pushDraftToEditor({ title, content }: ILocalDraft) {
//   const editorState = Draft.EditorState.createWithContent(
//     Draft.convertFromRaw(content)
//   );
//   setInitialValues({ title, editorState });
// }

export default function useLocalDrafts(): [ILocalDraft[], ILocalDraftActions] {
  const [drafts, setDrafts] = React.useState<ILocalDraft[]>([]);
  const [getAllDrafts, writeToStorage, removeFromStorage] = useLocalDraftUtils();

  React.useEffect(function() {
    setDrafts(getAllDrafts());
  }, []);

  function addDraft(draft: IFields): void {
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

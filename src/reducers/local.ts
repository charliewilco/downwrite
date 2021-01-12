import produce from "immer";
import { RawDraftContentState } from "draft-js";

export interface ILocalDraft {
  title: string;
  id: string;
  content: RawDraftContentState;
}

export enum LocalDraftActionTypes {
  REMOVE_LOCAL_DRAFT,
  ADD_LOCAL_DRAFT,
  LOAD_LOCAL_DRAFTS
}

export type LocalDraftActions =
  | { type: LocalDraftActionTypes.REMOVE_LOCAL_DRAFT; id: string }
  | {
      type: LocalDraftActionTypes.ADD_LOCAL_DRAFT;
      item: ILocalDraft;
    }
  | {
      type: LocalDraftActionTypes.LOAD_LOCAL_DRAFTS;
      items: ILocalDraft[];
    };

export const localDraftReducer: React.Reducer<
  ILocalDraft[],
  LocalDraftActions
> = produce((draft: ILocalDraft[], action: LocalDraftActions) => {
  switch (action.type) {
    case LocalDraftActionTypes.ADD_LOCAL_DRAFT:
      draft.push(action.item);
      break;
    case LocalDraftActionTypes.REMOVE_LOCAL_DRAFT:
      const index = draft.findIndex((v) => v.id === action.id);
      draft.splice(index, 1);
      break;
    case LocalDraftActionTypes.LOAD_LOCAL_DRAFTS:
      draft = action.items;
      break;
    default:
      throw new Error("Must specify action type");
  }
});

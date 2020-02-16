import * as Draft from "draft-js";
import produce from "immer";
import { markdownToDraft } from "markdown-draft-js";
import { IEntry } from "../utils/generated";

export enum EditActions {
  UPDATE_TITLE = "UPDATE_TITLE",
  UPDATE_EDITOR = "UPDATE_EDITOR",
  TOGGLE_PUBLIC_STATUS = "TOGGLE_PUBLIC_STATUS",
  SET_INITIAL_FOCUS = "SET_INITIAL_FOCUS",
  EDITOR_COMMAND = "myeditor-save",
  INITIALIZE_EDITOR = "INITIALIZE_EDITOR"
}

export interface IEditorState {
  publicStatus: boolean;
  editorState: Draft.EditorState;
  title: string;
  initialFocus: boolean;
}

export interface IQueryResult {
  entry: IEntry;
}

export interface IQueryVars {
  id: string;
}

const DEFAULT_EDITOR_STATE: IEditorState = {
  editorState: null,
  title: null,
  publicStatus: null,
  initialFocus: false
};

export function initializer(initialData: {
  entry: Pick<IEntry, "title" | "dateAdded" | "content" | "public"> | null;
}): IEditorState {
  console.log("INITIAL DATA EDITOR", initialData);
  if (!!initialData && initialData.entry !== null) {
    const draft = markdownToDraft(initialData.entry.content);
    const editorState = Draft.EditorState.createWithContent(
      Draft.convertFromRaw(draft)
    );

    return {
      editorState,
      title: initialData.entry.title,
      publicStatus: initialData.entry.public,
      initialFocus: false
    };
  } else {
    return DEFAULT_EDITOR_STATE;
  }
}

export type EditorActions =
  | {
      type: EditActions.INITIALIZE_EDITOR;
      payload: Pick<IEntry, "title" | "dateAdded" | "content" | "public">;
    }
  | { type: EditActions.TOGGLE_PUBLIC_STATUS }
  | { type: EditActions.SET_INITIAL_FOCUS }
  | { type: EditActions.UPDATE_EDITOR; payload: Draft.EditorState }
  | { type: EditActions.UPDATE_TITLE; payload: string };

export const reducer = produce((draft: IEditorState, action: EditorActions) => {
  switch (action.type) {
    case EditActions.INITIALIZE_EDITOR: {
      const { title, editorState, publicStatus, initialFocus } = initializer({
        entry: action.payload
      });
      draft.editorState = editorState;
      draft.title = title;
      draft.publicStatus = publicStatus;
      draft.initialFocus = initialFocus;

      break;
    }
    case EditActions.SET_INITIAL_FOCUS: {
      draft.initialFocus = true;
      break;
    }
    case EditActions.TOGGLE_PUBLIC_STATUS: {
      draft.publicStatus = !draft.publicStatus;
      break;
    }
    case EditActions.UPDATE_TITLE: {
      draft.title = action.payload;
      break;
    }
    case EditActions.UPDATE_EDITOR: {
      draft.editorState = action.payload;
      break;
    }
  }
});

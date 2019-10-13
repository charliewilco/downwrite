import * as Draft from "draft-js";
import { markdownToDraft } from "markdown-draft-js";
import { Entry } from "../types/generated";

export enum EditActions {
  UPDATE_TITLE = "UPDATE_TITLE",
  UPDATE_EDITOR = "UPDATE_EDITOR",
  TOGGLE_PUBLIC_STATUS = "TOGGLE_PUBLIC_STATUS",
  SET_INITIAL_FOCUS = "SET_INITIAL_FOCUS",
  EDITOR_COMMAND = "myeditor-save"
}

export interface IEditorState {
  publicStatus: boolean;
  editorState: Draft.EditorState;
  title: string;
  initialFocus: boolean;
}

export interface IQueryResult {
  entry: Entry;
}

export interface IQueryVars {
  id: string;
}

export type EditorActions =
  | { type: EditActions.TOGGLE_PUBLIC_STATUS }
  | { type: EditActions.SET_INITIAL_FOCUS }
  | { type: EditActions.UPDATE_EDITOR; payload: Draft.EditorState }
  | { type: EditActions.UPDATE_TITLE; payload: string };

export function reducer(state: IEditorState, action: EditorActions): IEditorState {
  switch (action.type) {
    case EditActions.SET_INITIAL_FOCUS:
      return { ...state, initialFocus: true };
    case EditActions.TOGGLE_PUBLIC_STATUS:
      return { ...state, publicStatus: !state.publicStatus };
    case EditActions.UPDATE_TITLE:
      return { ...state, title: action.payload };
    case EditActions.UPDATE_EDITOR:
      return { ...state, editorState: action.payload };
    default:
      throw new Error("Must specify type");
  }
}

export function initializer(initialData: { entry: Entry }): IEditorState {
  let editorState = null;

  if (initialData.entry.content) {
    const draft = markdownToDraft(initialData.entry.content);
    editorState = Draft.EditorState.createWithContent(Draft.convertFromRaw(draft));
  }

  return {
    editorState,
    title: initialData.entry.title,
    publicStatus: initialData.entry.public,
    initialFocus: false
  };
}

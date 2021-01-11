import produce from "immer";
import { IEntry } from "../__generated__/client";

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
  title: string;
  initialFocus: boolean;
}

const DEFAULT_EDITOR_STATE: IEditorState = {
  title: "",
  publicStatus: false,
  initialFocus: false
};

export function initializer(initialData?: {
  entry: Pick<IEntry, "title" | "dateAdded" | "content" | "public"> | null;
}): IEditorState {
  if (!!initialData && initialData.entry !== null) {
    return {
      title: initialData.entry.title || "",
      publicStatus: !!initialData.entry.public,
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
  | { type: EditActions.UPDATE_TITLE; payload: string };

export const reducer = produce((draft: IEditorState, action: EditorActions) => {
  switch (action.type) {
    case EditActions.INITIALIZE_EDITOR: {
      const { title, publicStatus, initialFocus } = initializer({
        entry: action.payload
      });
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
  }
});

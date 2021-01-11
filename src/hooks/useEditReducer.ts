import { useReducer } from "react";
import {
  IEditorState,
  EditorActions,
  reducer,
  initializer
} from "../reducers/editor";
import { IEditQuery } from "../__generated__/client";

export function useEditReducer(data?: IEditQuery) {
  return useReducer<
    React.Reducer<IEditorState, EditorActions>,
    IEditQuery | undefined
  >(reducer, data, initializer);
}

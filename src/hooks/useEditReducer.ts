import * as React from "react";
import { IEditQuery } from "../utils/generated";
import {
  IEditorState,
  EditorActions,
  reducer,
  initializer
} from "../reducers/editor";

export function useEditReducer(data: IEditQuery) {
  return React.useReducer<React.Reducer<IEditorState, EditorActions>, IEditQuery>(
    reducer,
    data,
    initializer
  );
}

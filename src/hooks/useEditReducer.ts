import { useReducer } from "react";
import { IEditQuery } from "../utils/generated";
import {
  IEditorState,
  EditorActions,
  reducer,
  initializer
} from "../reducers/editor";

export function useEditReducer(data: IEditQuery) {
  return useReducer<React.Reducer<IEditorState, EditorActions>, IEditQuery>(
    reducer,
    data,
    initializer
  );
}

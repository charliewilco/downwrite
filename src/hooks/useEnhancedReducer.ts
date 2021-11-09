import React, { useReducer } from "react";
import is from "@sindresorhus/is";

type PrevStateFn<T> = (prev: T) => T;
type Callable<T> = Partial<T> | PrevStateFn<T>;

const reducer = <T>(prev: T, action: Callable<T>): T => {
  if (is.function_(action)) {
    return action(prev);
  } else {
    return {
      ...prev,
      ...action
    };
  }
};

export function useEnhancedReducer<T>(initialState: T) {
  return useReducer<React.Reducer<T, Callable<T>>>(reducer, initialState);
}

import React, { useReducer } from "react";

type PrevStateFn<T> = (prev: T) => T;
type Callable<T> = Partial<T> | PrevStateFn<T>;

const reducer = <T>(prev: T, action: Callable<T>): T => {
  if (typeof action === "function") {
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

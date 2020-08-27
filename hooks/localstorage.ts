import * as React from "react";

type Tuple<A, B, C> = [A, B, C];

type WriteLocal<T> = (val: T) => void;
type DeleteLocal = () => void;

export default function useLocalStorage(
  key: string
): Tuple<string, WriteLocal<string>, DeleteLocal> {
  const [localState, updateLocalState] = React.useState<string>(
    localStorage.getItem(key)
  );

  function writeStorage(value: string): void {
    localStorage.setItem(key, value);

    updateLocalState(value);
  }

  function deleteStorage(): void {
    localStorage.removeItem(key);
    updateLocalState("");
  }

  return [localState, updatedValue => writeStorage(updatedValue), deleteStorage];
}

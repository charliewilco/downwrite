import { useState } from "react";

type Tuple<A, B, C> = [A, B, C];

type WriteLocal<T> = (val: T) => void;
type DeleteLocal = () => void;

export function useLocalStorage(
  key: string
): Tuple<string | null, WriteLocal<string>, DeleteLocal> {
  const [localState, updateLocalState] = useState<string | null>(
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

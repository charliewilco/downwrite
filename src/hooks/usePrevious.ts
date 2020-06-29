import { useRef, useEffect, MutableRefObject } from "react";

export function usePrevious<T>(value: T): T | null {
  const ref: MutableRefObject<T | null> = useRef<T>(null);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

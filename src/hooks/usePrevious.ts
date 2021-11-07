import { useRef, useEffect } from "react";

export function usePrevious<T>(value: T): T | null {
  const ref: React.MutableRefObject<T | null> = useRef<T>(null);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

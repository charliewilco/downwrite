import { useEffect } from "react";

type Callback = () => void;

export function useTimeout(interval: number = 500, cb?: Callback): void {
  useEffect(() => {
    if (cb) {
      const t = setTimeout(() => {
        cb();
      }, interval);

      return function cleanup() {
        clearTimeout(t);
      };
    }
  }, [interval, cb]);
}

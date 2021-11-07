import { useRef, useEffect } from "react";
import { useStore } from "@store/provider";

export function useAutosaving(
  duration: number = 5000,
  cb?: (...args: any[]) => void,
  message?: string
) {
  const store = useStore();
  const interval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    interval.current = setInterval(async () => {
      if (cb) {
        store.notifications.add(message || "Autosaving", true);
        cb();
      }
    }, duration);

    return function cleanup() {
      if (interval.current !== null) {
        clearInterval(interval.current);
      }
    };
  }, [message, cb, duration]);
}

import { useRef, useEffect } from "react";
import { useNotifications, NotificationType } from "@reducers/app";

export function useAutosaving(
  duration: number = 5000,
  cb?: (...args: any[]) => void,
  message?: string
) {
  const [, actions] = useNotifications();
  const interval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    interval.current = setInterval(async () => {
      if (cb) {
        actions.addNotification(
          message || "Autosaving",
          NotificationType.DEFAULT,
          true
        );
        cb();
      }
    }, duration);

    return function cleanup() {
      if (interval.current !== null) {
        clearInterval(interval.current);
      }
    };
  }, [actions, message, cb, duration]);
}

import * as React from "react";
import { useUINotifications, NotificationType } from "../reducers/notifications";

export function useAutosaving(
  duration: number = 5000,
  cb?: (...args: any[]) => void,
  message?: string
) {
  const [, actions] = useUINotifications();
  const interval = React.useRef<NodeJS.Timeout>();

  React.useEffect(() => {
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
      clearInterval(interval.current);
    };
  }, [actions, message, cb, duration]);
}

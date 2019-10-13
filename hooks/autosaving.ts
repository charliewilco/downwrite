import * as React from "react";
import { useUINotifications, NotificationType } from "../reducers/notifications";

export default function useAutosaving(
  duration: number,
  cb?: (...args: any[]) => void,
  message?: string
) {
  const { actions } = useUINotifications();

  duration = duration || 5000;

  let interval: NodeJS.Timeout;

  React.useEffect(() => {
    interval = setInterval(async () => {
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
      clearInterval(interval);
    };
  }, []);
}

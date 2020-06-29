import { useState, useEffect } from "react";
import { useUINotifications, NotificationType } from "../reducers/notifications";
import { __IS_BROWSER__ } from "../utils/dev";

export function useOffline(debug = false): boolean {
  const [isOffline, setIsOffline] = useState<boolean>(debug);
  const [, { addNotification }] = useUINotifications();

  function handleChange(event: Event) {
    __IS_BROWSER__ &&
      setIsOffline(!(event.currentTarget as Window).navigator.onLine);
  }

  useEffect(() => {
    if (__IS_BROWSER__) {
      if (!debug) {
        window.addEventListener("offline", handleChange);
        window.addEventListener("online", handleChange);
      }

      return () => {
        if (!debug) {
          window.removeEventListener("offline", handleChange);
          window.removeEventListener("online", handleChange);
        }
      };
    }
  }, [debug]);

  useEffect(() => {
    if (isOffline) {
      addNotification("Your network is currently offline", NotificationType.WARNING);
    }
  }, [isOffline, addNotification]);

  return isOffline;
}

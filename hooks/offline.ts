import * as React from "react";
import { useUINotifications, NotificationType } from "../reducers/notifications";
import { __IS_BROWSER__ } from "../utils/dev";

export default function useOffline(debug: boolean = false): boolean {
  if (__IS_BROWSER__) {
    const [isOffline, setIsOffline] = React.useState<boolean>(debug);
    const { actions } = useUINotifications();

    function handleChange(event: Event) {
      setIsOffline(!(event.currentTarget as Window).navigator.onLine);
    }

    React.useEffect(() => {
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
    }, []);

    React.useEffect(() => {
      if (isOffline) {
        actions.addNotification(
          "Your network is currently offline",
          NotificationType.WARNING
        );
      }
    }, [isOffline]);

    return isOffline;
  } else {
    return false;
  }
}

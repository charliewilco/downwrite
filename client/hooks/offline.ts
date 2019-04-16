import * as React from "react";

export default function useOffline() {
  const [isOffline, setIsOffline] = React.useState<boolean>(false);

  function handleChange(event: Event) {
    setIsOffline(!(event.currentTarget as Window).navigator.onLine);
  }

  React.useEffect(() => {
    if (typeof window === undefined) {
      window.addEventListener("offline", handleChange);
      window.addEventListener("online", handleChange);
    }

    return () => {
      if (typeof window === undefined) {
        window.removeEventListener("offline", handleChange);
        window.removeEventListener("online", handleChange);
      }
    };
  }, []);

  return isOffline;
}

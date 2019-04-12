import * as React from "react";

export interface OfflineContext {
  offline: boolean;
}

interface IOfflineListenerProps {
  children: React.ReactNode;
}

export const Offline = React.createContext<OfflineContext>({
  offline: !window.navigator.onLine
});

export function useOffline() {
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

export default function OfflineListener(props: IOfflineListenerProps): JSX.Element {
  const offline = useOffline();

  return <Offline.Provider value={{ offline }}>{props.children}</Offline.Provider>;
}

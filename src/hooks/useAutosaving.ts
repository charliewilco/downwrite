import { useDataSource } from "@store/provider";
import { useInterval } from ".";

export function useAutosaving(
  duration: number = 5000,
  cb?: (...args: any[]) => void,
  message?: string
) {
  const store = useDataSource();

  useInterval(duration, () => {
    if (cb) {
      store.notifications.add(message || "Autosaving", true);
      cb();
    }
  });
}

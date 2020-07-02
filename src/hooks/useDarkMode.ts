import { useEffect } from "react";
import { useSettings } from "../reducers/app-state";

export enum DarkModeVals {
  NIGHT_MODE = "NightMode",
  NIGHT_MODE_OFF = "NIGHT_MODE_OFF",
  NIGHT_MODE_ON = "NIGHT_MODE_ON"
}

export function useDarkModeEffect(className: string): void {
  const [night, { toggleDarkMode }] = useSettings();

  useEffect(() => {
    if (typeof window !== undefined) {
      const local = localStorage.getItem(DarkModeVals.NIGHT_MODE);

      if (local !== DarkModeVals.NIGHT_MODE_OFF) {
        toggleDarkMode(true);
      }
    }
  }, []);

  useEffect(() => {
    if (document.body instanceof HTMLElement) {
      localStorage.setItem(
        DarkModeVals.NIGHT_MODE,
        night ? DarkModeVals.NIGHT_MODE_ON : DarkModeVals.NIGHT_MODE_OFF
      );

      night
        ? document.body.classList.add(className)
        : document.body.classList.remove(className);
    }

    return function cleanup() {
      if (document.body) {
        document.body.classList.remove(className);
      }
    };
  }, [night, className]);
}

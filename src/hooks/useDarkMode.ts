import { useState, useEffect } from "react";

export enum DarkModeVals {
  NIGHT_MODE = "NightMode",
  NIGHT_MODE_OFF = "NIGHT_MODE_OFF",
  NIGHT_MODE_ON = "NIGHT_MODE_ON"
}

interface IDarkModeState {
  darkMode: boolean;
}

enum DarkModeAction {
  SET_DARK_MODE_FROM_LOCAL = "SET_DARK_MODE_FROM_LOCAL",
  TURN_ON_DARK_MODE = "DARK_MODE_ON",
  TURN_OFF_DARK_MODE = "DARK_MODE_OFF"
}

interface IDarkModeAction {
  type: DarkModeAction;
  payload?: {
    local: boolean;
  };
}

export function darkModeReducer(
  state: IDarkModeState,
  action: IDarkModeAction
): IDarkModeState {
  switch (action.type) {
    case DarkModeAction.TURN_ON_DARK_MODE:
      return { darkMode: true };
    case DarkModeAction.TURN_OFF_DARK_MODE:
      return { darkMode: false };
    case DarkModeAction.SET_DARK_MODE_FROM_LOCAL:
      return { darkMode: action.payload.local };
    default:
      break;
  }
}

export function useDarkModeEffect(className: string): [boolean, () => void] {
  const [night, setNight] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== undefined) {
      const local = localStorage.getItem(DarkModeVals.NIGHT_MODE);

      if (local !== DarkModeVals.NIGHT_MODE_OFF) {
        setNight(true);
      }
    }
  }, []);

  useEffect(
    function() {
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
    },
    [night, className]
  );

  function onChange(): void {
    setNight(prev => !prev);
  }

  return [night, onChange];
}

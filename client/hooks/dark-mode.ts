import * as React from "react";

export enum DarkModeVals {
  NIGHT_MODE = "NightMode",
  NIGHT_MODE_OFF = "NIGHT_MODE_OFF",
  NIGHT_MODE_ON = "NIGHT_MODE_ON"
}

export default function useDarkModeEffect(className: string): [boolean, () => void] {
  const [night, setNight] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (typeof window !== undefined) {
      const local = localStorage.getItem(DarkModeVals.NIGHT_MODE);

      if (local !== DarkModeVals.NIGHT_MODE_OFF) {
        setNight(true);
      }
    }
  }, []);

  React.useEffect(
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
    [night]
  );

  function onChange(): void {
    setNight(prev => !prev);
  }

  return [night, onChange];
}

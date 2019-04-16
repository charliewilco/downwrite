import * as React from "react";

const NIGHT_MODE: string = "NightMode";
const NIGHT_MODE_OFF: string = "NIGHT_MODE_OFF";
const NIGHT_MODE_ON: string = "NIGHT_MODE_ON";

export default function useDarkModeEffect(className: string): [boolean, () => void] {
  const [night, setNight] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (typeof window !== undefined) {
      const local = localStorage.getItem(NIGHT_MODE);

      if (local !== NIGHT_MODE_OFF) {
        setNight(true);
      }
    }
  }, []);

  React.useEffect(
    function() {
      if (document.body instanceof HTMLElement) {
        localStorage.setItem(NIGHT_MODE, night ? NIGHT_MODE_ON : NIGHT_MODE_OFF);

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

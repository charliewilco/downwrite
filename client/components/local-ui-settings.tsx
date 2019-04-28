import * as React from "react";
import * as DefaultStyles from "../utils/defaultStyles";

export interface ILocalUISettings {
  monospace: string;
  actions: {
    updateFont: (font: string) => void;
  };
}

export const LocalUISettings = React.createContext({
  monospace: "",
  actions: {}
} as ILocalUISettings);

interface ILocalSettingsProps {
  children: React.ReactNode;
}

function useLocalUISettings(): ILocalUISettings {
  const [monospace, updateFont] = React.useState<string>(
    DefaultStyles.Fonts.monospace
  );

  React.useEffect(() => {
    if (typeof window !== undefined) {
      const local = localStorage.getItem("DW_EDITOR_FONT");
      if (local) {
        updateFont([`${local},`, monospace].join(" "));
      }
    }
  }, []);

  function getUIContext() {
    return {
      monospace,
      actions: {
        updateFont
      }
    };
  }

  return React.useMemo<ILocalUISettings>(() => getUIContext(), [monospace]);
}

export function LocalUISettingsProvider({
  children
}: ILocalSettingsProps): JSX.Element {
  const value = useLocalUISettings();
  return React.createElement(LocalUISettings.Provider, { value }, children);
}

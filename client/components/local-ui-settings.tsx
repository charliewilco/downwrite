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

export const LocalUISettingsProvider: React.FC<{}> = function(props) {
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

  return (
    <LocalUISettings.Provider
      value={{
        monospace,
        actions: {
          updateFont
        }
      }}>
      {props.children}
    </LocalUISettings.Provider>
  );
};

export const LocalUISettingsConsumer = LocalUISettings.Consumer;

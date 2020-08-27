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

interface ILocalUISettingsState {
  monospace: string;
}

export enum SettingsAction {
  UPDATE_FONT = "UPDATE_FONT"
}

interface ILocalUISettingsAction {
  type: SettingsAction;
  payload: {
    font?: string;
  };
}

function localSettingsReducer(
  state: ILocalUISettingsState,
  action: ILocalUISettingsAction
): ILocalUISettingsState {
  switch (action.type) {
    case SettingsAction.UPDATE_FONT:
      return { monospace: action.payload.font };
    default:
      throw new Error("Must provide an action.type");
  }
}

function useLocalUISettings(): ILocalUISettings {
  const [state, dispatch] = React.useReducer(localSettingsReducer, {
    monospace: DefaultStyles.Fonts.monospace
  });

  React.useEffect(() => {
    if (typeof window !== undefined) {
      const local = localStorage.getItem("DW_EDITOR_FONT");
      if (local) {
        dispatch({
          type: SettingsAction.UPDATE_FONT,
          payload: {
            font: [`${local},`, state.monospace].join(" ")
          }
        });
      }
    }
  }, []);

  function getUIContext(): ILocalUISettings {
    return {
      ...state,
      actions: {
        updateFont: (font: string): void => {
          dispatch({
            type: SettingsAction.UPDATE_FONT,
            payload: {
              font
            }
          });
        }
      }
    };
  }

  return React.useMemo<ILocalUISettings>(() => getUIContext(), [state]);
}

export function LocalUISettingsProvider({
  children
}: ILocalSettingsProps): JSX.Element {
  const value = useLocalUISettings();
  return React.createElement(LocalUISettings.Provider, { value }, children);
}

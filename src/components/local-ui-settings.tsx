import { createContext, useReducer, useEffect } from "react";
import * as DefaultStyles from "../utils/default-styles";

export interface ILocalUISettings {
  monospace: string;
  actions: {
    updateFont: (font: string) => void;
  };
}

export const LocalUISettings = createContext<ILocalUISettings>({
  monospace: "Operator Mono",
  actions: {
    updateFont() {}
  }
});

interface ILocalSettingsProps extends React.PropsWithChildren<{}> {}

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
  _: ILocalUISettingsState,
  action: ILocalUISettingsAction
): ILocalUISettingsState {
  switch (action.type) {
    case SettingsAction.UPDATE_FONT:
      return { monospace: action.payload.font! };
    default:
      throw new Error("Must provide an action.type");
  }
}

function useLocalUISettings(): ILocalUISettings {
  const [state, dispatch] = useReducer(localSettingsReducer, {
    monospace: DefaultStyles.Fonts.monospace
  });

  useEffect(() => {
    const local = localStorage.getItem("DW_EDITOR_FONT");
    if (local) {
      dispatch({
        type: SettingsAction.UPDATE_FONT,
        payload: {
          font: [`${local},`, state.monospace].join(" ")
        }
      });
    }
  }, [state.monospace]);

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

export function LocalUISettingsProvider({
  children
}: ILocalSettingsProps): JSX.Element {
  const value = useLocalUISettings();
  return (
    <LocalUISettings.Provider value={value}>{children}</LocalUISettings.Provider>
  );
}

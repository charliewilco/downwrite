import {
  createContext,
  Dispatch,
  PropsWithChildren,
  createElement,
  useReducer,
  useContext,
  useCallback
} from "react";
import produce from "immer";
import { Fonts } from "@utils/default-styles";

import { v4 as uuid } from "uuid";

export enum NotificationType {
  DEFAULT = "DEFAULT",
  ERROR = "ERROR",
  WARNING = "WARNING"
}

export class UINotificationMessage {
  public id: string = uuid();
  public text: string;
  public dateAdded: number = Date.now();
  public type: NotificationType;
  public dismissable: boolean;
  constructor(text: string, type?: NotificationType, dismissable?: boolean) {
    this.text = text;
    this.type = type || NotificationType.DEFAULT;
    this.dismissable = dismissable || false;
  }
}
export type Notifications = UINotificationMessage[];

export interface ISettings {
  isDarkMode: boolean;
  fileExtension: string;
  editorFont: string;
}

export interface ICurrentUserState {
  username?: string;
  id?: string;
}

export interface IAppState {
  settings: ISettings;
  me: ICurrentUserState;
  notifications: Notifications;
}

export interface IInitialState {
  userId: string;
  username: string;
}

export const initialState: IAppState = {
  settings: {
    isDarkMode: true,
    fileExtension: ".md",
    editorFont: Fonts.monospace
  },
  me: {
    username: "",
    id: ""
  },
  notifications: []
};

enum AppActions {
  REMOVE_NOTIFICATION = "REMOVE_NOTIFICATION",
  ADD_NOTIFICATION = "ADD_NOTIFICATION",
  SORT_NOTIFICATIONS = "SORT_NOTIFICATIONS",
  SIGN_IN = "SIGN_IN",
  SIGN_OUT = "SIGN_OUT",
  SET_DARK_MODE = "SET_DARK_MODE",
  SET_FILE_EXTENSION = "SET_FILE_EXTENSION",
  SET_EDITOR_FONT = "SET_EDITOR_FONT"
}

type ReducerActions =
  | {
      type: AppActions.ADD_NOTIFICATION;
      payload: {
        text: string;
        type?: NotificationType;
        dismissable?: boolean;
      };
    }
  | {
      type: AppActions.REMOVE_NOTIFICATION;
      payload: UINotificationMessage;
    }
  | {
      type: AppActions.SIGN_IN;
      username: string;
      id: string;
    }
  | {
      type: AppActions.SIGN_OUT;
    }
  | {
      type: AppActions.SET_DARK_MODE;
      mode?: boolean;
    }
  | {
      type: AppActions.SET_EDITOR_FONT;
      fontName: string;
    }
  | {
      type: AppActions.SET_FILE_EXTENSION;
      extension: string;
    };

const reducer: React.Reducer<IAppState, ReducerActions> = produce<
  (d: IAppState, a: ReducerActions) => void
>((draft, action) => {
  switch (action.type) {
    case AppActions.ADD_NOTIFICATION: {
      draft.notifications.unshift(
        new UINotificationMessage(
          action.payload.text,
          action.payload.type,
          action.payload.dismissable
        )
      );
      break;
    }
    case AppActions.REMOVE_NOTIFICATION: {
      const i = draft.notifications.findIndex(n => n.id === action.payload.id);
      draft.notifications.splice(i, 1);
      break;
    }
    case AppActions.SIGN_IN: {
      draft.me.id = action.id;
      draft.me.username = action.username;
      break;
    }
    case AppActions.SIGN_OUT: {
      draft.me.id = undefined;
      draft.me.username = undefined;
      break;
    }
    case AppActions.SET_DARK_MODE: {
      draft.settings.isDarkMode = action.mode || !draft.settings.isDarkMode;
      break;
    }
    case AppActions.SET_EDITOR_FONT: {
      draft.settings.editorFont = action.fontName;
      break;
    }
    case AppActions.SET_FILE_EXTENSION: {
      draft.settings.fileExtension = action.extension;
      break;
    }
    default:
      throw new Error("Must specify an action type");
  }
});

const AppContext = createContext<[IAppState, Dispatch<ReducerActions>]>([
  initialState,
  () => {}
]);

export function AppProvider(props: PropsWithChildren<{}>) {
  const value = useReducer(reducer, initialState);
  return createElement(AppContext.Provider, { value }, props.children);
}

export function useSettings() {
  const [state, dispatch] = useContext(AppContext);

  const toggleDarkMode = useCallback(
    (mode?: boolean) => {
      dispatch({ type: AppActions.SET_DARK_MODE, mode });
    },
    [dispatch]
  );

  const updateFileExtension = useCallback(
    (extension: string) => {
      dispatch({ type: AppActions.SET_FILE_EXTENSION, extension });
    },
    [dispatch]
  );

  const updateEditorFont = useCallback((fontName: string) => {
    dispatch({ type: AppActions.SET_EDITOR_FONT, fontName });
  }, []);

  return [
    state.settings,
    {
      toggleDarkMode,
      updateEditorFont,
      updateFileExtension
    }
  ] as const;
}

export function useNotifications() {
  const [state, dispatch] = useContext(AppContext);
  const addNotification = useCallback(
    (text: string, type?: NotificationType, dismissable?: boolean) => {
      dispatch({
        type: AppActions.ADD_NOTIFICATION,
        payload: {
          text,
          type,
          dismissable
        }
      });
    },
    [dispatch]
  );

  const removeNotification = useCallback((n: UINotificationMessage) => {
    dispatch({ type: AppActions.REMOVE_NOTIFICATION, payload: n });
  }, []);

  return [
    state.notifications,
    {
      addNotification,
      removeNotification
    }
  ] as const;
}

export function useCurrentUser() {
  const [state, dispatch] = useContext(AppContext);
  const onCurrentUserLogout = useCallback(() => {
    dispatch({ type: AppActions.SIGN_OUT });
  }, [dispatch]);

  const onCurrentUserLogin = useCallback((username: string, id: string) => {
    dispatch({ type: AppActions.SIGN_IN, username, id });
  }, []);

  return [
    { ...state.me, authed: !!state.me.username && !!state.me.id },
    {
      onCurrentUserLogin,
      onCurrentUserLogout
    }
  ] as const;
}

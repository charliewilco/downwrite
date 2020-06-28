import { UINotificationMessage } from "./notifications";
import { atom } from "recoil";
import { createStore } from "redux";
import produce from "immer";

export interface ISettings {
  isDarkMode: boolean;
  fileExtension: string;
  editorFont: string;
}

type Notifications = UINotificationMessage[];

export interface IAppState {
  me: {
    username: string;
    emailAddress: string;
  };
  notifications: Notifications;
  settings: ISettings;
  headerStyle: UIHeader;
}

enum UIHeader {}

export const notificationState = atom<Notifications>({
  key: "notifications",
  default: []
});

export const settingState = atom<ISettings>({
  key: "",
  default: {
    isDarkMode: true,
    fileExtension: ".md",
    editorFont: "Operator Mono"
  }
});

enum StoreActions {
  ADD_NOTIFICATION = "ADD_NOTIFICATION",
  REMOVE_NOTIFICATION = "REMOVE_NOTIFICATION",
  SORT_NOTIFICATIONS = "SORT_NOTIFICATIONS",
  ADD_ME = "ADD ME",
  UPDATE_SETTINGS = "UPDATE_SETTINGS"
}

const reducer = produce<(s: IAppState, action: { type: StoreActions }) => void>(
  (draft, action) => {
    switch (action.type) {
      case StoreActions.ADD_NOTIFICATION:
        draft.notifications;

        break;

      default:
        break;
    }
  }
);

export const store = createStore(reducer);

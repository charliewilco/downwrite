import { UINotificationMessage } from "./notifications";
import { atom, MutableSnapshot } from "recoil";
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

export const notificationsAtom = atom<Notifications>({
  key: "notifications",
  default: []
});

export const settingsAtom = atom<ISettings>({
  key: "settings",
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

export function initializeState(m: MutableSnapshot) {
  m.set(notificationsAtom, [new UINotificationMessage("Something")]);
}

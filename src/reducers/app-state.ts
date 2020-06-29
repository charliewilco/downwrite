import { UINotificationMessage } from "./notifications";
import { atom, MutableSnapshot } from "recoil";

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

export function initializeState(m: MutableSnapshot) {
  m.set(notificationsAtom, [new UINotificationMessage("Something")]);
}

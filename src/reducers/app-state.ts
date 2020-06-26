import { UINotificationMessage } from "./notifications";
import { atom } from "recoil";

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
}

const notificationState = atom<Notifications>({
  key: "notifications",
  default: []
});

const settingState = atom<ISettings>({
  key: "",
  default: {
    isDarkMode: true,
    fileExtension: ".md",
    editorFont: "Operator Mono"
  }
});

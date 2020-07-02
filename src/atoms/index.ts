import { MutableSnapshot } from "recoil";
import {
  UINotificationMessage,
  Notifications,
  NotificationType,
  notificationsAtom,
  useNotifications
} from "./notifications";
import { ISettings, settingsAtom, useSettings } from "./settings";

export interface IAppState {
  me: {
    username: string;
    emailAddress: string;
  };
  notifications: Notifications;
  settings: ISettings;
}

export function initializeState(m: MutableSnapshot) {
  m.set(notificationsAtom, [new UINotificationMessage("Something")]);
  m.set(settingsAtom, {
    isDarkMode: true,
    fileExtension: ".md",
    editorFont: "Operator Mono"
  });
}

export { useNotifications, useSettings, UINotificationMessage, NotificationType };

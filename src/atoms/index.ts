import { useCallback } from "react";
import { MutableSnapshot } from "recoil";
import {
  UINotificationMessage,
  Notifications,
  NotificationType,
  notificationsAtom,
  useNotifications
} from "./notifications";
import { ISettings, settingsAtom, useSettings } from "./settings";
import * as DefaultStyles from "../utils/default-styles";

export interface IAppState {
  me: {
    username: string;
    emailAddress: string;
  };
  notifications: Notifications;
  settings: ISettings;
}

export function initializeState(m: MutableSnapshot) {
  m.set(notificationsAtom, [
    new UINotificationMessage("Something", NotificationType.WARNING, true)
  ]);
  m.set(settingsAtom, {
    isDarkMode: true,
    fileExtension: ".md",
    editorFont: DefaultStyles.Fonts.monospace
  });
}

export function useInitialRecoilSnapshot(initialState: any) {
  return useCallback(() => {
    return function initializeState(m: MutableSnapshot) {
      m.set(notificationsAtom, [
        new UINotificationMessage("Something", NotificationType.WARNING, true)
      ]);
      m.set(settingsAtom, {
        isDarkMode: true,
        fileExtension: ".md",
        editorFont: DefaultStyles.Fonts.monospace
      });
    };
  }, [initialState]);
}

export { useNotifications, useSettings, UINotificationMessage, NotificationType };
import {
  UINotificationMessage,
  NotificationType,
  NotificationUI
} from "./notifications";
import { atom, MutableSnapshot, useRecoilState } from "recoil";
import produce from "immer";
import { useCallback } from "react";

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

export const notificationsAtom = atom<Notifications>({
  key: "notifications",
  default: []
});

export function useNotifications(): NotificationUI {
  const [notifications, setNotifications] = useRecoilState(notificationsAtom);

  const addNotification = useCallback(
    (text: string, type?: NotificationType, dismissable?: boolean) => {
      setNotifications(
        produce<(n: Notifications) => void>(draft => {
          draft.unshift(new UINotificationMessage(text, type, dismissable));
        })
      );
    },
    []
  );

  const removeNotification = useCallback((n: UINotificationMessage) => {
    setNotifications(
      produce<(n: Notifications) => void>(draft => {
        const i = draft.findIndex(current => current.id === n.id);
        draft.splice(i, 1);
      })
    );
  }, []);

  return [
    notifications,
    {
      addNotification,
      removeNotification
    }
  ];
}

export const settingsAtom = atom<ISettings>({
  key: "settings",
  default: {
    isDarkMode: true,
    fileExtension: ".md",
    editorFont: "Operator Mono"
  }
});

export function useSettings() {
  const [settings, setSettings] = useRecoilState(settingsAtom);

  const toggleDarkMode = useCallback((mode?: boolean) => {
    setSettings(
      produce<(s: ISettings) => void>(draft => {
        draft.isDarkMode = mode || !draft.isDarkMode;
      })
    );
  }, []);

  const updateFileExtension = useCallback((extension: string) => {
    setSettings(settings => ({ ...settings, fileExtension: extension }));
  }, []);

  const updateEditorFont = useCallback((fontName: string) => {
    setSettings(settings => ({ ...settings, editorFont: fontName }));
  }, []);

  return [
    settings,
    {
      toggleDarkMode,
      updateEditorFont,
      updateFileExtension
    }
  ] as const;
}

export function initializeState(m: MutableSnapshot) {
  m.set(notificationsAtom, [new UINotificationMessage("Something")]);
  m.set(settingsAtom, {
    isDarkMode: true,
    fileExtension: ".md",
    editorFont: "Operator Mono"
  });
}

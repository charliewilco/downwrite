import { atom, useRecoilState } from "recoil";
import produce from "immer";
import { useCallback } from "react";
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

interface INotificationActions {
  addNotification: (m: string, t?: NotificationType, d?: boolean) => void;
  removeNotification: (m: UINotificationMessage) => void;
}

export type Notifications = UINotificationMessage[];

export type NotificationUI = [Notifications, INotificationActions];

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

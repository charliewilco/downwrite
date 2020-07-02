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

export type NotificationUI = [UINotificationMessage[], INotificationActions];

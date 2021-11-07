import cuid from "cuid";
import { makeAutoObservable } from "mobx";

export enum NotificationType {
  DEFAULT = "DEFAULT",
  ERROR = "ERROR",
  WARNING = "WARNING"
}

export class UINotificationMessage {
  public id: string = cuid();
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

export class Notifications {
  list: UINotificationMessage[] = [];
  constructor() {
    makeAutoObservable(this);
  }

  getAll() {
    return this.list;
  }

  private _add(text: string, variant?: NotificationType, dismissable?: boolean) {
    this.list.unshift(new UINotificationMessage(text, variant, dismissable));
  }

  warn(text: string, dismissable?: boolean) {
    this._add(text, NotificationType.WARNING, dismissable);
  }

  error(text: string, dismissable?: boolean) {
    this._add(text, NotificationType.ERROR, dismissable);
  }

  add(text: string, dismissable?: boolean) {
    this._add(text, NotificationType.DEFAULT, dismissable);
  }

  remove(selected: UINotificationMessage) {
    const index = this.list.findIndex((n) => n.id === selected.id);

    if (index > -1) {
      this.list.splice(index, 1);
    }
  }
}

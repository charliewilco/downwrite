import * as React from "react";
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

export enum NotificationActions {
  REMOVE_NOTIFICATION = "REMOVE_NOTIFICATION",
  ADD_NOTIFICATION = "ADD_NOTIFICATION",
  SORT_NOTIFICATIONS = "SORT_NOTIFICATIONS"
}

export interface INoticationAction {
  type: NotificationActions;
  payload?: {
    text?: string;
    type?: NotificationType;
    dismissable?: boolean;
    selected?: UINotificationMessage;
  };
}

export interface INotificationState {
  notifications: UINotificationMessage[];
}

function addNotification(
  state: INotificationState,
  text: string,
  type?: NotificationType,
  dismissable?: boolean
): INotificationState {
  const notifications = [
    new UINotificationMessage(text, type, dismissable),
    ...state.notifications
  ].sort();
  return {
    notifications
  };
}

function removeNotifications(
  state: INotificationState,
  selected: UINotificationMessage
): INotificationState {
  const notifications = state.notifications.filter((t) => t.id !== selected.id && t);
  return {
    notifications
  };
}

export function reducer(
  state: INotificationState,
  action: INoticationAction
): INotificationState {
  switch (action.type) {
    case NotificationActions.ADD_NOTIFICATION:
      return addNotification(
        state,
        action.payload.text,
        action.payload.type,
        action.payload.dismissable
      );
    case NotificationActions.REMOVE_NOTIFICATION:
      return removeNotifications(state, action.payload.selected);
    default:
      throw new Error();
  }
}

export function init(
  notifications: UINotificationMessage[] | []
): INotificationState {
  return {
    notifications
  };
}

interface INotificationActions {
  add: (m: string, t?: NotificationType, d?: boolean) => void;
  remove: (m: UINotificationMessage) => void;
}

export interface INotificationContext extends INotificationState {
  actions: INotificationActions;
}

export const NotificationContext = React.createContext<INotificationContext>(
  {} as INotificationContext
);

export function useUINotificationsProvider(): INotificationContext {
  const [state, dispatch] = React.useReducer<
    React.Reducer<INotificationState, INoticationAction>
  >(reducer, {
    notifications: []
  });

  function add(text: string, type?: NotificationType, dismissable?: boolean): void {
    dispatch({
      type: NotificationActions.ADD_NOTIFICATION,
      payload: {
        text,
        type,
        dismissable
      }
    });
  }

  function remove(selected: UINotificationMessage): void {
    dispatch({
      type: NotificationActions.REMOVE_NOTIFICATION,
      payload: {
        selected
      }
    });
  }

  return {
    notifications: state.notifications,
    actions: {
      add,
      remove
    }
  };
}

export function useUINotifications(): INotificationContext {
  const notifications = React.useContext<INotificationContext>(NotificationContext);

  return notifications;
}

interface INotificationProps {
  children: React.ReactNode;
}

export function NotificationProvider(props: INotificationProps): JSX.Element {
  const value = useUINotificationsProvider();
  return React.createElement(
    NotificationContext.Provider,
    { value },
    props.children
  );
}

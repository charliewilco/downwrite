import * as React from "react";
import uuid from "uuid/v4";

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

type NotificationActionType =
  | {
      type: NotificationActions.ADD_NOTIFICATION;
      payload: {
        text: string;
        type: NotificationType;
        dismissable: boolean;
      };
    }
  | {
      type: NotificationActions.REMOVE_NOTIFICATION;
      payload: UINotificationMessage;
    };

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
  const notifications = state.notifications.filter(t => t.id !== selected.id && t);
  return {
    notifications
  };
}

export function reducer(
  state: INotificationState,
  action: NotificationActionType
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
      return removeNotifications(state, action.payload);
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
  addNotification: (m: string, t?: NotificationType, d?: boolean) => void;
  removeNotification: (m: UINotificationMessage) => void;
}

export type NotificationContext = [INotificationState, INotificationActions];

export const NotificationContext = React.createContext<NotificationContext>([
  { notifications: [] },
  {}
] as NotificationContext);

export function useUINotificationsProvider(): NotificationContext {
  const [state, dispatch] = React.useReducer<
    React.Reducer<INotificationState, NotificationActionType>
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
      payload: selected
    });
  }

  return [
    state,
    {
      addNotification: add,
      removeNotification: remove
    }
  ];
}

export function useUINotifications(): NotificationContext {
  const notifications = React.useContext<NotificationContext>(NotificationContext);

  return notifications;
}

interface INotificationProps extends React.PropsWithChildren<{}> {}

export function NotificationProvider(props: INotificationProps): JSX.Element {
  const value = useUINotificationsProvider();
  return React.createElement(
    NotificationContext.Provider,
    { value },
    props.children
  );
}

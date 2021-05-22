import {
  useCallback,
  useReducer,
  createContext,
  createElement,
  Reducer
} from "react";
import produce from "immer";
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

type NoticationAction =
  | {
      type: NotificationActions.REMOVE_NOTIFICATION;
      selected: UINotificationMessage;
    }
  | {
      type: NotificationActions.ADD_NOTIFICATION;
      text: string;
      variant: NotificationType;
      dismissable: boolean;
    };

export interface INotificationState {
  notifications: UINotificationMessage[];
}

export const notificationReducer = produce(
  (state: INotificationState, action: NoticationAction) => {
    switch (action.type) {
      case NotificationActions.ADD_NOTIFICATION:
        state.notifications.unshift(
          new UINotificationMessage(action.text, action.variant, action.dismissable)
        );

        break;
      case NotificationActions.REMOVE_NOTIFICATION:
        const i = state.notifications.findIndex(
          ({ id }) => action.selected.id === id
        );

        if (i > -1) {
          state.notifications.splice(i, 1);
        }
        break;
      default:
        throw new Error();
    }
  }
);

interface INotificationActions {
  add: (m: string, t?: NotificationType, d?: boolean) => void;
  remove: (m: UINotificationMessage) => void;
}

export interface INotificationContext extends INotificationState {
  actions: INotificationActions;
}

export const NotificationContext = createContext<INotificationContext>(
  {} as INotificationContext
);

interface INotificationProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: INotificationProps): JSX.Element {
  const [{ notifications }, dispatch] = useReducer<
    Reducer<INotificationState, NoticationAction>
  >(notificationReducer, {
    notifications: []
  });

  const remove = useCallback(
    (selected: UINotificationMessage) =>
      dispatch({
        type: NotificationActions.REMOVE_NOTIFICATION,

        selected
      }),
    [dispatch]
  );

  const add = useCallback(
    (text: string, variant?: NotificationType, dismissable?: boolean): void => {
      dispatch({
        type: NotificationActions.ADD_NOTIFICATION,
        text,
        variant,
        dismissable
      });
    },
    [dispatch]
  );

  return createElement(
    NotificationContext.Provider,
    {
      value: { notifications, actions: { add, remove } }
    },
    children
  );
}

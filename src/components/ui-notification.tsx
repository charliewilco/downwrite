import * as React from "react";
import {
  useTransition,
  animated,
  UseTransitionResult,
  UseTransitionProps,
  SpringConfig
} from "react-spring";
import {
  UINotificationMessage,
  NotificationType,
  useUINotifications
} from "../reducers/notifications";
import useTimeout from "../hooks/timeout";

type Merge<A, B> = { [K in keyof A]: K extends keyof B ? B[K] : A[K] } & B;

function getTypeClassName(
  notification: UINotificationMessage,
  defaultName: string = ""
): string {
  const type: string =
    notification.type && notification.type === NotificationType.WARNING
      ? "warning"
      : notification.type === NotificationType.ERROR
      ? "error"
      : "default";

  return [defaultName, type].join(" ");
}

interface IUIMessageProps {
  notification: UINotificationMessage;
  onDismiss(m: UINotificationMessage): void;
}

export function UIMessage(props: IUIMessageProps): JSX.Element {
  const className = getTypeClassName(props.notification, "UINotification");

  const onRemove = () => props.onDismiss(props.notification);

  if (props.notification.dismissable) {
    useTimeout(15000, onRemove);
  }

  return (
    <div className={className}>
      <div className="UINotification__content">
        <p>
          {props.notification.type !== NotificationType.DEFAULT && (
            <b>{props.notification.type} </b>
          )}
          {props.notification.text}
        </p>
      </div>
      {!props.notification.dismissable && (
        <button onClick={onRemove}>Dismiss</button>
      )}
    </div>
  );
}

const config: SpringConfig = { tension: 125, friction: 20, precision: 0.1 };
const altConfig: SpringConfig = Object.assign({}, config, { duration: 350 });
// [altConfig, config, config]

interface ITransition {
  opacity: number;
  transform: string;
  height: number;
  life?: string;
}

export function MessageList() {
  const { notifications, actions } = useUINotifications();
  const transitions: ReadonlyArray<UseTransitionResult<
    UINotificationMessage,
    ITransition
  >> = useTransition<UINotificationMessage, ITransition>(
    notifications,
    item => item.id,
    {
      from: {
        opacity: 0,
        transform: "translate3d(0, -100%, 0) scale(1)",
        height: 56
      },
      enter: {
        opacity: 1,
        transform: "translate3d(0, 0, 0) scale(1)",
        height: 56
      },
      leave: {
        opacity: 0,
        transform: "translate3d(0, -100%, 0) scale(0)",
        height: 0
      },
      config: (item: UINotificationMessage, state: string) =>
        state === "leave" ? [altConfig, config, config] : config
    } as Merge<
      ITransition & React.CSSProperties,
      UseTransitionProps<UINotificationMessage, ITransition>
    >
  );

  return (
    <div className="UINotificationContainer">
      <div className="UINotificationContainerInner">
        {transitions.map(({ item, props: { life, ...style } }) => (
          <animated.div style={{ ...style, marginBottom: 8 }} key={item.id}>
            <UIMessage notification={item} onDismiss={actions.remove} />
          </animated.div>
        ))}
      </div>
    </div>
  );
}

import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "../reducers/app-state";
import { NotificationType, UINotificationMessage } from "../reducers/notifications";
import { useTimeout } from "../hooks";

function getTypeClassName(
  notification: UINotificationMessage,
  defaultName = ""
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

  const onRemove = useCallback(() => props.onDismiss(props.notification), [props]);

  useTimeout(15000, props.notification.dismissable ? onRemove : undefined);

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

export function MessageList() {
  const [notifications, actions] = useNotifications();

  return (
    <div className="UINotificationContainer">
      <div className="UINotificationContainerInner">
        <AnimatePresence initial={false}>
          {notifications.map((notification, i) => (
            <motion.div
              aria-live="polite"
              style={{ marginBottom: 8 }}
              key={i}
              positionTransition
              initial={{ opacity: 0, y: 50, scale: 0.3 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}>
              <UIMessage
                notification={notification}
                onDismiss={actions.removeNotification}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

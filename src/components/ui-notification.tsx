import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useNotifications,
  UINotificationMessage,
  NotificationType
} from "@reducers/app";
import { useTimeout } from "../hooks";
import classNames from "@utils/classnames";

interface IUIMessageProps {
  notification: UINotificationMessage;
  onDismiss(m: UINotificationMessage): void;
}

export default function UIMessage(props: IUIMessageProps): JSX.Element {
  const onRemove = useCallback(() => {
    props.onDismiss(props.notification);
  }, [props]);

  useTimeout(15000, props.notification.dismissable ? onRemove : undefined);

  return (
    <motion.div
      aria-live="polite"
      className="mb-2"
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}>
      <div
        className={classNames(
          "flex items center justify-between w-full h-full bg-white py-2 pr-4 pl-2 mt-2 text-onyx-900 rounded",
          props.notification.type === NotificationType.WARNING && "bg-goldar-500",
          props.notification.type === NotificationType.ERROR && "bg-red-500"
        )}>
        <div className="m-0 text-sm opacity-75">
          <p className="m-0">
            {props.notification.type !== NotificationType.DEFAULT && (
              <b>{props.notification.type} </b>
            )}
            {props.notification.text}
          </p>
        </div>
        {!props.notification.dismissable && (
          <button
            className="ml-4 p-0 border-0 appearance-none font-bold text-xs"
            onClick={onRemove}>
            Dismiss
          </button>
        )}
      </div>
    </motion.div>
  );
}

export function MessageList() {
  const [notifications, { removeNotification }] = useNotifications();

  const innerClassName = classNames(
    "relative max-w-sm",
    notifications.length === 0 && "w-0 h-0 max-w-0"
  );

  return (
    <div className="fixed p-4 w-full max-w-sm flex flex-col justify-end bottom-0 right-0">
      <div className={innerClassName}>
        <AnimatePresence initial={false}>
          {notifications.map((notification, i) => (
            <UIMessage
              key={i}
              notification={notification}
              onDismiss={removeNotification}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

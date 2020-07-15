import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import { useNotifications } from "@reducers/app";
import classNames from "@utils/classnames";

const UIMessage = dynamic(() => import("@components/ui-notification"));

export default function MessageList() {
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

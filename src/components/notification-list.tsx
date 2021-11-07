import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import { useStore } from "@reducers/app";
import classNames from "@utils/classnames";

const UIMessage = dynamic(() => import("@components/ui-notification"));

export default function MessageList() {
  const store = useStore();

  const innerClassName = classNames(
    "relative max-w-sm",
    store.notifications.list.length === 0 && "w-0 h-0 max-w-0"
  );

  const outerClassName = classNames(
    "fixed p-4 flex flex-col justify-end bottom-0 right-0",
    store.notifications.list.length > 0 ? "w-full max-w-sm h-auto" : "w-0 h-0"
  );

  return (
    <div className={outerClassName}>
      <div className={innerClassName}>
        <AnimatePresence initial={false}>
          {store.notifications.list.map((notification, i) => (
            <UIMessage key={i} notification={notification} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

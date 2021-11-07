import { useDataSource } from "@store/provider";
import classNames from "@utils/classnames";
import { UIMessage } from "@components/ui-notification";
import { useSubjectEffect } from "@hooks/useSubject";

function MessageList() {
  const store = useDataSource();

  const notifications = useSubjectEffect(store.notifications.subject);

  const innerClassName = classNames(
    "relative max-w-sm",
    notifications.length === 0 && "w-0 h-0 max-w-0"
  );

  const outerClassName = classNames(
    "fixed p-4 flex flex-col justify-end bottom-0 right-0",
    notifications.length > 0 ? "w-full max-w-sm h-auto" : "w-0 h-0"
  );

  return (
    <div className={outerClassName}>
      <div className={innerClassName}>
        {notifications.map((notification, i) => (
          <UIMessage key={i} notification={notification} />
        ))}
      </div>
    </div>
  );
}

export default MessageList;

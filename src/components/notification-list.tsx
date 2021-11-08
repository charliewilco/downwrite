import { UIMessage } from "@components/ui-notification";
import { useSubjectEffect, useDataSource } from "@hooks/index";

export function MessageList() {
  const store = useDataSource();

  const notifications = useSubjectEffect(store.notifications.subject);

  return (
    <div>
      <div>
        {notifications.map((notification, i) => (
          <UIMessage key={i} notification={notification} />
        ))}
      </div>
    </div>
  );
}

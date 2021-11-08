import { useCallback } from "react";
import { useDataSource, useTimeout } from "@hooks/index";
import { NotificationType, UINotificationMessage } from "@store/base/notifications";

interface IUIMessageProps {
  notification: UINotificationMessage;
}

export function UIMessage(props: IUIMessageProps): JSX.Element {
  const store = useDataSource();
  const onRemove = useCallback(() => {
    store.notifications.remove(props.notification.id);
  }, [props]);

  useTimeout(15000, props.notification.dismissable ? onRemove : undefined);

  return (
    <div>
      <div>
        <div>
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
      <style jsx>{`
        div {
          background: var(--goldar-500);
          padding: 0.5rem;
        }
      `}</style>
    </div>
  );
}

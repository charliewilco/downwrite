import { useCallback } from "react";
import { useDataSource } from "@store/provider";
import { useTimeout } from "../hooks/useTimers";
import classNames from "@utils/classnames";
import { NotificationType, UINotificationMessage } from "@store/notifications";

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
    <div aria-live="polite" className="mb-2">
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
    </div>
  );
}

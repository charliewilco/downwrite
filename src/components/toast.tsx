import React, { useCallback } from "react";
import { useDataSource, useTimeout } from "@hooks/index";
import { NotificationType, UINotificationMessage } from "@store/base/notifications";

interface IToastUIProps {
  notification: UINotificationMessage;
}

export const ToastUI: React.VFC<IToastUIProps> = (props) => {
  const dataSource = useDataSource();

  const onRemove = useCallback(() => {
    dataSource.notifications.remove(props.notification.id);
  }, [props, dataSource]);

  useTimeout(15000, props.notification.dismissable ? onRemove : undefined);

  const bg =
    props.notification.type === NotificationType.WARNING
      ? "var(--goldar-500)"
      : props.notification.type === NotificationType.ERROR
      ? "var(--goldar-900)"
      : "var(--surface)";

  const fg =
    props.notification.type === NotificationType.WARNING ||
    props.notification.type === NotificationType.ERROR
      ? "var(--onyx-900)"
      : "inherit";

  return (
    <div className="toast">
      <div className="toast-content">
        <p>
          {props.notification.type !== NotificationType.DEFAULT && (
            <b>{props.notification.type} </b>
          )}
          {props.notification.text}
        </p>

        {!props.notification.dismissable && (
          <button className="alt-button" onClick={onRemove}>
            Dismiss
          </button>
        )}
      </div>

      <style jsx>{`
        .toast {
          background: ${bg};
          color: ${fg};
          padding: 0.5rem;
          border-radius: 0.25rem;
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          width: 100%;
          margin: auto auto 0;
          z-index: 50;
        }

        .toast:nth-child(2) {
          transform: scale(92.5%);
          z-index: 49;
          margin-bottom: 1rem;
        }

        .toast:nth-child(3) {
          transform: scale(87.5%);
          z-index: 48;
          margin-bottom: 1.5rem;
        }

        .toast-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        button {
          font-weight: 700;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
};

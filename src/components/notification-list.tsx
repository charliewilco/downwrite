import { ToastUI } from "@components/toast";
import { useSubjectEffect, useDataSource } from "@hooks/index";

export function NotificationList() {
  const dataSource = useDataSource();
  const notifications = useSubjectEffect(dataSource.notifications.subject);

  return (
    <div aria-live="polite" className="notification-list">
      <div className="container">
        {notifications.map((notification, i) => (
          <ToastUI key={i} notification={notification} />
        ))}
      </div>

      <style jsx>{`
        [aria-live="polite"] {
          position: fixed;
          bottom: 0;
          right: 0;

          padding: 1rem;
          width: 100%;
          max-width: 24rem;
        }

        .container {
          position: relative;
        }
      `}</style>
    </div>
  );
}

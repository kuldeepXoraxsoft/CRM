import { BellOff } from "lucide-react";
import NotificationItem from "./NotificationItem";

/**
 * NotificationList
 *
 * Props:
 * - notifications
 * - onRead(id)
 * - onDelete(id)
 */

export default function NotificationList({
  notifications,
  onRead,
  onDelete,
}) {
  if (notifications.length === 0) {
    return (
      <div className="flex h-[450px] flex-col items-center justify-center px-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-canvas">
          <BellOff
            size={40}
            className="text-ink-faint"
          />
        </div>

        <h3 className="mt-6 text-xl font-semibold text-ink">
          No Notifications
        </h3>

        <p className="mt-2 max-w-sm text-sm leading-6 text-ink-muted">
          You're all caught up! New notifications about tasks,
          meetings, leads, emails and system updates will
          appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRead={onRead}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
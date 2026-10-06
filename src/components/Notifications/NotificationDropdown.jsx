import { Trash2, CheckCheck, BellRing } from "lucide-react";

export default function NotificationDropdown({
  notifications,
  unreadCount,
  onRead,
  onDelete,
  // onViewAll,
  onClose,
}) {
  const latestNotifications = notifications.slice(0, 5);

  return (
    <div className="absolute right-[-35px] top-10 z-50 w-[350px] overflow-hidden rounded-xl border border-border bg-surface shadow-2xl">

      {/* Header */}

      <div className="flex items-center justify-between border-b border-border px-5 py-2 bg-primary-100">
        <div>
          <h3 className="text-base font-semibold text-ink">
            Notifications
          </h3>

          <p className="text-xs text-ink-muted">
            {unreadCount} unread notification{unreadCount !== 1 && "s"}
          </p>
        </div>

        <BellRing
          size={20}
          className="text-primary-500"
        />
      </div>

      {/* Empty State */}

      {latestNotifications.length === 0 && (
        <div className="flex flex-col items-center justify-center px-6 py-12">
          <BellRing
            size={48}
            className="mb-4 text-ink-faint"
          />

          <h4 className="font-semibold text-ink">
            You're all caught up
          </h4>

          <p className="mt-1 text-center text-sm text-ink-muted">
            No new notifications.
          </p>
        </div>
      )}

      {/* Notification List */}

      {latestNotifications.length > 0 && (
        <div className="max-h-[420px] overflow-y-auto">

          {latestNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`group border-b border-border p-4 transition-colors hover:bg-canvas ${
                !notification.isRead ? "bg-primary-50/40" : ""
              }`}
            >
              <div className="flex justify-between gap-3">

                {/* Left */}

                <div className="flex-1">

                  <div className="flex items-center gap-2">

                    {!notification.isRead && (
                      <span className="h-2 w-2 rounded-full bg-primary-500" />
                    )}

                    <h4 className="text-sm font-semibold text-ink">
                      {notification.title}
                    </h4>

                  </div>

                  <p className="mt-1 text-sm text-ink-muted">
                    {notification.message}
                  </p>

                  <p className="mt-2 text-xs text-ink-faint">
                    {notification.time}
                  </p>

                </div>

                {/* Actions */}

                <div className="flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100">

                  {!notification.isRead && (
                    <button
                      onClick={() => onRead(notification.id)}
                      className="rounded p-1 text-success-500 hover:bg-success-50"
                      title="Mark as Read"
                    >
                      <CheckCheck size={16} />
                    </button>
                  )}

                  <button
                    onClick={() => onDelete(notification.id)}
                    className="rounded p-1 text-danger-500 hover:bg-danger-50"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>

                </div>

              </div>
            </div>
          ))}

        </div>
      )}

      {/* Footer */}

      {/* <div className="border-t border-border bg-canvas px-5 py-3">

        <button
          onClick={onViewAll}
          className="w-full rounded-md bg-primary-500 py-2 text-sm font-medium text-white transition hover:bg-primary-600"
        >
          View All Notifications
        </button>

      </div> */}
    </div>
  );
}
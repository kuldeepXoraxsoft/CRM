import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { Button } from "../ui";

/**
 * NotificationHeader
 *
 * Props:
 * - totalCount
 * - unreadCount
 * - onMarkAllRead()
 * - onDeleteAll()
 */

export default function NotificationHeader({
  totalCount,
  unreadCount,
  onMarkAllRead,
  onDeleteAll,
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-border bg-surface px-6 py-5 md:flex-row md:items-center md:justify-between">
      {/* Left */}

      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
          <Bell size={24} />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-primary-600">
            Notifications
          </h1>

          <p className="mt-1 text-sm text-ink-muted">
            {totalCount} notification{totalCount !== 1 && "s"}

            {unreadCount > 0 && (
              <>
                {" "}
                •{" "}
                <span className="font-medium text-primary-600">
                  {unreadCount} unread
                </span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Right */}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          leftIcon={<CheckCheck size={16} />}
          disabled={unreadCount === 0}
          onClick={onMarkAllRead}
        >
          Mark All Read
        </Button>

        <Button
          variant="danger"
          size="sm"
          leftIcon={<Trash2 size={16} />}
          disabled={totalCount === 0}
          onClick={onDeleteAll}
        >
          Delete All
        </Button>
      </div>
    </div>
  );
}
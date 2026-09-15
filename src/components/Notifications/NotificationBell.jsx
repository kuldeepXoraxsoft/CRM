import { useEffect, useRef, useState } from "react";
import {
  Bell,
  CheckCheck,
  Trash2,
  UserPlus,
  RefreshCw,
  CheckCircle2,
  CalendarClock,
  MessageSquare,
  DollarSign,
  Megaphone,
  Info,
} from "lucide-react";

import { notificationsApi } from "../../api/Notificationapi";

const ICON_MAP = {
  TASK_ASSIGNED: UserPlus,
  TASK_UPDATED: RefreshCw,
  TASK_COMPLETED: CheckCircle2,
  FOLLOW_UP_REMINDER: CalendarClock,
  LEAD_ASSIGNED: UserPlus,
  LEAD_UPDATED: RefreshCw,
  ACCOUNT_UPDATED: RefreshCw,
  COMMENT: MessageSquare,
  MENTION: MessageSquare,
  PAYMENT_DUE: DollarSign,
  ANNOUNCEMENT: Megaphone,
  SYSTEM: Info,
};

function timeAgo(isoString) {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const panelRef = useRef(null);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchUnreadCount() {
    try {
      const { count } = await notificationsApi.unreadCount();
      setUnreadCount(count);
    } catch {
      // Silent - badge just won't update this cycle.
    }
  }

  async function fetchNotifications() {
    setIsLoading(true);
    try {
      const data = await notificationsApi.list();
      setNotifications(data);
    } finally {
      setIsLoading(false);
    }
  }

  function togglePanel() {
    const next = !isOpen;
    setIsOpen(next);
    if (next) fetchNotifications();
  }

  async function handleMarkAsRead(notification) {
    if (notification.isRead) return;
    const updated = await notificationsApi.markAsRead(notification.id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? updated.notification : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }

  async function handleMarkAllAsRead() {
    await notificationsApi.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }

  async function handleDelete(id, e) {
    e.stopPropagation();
    await notificationsApi.remove(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  async function handleClearAll() {
    await notificationsApi.removeAll();
    setNotifications([]);
    setUnreadCount(0);
  }

  return (
    <div ref={panelRef} className="relative">
      <button
        type="button"
        onClick={togglePanel}
        className="relative flex h-9 w-9 items-center justify-center rounded-md text-ink-muted hover:bg-canvas hover:text-ink"
        aria-label="Notifications"
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-ink">Notifications</p>
            {notifications.length > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700"
              >
                <CheckCheck size={13} />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <p className="px-4 py-6 text-center text-sm text-ink-muted">Loading...</p>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-ink-muted">
                You're all caught up.
              </p>
            ) : (
              notifications.map((notification) => {
                const Icon = ICON_MAP[notification.type] || Info;
                return (
                  <button
                    key={notification.id}
                    onClick={() => handleMarkAsRead(notification)}
                    className={`flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left transition-colors hover:bg-canvas ${
                      notification.isRead ? "" : "bg-primary-50"
                    }`}
                  >
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                      <Icon size={14} />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-ink">
                        {notification.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-ink-muted line-clamp-2">
                        {notification.message}
                      </span>
                      <span className="mt-1 block text-[11px] text-ink-faint">
                        {timeAgo(notification.createdAt)}
                      </span>
                    </span>

                    <span
                      role="button"
                      onClick={(e) => handleDelete(notification.id, e)}
                      className="mt-0.5 shrink-0 text-ink-faint hover:text-danger-500"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {notifications.length > 0 && (
            <div className="border-t border-border px-4 py-2.5">
              <button
                onClick={handleClearAll}
                className="text-xs font-medium text-ink-muted hover:text-danger-500"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
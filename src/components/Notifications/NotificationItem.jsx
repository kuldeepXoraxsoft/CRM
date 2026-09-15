import {
  Bell,
  CalendarDays,
  CircleCheck,
  CircleAlert,
  Mail,
  ClipboardList,
  UserPlus,
  Trash2,
  Check,
} from "lucide-react";

import { Button, Badge } from "../ui";

const TYPE_CONFIG = {
  task: {
    icon: ClipboardList,
    color: "text-primary-600",
    badge: "primary",
  },

  meeting: {
    icon: CalendarDays,
    color: "text-warning-600",
    badge: "warning",
  },

  email: {
    icon: Mail,
    color: "text-sky-600",
    badge: "primary",
  },

  lead: {
    icon: UserPlus,
    color: "text-success-600",
    badge: "success",
  },

  system: {
    icon: Bell,
    color: "text-ink-muted",
    badge: "neutral",
  },

  warning: {
    icon: CircleAlert,
    color: "text-danger-500",
    badge: "danger",
  },

  success: {
    icon: CircleCheck,
    color: "text-success-600",
    badge: "success",
  },

  customer: {
    icon: UserPlus,
    color: "text-primary-500",
    badge: "primary",
  },
};

function getRelativeTime(date) {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);

  const intervals = [
    { label: "year", value: 31536000 },
    { label: "month", value: 2592000 },
    { label: "day", value: 86400 },
    { label: "hour", value: 3600 },
    { label: "minute", value: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.value);

    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
    }
  }

  return "Just now";
}

export default function NotificationItem({
  notification,
  onRead,
  onDelete,
}) {
  const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.system;

  const Icon = config.icon;

  return (
    <div
      className={`group flex gap-4 border-b border-border px-5 py-4 transition-colors hover:bg-canvas ${
        !notification.isRead ? "bg-primary-50/40" : ""
      }`}
    >
      {/* Icon */}

      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-canvas">
        <Icon className={config.color} size={20} />

        {!notification.isRead && (
          <span className="absolute right-0 top-0 h-3 w-3 rounded-full bg-primary-500 ring-2 ring-surface" />
        )}
      </div>

      {/* Content */}

      <div className="min-w-0 flex-1">

        <div className="flex items-start justify-between gap-3">

          <div>

            <div className="flex items-center gap-2">

              <h3 className="font-semibold text-ink">
                {notification.title}
              </h3>

              <Badge variant={config.badge} size="sm">
                {notification.type}
              </Badge>

            </div>

            <p className="mt-1 text-sm text-ink-muted">
              {notification.message}
            </p>

          </div>

          <span className="whitespace-nowrap text-xs text-ink-faint">
            {getRelativeTime(notification.createdAt)}
          </span>

        </div>

        {/* Actions */}

        <div className="mt-3 flex items-center gap-2">

          {!notification.isRead && (
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Check size={15} />}
              onClick={() => onRead(notification.id)}
            >
              Mark Read
            </Button>
          )}

          <Button
            size="sm"
            variant="ghost"
            leftIcon={<Trash2 size={15} />}
            onClick={() => onDelete(notification.id)}
          >
            Delete
          </Button>

        </div>

      </div>
    </div>
  );
}
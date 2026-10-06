import { cn } from "../../lib/cn";

/**
 * NotificationTabs
 *
 * Props:
 * - activeTab: "all" | "unread"
 * - allCount: number
 * - unreadCount: number
 * - onChange(tab)
 */

export default function NotificationTabs({
  activeTab,
  allCount,
  unreadCount,
  onChange,
}) {
  const tabs = [
    {
      id: "all",
      label: "All",
      count: allCount,
    },
    {
      id: "unread",
      label: "Unread",
      count: unreadCount,
    },
  ];

  return (
    <div className="border-b border-border bg-surface px-5">
      <div className="flex gap-6">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={cn(
                "relative flex items-center gap-2 py-4 text-sm font-medium transition-colors",
                active
                  ? "text-primary-600"
                  : "text-ink-muted hover:text-ink"
              )}
            >
              {tab.label}

              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  active
                    ? "bg-primary-100 text-primary-700"
                    : "bg-canvas text-ink-muted"
                )}
              >
                {tab.count}
              </span>

              {active && (
                <span className="absolute bottom-0 left-0 h-[3px] w-full rounded-full bg-primary-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
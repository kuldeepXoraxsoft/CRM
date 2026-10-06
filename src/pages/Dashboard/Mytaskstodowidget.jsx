
import { CalendarDays } from "lucide-react";

import { Badge } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";

const PRIORITY_VARIANT = {
  high: "danger",
  medium: "warning",
  low: "neutral",
};

/**
 * "My Tasks & Todos" - shows the current logged-in user's own open items.
 */
export default function MyTasksTodoWidget({ items = [] }) {
  const { currentUser } = useAuth();

  const currentUserId = currentUser?.id;

  const myOpenItems = (items || [])
    .filter((item) => {
      if (!item || !currentUserId) return false;

      return (
        item.assignee === currentUserId ||
        item.assigneeId === currentUserId ||
        item.assignee?.id === currentUserId
      );
    })
    .filter(
      (item) =>
        item.status?.toLowerCase() !== "completed"
    )
    .slice(0, 6);

  if (myOpenItems.length === 0) {
    return (
      <p className="text-sm text-ink-muted">
        You're all caught up — nothing pending.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {myOpenItems.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between gap-3 rounded-md border border-border bg-canvas px-3 py-2.5"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">
              {item.title}
            </p>

            {item.dueDate !== undefined && (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-muted">
                <CalendarDays size={12} />
                {item.dueDate || "No due date"}
              </p>
            )}
          </div>

          {item.priority && (
            <Badge
              variant={
                PRIORITY_VARIANT[item.priority?.toLowerCase()] || "neutral"
              }
            >
              {item.priority}
            </Badge>
          )}
        </div>
      ))}
    </div>
  );
}

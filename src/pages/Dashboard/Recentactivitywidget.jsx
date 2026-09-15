import {
  UserPlus,
  ArrowRightCircle,
  Repeat,
  UsersRound,
  Activity as ActivityIcon,
} from "lucide-react";

import { useActivity } from "../../hooks/useActivity";

const ICON_MAP = {
  lead: ArrowRightCircle,
  task: Repeat,
  employee: UserPlus,
  team: UsersRound,
  general: ActivityIcon,
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

export default function RecentActivityWidget() {
  const { activities } = useActivity();

  if (activities.length === 0) {
    return <p className="text-sm text-ink-muted">No recent activity yet.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {activities.slice(0, 8).map((activity) => {
        const Icon = ICON_MAP[activity.type] || ActivityIcon;
        return (
          <div key={activity.id} className="flex items-start gap-3">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
              <Icon size={14} />
            </span>
            <div className="min-w-0">
              <p className="text-sm text-ink">{activity.message}</p>
              <p className="text-xs text-ink-faint">{timeAgo(activity.createdAt)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
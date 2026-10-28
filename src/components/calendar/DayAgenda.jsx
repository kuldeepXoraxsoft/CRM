import { CalendarX2 } from "lucide-react";

import { Badge } from "../../components/ui";
import { cn } from "../../lib/cn";
import { EVENT_TYPES } from "../../data/Calendardata";
import {
  formatEventTime,
  formatLongDate,
  isOverdue,
} from "../../utils/calendarUtils";

const PRIORITY_VARIANT = { High: "danger", Medium: "warning", Low: "neutral" };

export default function DayAgenda({ date, events, isToday, isLoading, onOpen }) {
  return (
    <div className="flex min-w-0 flex-col">
      <div className="flex items-start justify-between gap-2 border-b border-border px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-ink">{formatLongDate(date)}</h3>
          <p className="text-xs text-ink-muted">
            {events.length === 0
              ? "Nothing scheduled"
              : `${events.length} item${events.length > 1 ? "s" : ""}`}
          </p>
        </div>

        {isToday && (
          <Badge size="sm" variant="primary" dot>
            Today
          </Badge>
        )}
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center px-4 py-10 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-canvas text-ink-faint">
            <CalendarX2 size={18} />
          </div>

          <p className="mt-2 text-sm text-ink-muted">
            {isLoading ? "Loading…" : "A free day. Meetings, tasks and follow-ups due on this date will show up here."}
          </p>
        </div>
      ) : (
        <ul className={cn("divide-y divide-border transition-opacity", isLoading && "opacity-60")}>
          {events.map((event) => (
            <AgendaItem key={event.id} event={event} onOpen={onOpen} />
          ))}
        </ul>
      )}
    </div>
  );
}

function AgendaItem({ event, onOpen }) {
  const type = EVENT_TYPES[event.kind];
  const Icon = type?.icon;
  const overdue = isOverdue(event);

  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(event)}
        className="flex w-full min-w-0 gap-3 px-4 py-3 text-left transition-colors hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500"
      >
        <span
          aria-hidden="true"
          className={cn("mt-0.5 w-1 shrink-0 self-stretch rounded-full", type?.bar)}
        />

        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5 text-xs text-ink-muted">
            {Icon && <Icon size={13} aria-hidden="true" />}
            <span className="font-medium">{type?.singular}</span>
            <span aria-hidden="true">·</span>
            <span>{formatEventTime(event)}</span>
          </span>

          <span
            className={cn(
              "mt-0.5 block break-words text-sm font-medium text-ink",
              event.done && "text-ink-faint line-through",
            )}
          >
            {event.title}
          </span>

          {event.subtitle && (
            <span className="mt-0.5 block truncate text-xs text-ink-muted">
              {event.subtitle}
            </span>
          )}

          {(overdue || event.priority || event.done) && (
            <span className="mt-1.5 flex flex-wrap gap-1.5">
              {overdue && (
                <Badge size="sm" variant="danger">
                  Overdue
                </Badge>
              )}

              {event.done && (
                <Badge size="sm" variant="success">
                  Completed
                </Badge>
              )}

              {event.priority && !event.done && (
                <Badge size="sm" variant={PRIORITY_VARIANT[event.priority] || "neutral"} dot>
                  {event.priority}
                </Badge>
              )}
            </span>
          )}
        </span>
      </button>
    </li>
  );
}

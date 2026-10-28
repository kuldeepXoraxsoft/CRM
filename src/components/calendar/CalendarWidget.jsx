import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../lib/cn";
import useCalendarEvents from "../../hooks/useCalendarEvents";
import {
  EVENT_TYPE_KEYS,
  EVENT_TYPES,
  WEEK_STARTS_ON,
  getEventPath,
} from "../../data/Calendardata";
import {
  addDays,
  addMonths,
  buildMonthGrid,
  formatMonthTitle,
  groupEventsByDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  toDayKey,
} from "../../utils/calendarUtils";
import MonthGrid from "./MonthGrid";
import DayAgenda from "./DayAgenda";

const TEAM_ROLES = ["manager", "admin", "superAdmin"];

/**
 * Dashboard calendar: meetings, assigned tasks, to-dos and lead/account
 * follow-ups on one month view, with the selected day's agenda alongside.
 *
 * Props
 *  - refreshKey: change it (e.g. after a todo is edited elsewhere on the
 *    dashboard) to refetch the visible month.
 */
export default function CalendarWidget({ refreshKey }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const canViewTeam = TEAM_ROLES.includes(currentUser?.role);

  const [scope, setScope] = useState("mine");
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));
  const [hiddenKinds, setHiddenKinds] = useState([]);

  const days = useMemo(() => buildMonthGrid(viewMonth, WEEK_STARTS_ON), [viewMonth]);
  const rangeStart = days[0];
  const rangeEnd = useMemo(() => addDays(days[days.length - 1], 1), [days]);

  const { events, truncated, error, isLoading, retry } = useCalendarEvents({
    rangeStart,
    rangeEnd,
    scope,
    refreshKey,
  });

  const visibleEvents = useMemo(
    () => events.filter((event) => !hiddenKinds.includes(event.kind)),
    [events, hiddenKinds],
  );

  const eventsByDay = useMemo(() => groupEventsByDay(visibleEvents), [visibleEvents]);

  const countsByKind = useMemo(() => {
    const counts = {};
    for (const event of events) counts[event.kind] = (counts[event.kind] || 0) + 1;
    return counts;
  }, [events]);

  const todayKey = toDayKey(new Date());
  const selectedEvents = eventsByDay.get(toDayKey(selectedDate)) || [];

  /* -----------------------------
      NAVIGATION
  ----------------------------- */

  function selectDate(date) {
    setSelectedDate(date);
    if (!isSameMonth(date, viewMonth)) setViewMonth(startOfMonth(date));
  }

  function shiftMonth(delta) {
    const next = addMonths(viewMonth, delta);
    const today = new Date();

    setViewMonth(next);
    // Keep the selection inside the visible month so the grid stays keyboard-reachable
    setSelectedDate(isSameMonth(next, today) ? startOfDay(today) : next);
  }

  function goToToday() {
    const today = startOfDay(new Date());
    setViewMonth(startOfMonth(today));
    setSelectedDate(today);
  }

  function toggleKind(kind) {
    setHiddenKinds((prev) =>
      prev.includes(kind) ? prev.filter((k) => k !== kind) : [...prev, kind],
    );
  }

  function openEvent(event) {
    const path = getEventPath(event);
    if (path) navigate(path);
  }

  return (
    <section
      aria-label="Calendar"
      className="min-w-0 overflow-hidden rounded-lg border border-border bg-surface"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-border px-5 py-4">
        <div className="flex min-w-0 items-center gap-2">
          <CalendarDays size={17} className="shrink-0 text-primary-600" />
          <h2 className="font-semibold text-ink">Calendar</h2>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" aria-label="Previous month" onClick={() => shiftMonth(-1)}>
            <ChevronLeft size={16} />
          </Button>

          <span
            aria-live="polite"
            className="min-w-[120px] text-center text-sm font-semibold text-ink"
          >
            {formatMonthTitle(viewMonth)}
          </span>

          <Button variant="ghost" size="sm" aria-label="Next month" onClick={() => shiftMonth(1)}>
            <ChevronRight size={16} />
          </Button>
        </div>

        <Button variant="outline" size="sm" onClick={goToToday}>
          Today
        </Button>

        {canViewTeam && (
          <div
            role="group"
            aria-label="Calendar scope"
            className="ml-auto inline-flex rounded-md border border-border-strong p-0.5"
          >
            {[
              { value: "mine", label: "My calendar" },
              { value: "team", label: "Team" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={scope === option.value}
                onClick={() => setScope(option.value)}
                className={cn(
                  "rounded px-2.5 py-1 text-xs font-medium transition-colors",
                  scope === option.value
                    ? "bg-primary-500 text-white"
                    : "text-ink-muted hover:text-ink",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Legend / filters */}
      <div
        role="group"
        aria-label="Show event types"
        className="flex flex-wrap gap-2 border-b border-border px-5 py-2.5"
      >
        {EVENT_TYPE_KEYS.map((kind) => {
          const type = EVENT_TYPES[kind];
          const active = !hiddenKinds.includes(kind);

          return (
            <button
              key={kind}
              type="button"
              aria-pressed={active}
              onClick={() => toggleKind(kind)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                active
                  ? "border-border-strong bg-surface text-ink"
                  : "border-border bg-canvas text-ink-faint line-through",
              )}
            >
              <span className={cn("h-2 w-2 rounded-full", type.dot, !active && "opacity-40")} />
              {type.label}
              <span className="text-ink-muted">{countsByKind[kind] || 0}</span>
            </button>
          );
        })}
      </div>

      {error && (
        <div role="alert" className="flex items-center justify-between gap-3 border-b border-border bg-danger-50 px-5 py-2.5 text-sm text-danger-600">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={retry}>
            Retry
          </Button>
        </div>
      )}

      {truncated && !error && (
        <p className="border-b border-border bg-warning-50 px-5 py-2 text-xs text-warning-600">
          This month has a lot of items, so some are not shown. Narrow it down with the filters above.
        </p>
      )}

      {/* Body */}
      <div className="grid min-w-0 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className={cn("min-w-0 transition-opacity", isLoading && "opacity-70")} aria-busy={isLoading}>
          <MonthGrid
            days={days}
            monthDate={viewMonth}
            selectedDate={selectedDate}
            eventsByDay={eventsByDay}
            todayKey={todayKey}
            onSelect={selectDate}
          />
        </div>

        <div className="border-t border-border lg:max-h-[600px] lg:overflow-y-auto lg:border-l lg:border-t-0">
          <DayAgenda
            date={selectedDate}
            events={selectedEvents}
            isToday={toDayKey(selectedDate) === todayKey}
            isLoading={isLoading}
            onOpen={openEvent}
          />
        </div>
      </div>
    </section>
  );
}

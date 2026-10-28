import { useEffect, useRef } from "react";

import { cn } from "../../lib/cn";
import { EVENT_TYPES, WEEK_STARTS_ON } from "../../data/Calendardata";
import {
  addDays,
  getWeekdayLabels,
  isSameMonth,
  toDayKey,
} from "../../utils/calendarUtils";

const MAX_PILLS = 2;
const MAX_DOTS = 4;
const WEEKDAYS = getWeekdayLabels(WEEK_STARTS_ON);

const KEY_STEPS = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };

/**
 * 6-week month grid. Arrow keys move the selected day (roving tabindex), so
 * keyboard users tab in once instead of through 42 cells.
 */
export default function MonthGrid({
  days,
  monthDate,
  selectedDate,
  eventsByDay,
  todayKey,
  onSelect,
}) {
  const gridRef = useRef(null);
  const shouldFocus = useRef(false);
  const selectedKey = toDayKey(selectedDate);

  // After a keyboard move, put focus on the newly selected cell
  useEffect(() => {
    if (!shouldFocus.current) return;
    shouldFocus.current = false;

    gridRef.current?.querySelector(`[data-day="${selectedKey}"]`)?.focus();
  }, [selectedKey]);

  function handleKeyDown(event) {
    const step = KEY_STEPS[event.key];
    if (!step) return;

    event.preventDefault();
    shouldFocus.current = true;
    onSelect(addDays(selectedDate, step));
  }

  const weeks = Array.from({ length: 6 }, (_, i) => days.slice(i * 7, i * 7 + 7));

  return (
    <div
      ref={gridRef}
      role="grid"
      aria-label="Month calendar"
      onKeyDown={handleKeyDown}
      className="min-w-0"
    >
      <div role="row" className="grid grid-cols-7 border-b border-border">
        {WEEKDAYS.map((label) => (
          <div
            key={label}
            role="columnheader"
            className="py-2 text-center text-[11px] font-medium uppercase tracking-wide text-ink-faint"
          >
            {label}
          </div>
        ))}
      </div>

      {weeks.map((week) => (
        <div key={toDayKey(week[0])} role="row" className="grid grid-cols-7">
          {week.map((day) => {
            const key = toDayKey(day);
            const events = eventsByDay.get(key) || [];
            const isToday = key === todayKey;
            const isSelected = key === selectedKey;
            const inMonth = isSameMonth(day, monthDate);

            return (
              <DayCell
                key={key}
                day={day}
                dayKey={key}
                events={events}
                isToday={isToday}
                isSelected={isSelected}
                inMonth={inMonth}
                onSelect={onSelect}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

function DayCell({ day, dayKey, events, isToday, isSelected, inMonth, onSelect }) {
  const label = `${day.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })}${isToday ? ", today" : ""}, ${
    events.length === 0
      ? "no events"
      : `${events.length} event${events.length > 1 ? "s" : ""}`
  }`;

  const overflow = events.length - MAX_PILLS;

  return (
    <button
      type="button"
      role="gridcell"
      data-day={dayKey}
      tabIndex={isSelected ? 0 : -1}
      aria-label={label}
      aria-selected={isSelected}
      aria-current={isToday ? "date" : undefined}
      onClick={() => onSelect(day)}
      className={cn(
        "flex min-h-[56px] min-w-0 flex-col items-stretch gap-1 border-b border-r border-border p-1.5 text-left transition-colors sm:min-h-[92px]",
        "focus-visible:relative focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
        inMonth ? "bg-surface hover:bg-canvas" : "bg-canvas/50 hover:bg-canvas",
        isSelected && "bg-primary-50 hover:bg-primary-50",
      )}
    >
      <span
        className={cn(
          "inline-flex h-6 min-w-6 items-center justify-center self-start rounded-full px-1 text-xs font-medium",
          isToday
            ? "bg-primary-500 text-white"
            : inMonth
              ? "text-ink"
              : "text-ink-faint",
        )}
      >
        {day.getDate()}
      </span>

      {/* Small screens: one dot per event */}
      {events.length > 0 && (
        <span className="flex flex-wrap gap-0.5 sm:hidden" aria-hidden="true">
          {events.slice(0, MAX_DOTS).map((event) => (
            <span
              key={event.id}
              className={cn("h-1.5 w-1.5 rounded-full", EVENT_TYPES[event.kind]?.dot)}
            />
          ))}
        </span>
      )}

      {/* Larger screens: first events as labelled pills */}
      <span className="hidden min-w-0 flex-col gap-0.5 sm:flex" aria-hidden="true">
        {events.slice(0, MAX_PILLS).map((event) => (
          <span
            key={event.id}
            className={cn(
              "truncate rounded-sm border-l-2 px-1 py-0.5 text-[11px] leading-tight",
              EVENT_TYPES[event.kind]?.pill,
              event.done && "line-through opacity-60",
            )}
          >
            {event.title}
          </span>
        ))}

        {overflow > 0 && (
          <span className="px-1 text-[11px] font-medium text-ink-muted">
            +{overflow} more
          </span>
        )}
      </span>
    </button>
  );
}

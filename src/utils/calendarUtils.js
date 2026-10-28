const pad = (n) => String(n).padStart(2, "0");

export function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addDays(date, days) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

export function addMonths(date, months) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

export function isSameMonth(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/** Local calendar day as "YYYY-MM-DD" */
export function toDayKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * Which day an event belongs to.
 * All-day items (task / to-do due dates) are stored as a bare date at UTC
 * midnight, so they use their date string - the same way the rest of the app
 * reads them. Timed items (meetings, follow-ups) use the viewer's local day.
 */
export function getEventDayKey(event) {
  return event.allDay
    ? String(event.start).slice(0, 10)
    : toDayKey(new Date(event.start));
}

/** Always 42 days (6 weeks) so the grid height never jumps between months. */
export function buildMonthGrid(monthDate, weekStartsOn = 0) {
  const first = startOfMonth(monthDate);
  const offset = (first.getDay() - weekStartsOn + 7) % 7;
  const start = addDays(first, -offset);

  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}

export function getWeekdayLabels(weekStartsOn = 0) {
  const base = new Date(2023, 0, 1); // a Sunday

  return Array.from({ length: 7 }, (_, index) =>
    addDays(base, weekStartsOn + index).toLocaleDateString("en-IN", {
      weekday: "short",
    }),
  );
}

/** Map of dayKey -> events (all-day first, then by start time). */
export function groupEventsByDay(events) {
  const map = new Map();

  for (const event of events) {
    const key = getEventDayKey(event);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(event);
  }

  for (const list of map.values()) {
    list.sort((a, b) => {
      if (a.allDay !== b.allDay) return a.allDay ? -1 : 1;
      return new Date(a.start) - new Date(b.start);
    });
  }

  return map;
}

/** Actionable items whose time has passed without being done. */
export function isOverdue(event, now = new Date()) {
  if (event.done) return false;

  if (event.kind === "task" || event.kind === "todo") {
    return getEventDayKey(event) < toDayKey(now);
  }

  if (event.kind === "followup") {
    return new Date(event.start) < now;
  }

  return false;
}

const formatClock = (date) =>
  date
    .toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })
    .replace(/\s/g, " ")

export function formatEventTime(event) {
  if (event.allDay) return "Due today";

  const start = new Date(event.start);
  if (!event.end) return formatClock(start);

  return `${formatClock(start)} – ${formatClock(new Date(event.end))}`;
}

export function formatMonthTitle(date) {
  return date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

export function formatLongDate(date) {
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

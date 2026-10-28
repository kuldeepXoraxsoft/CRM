import prisma from "../config/db.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  buildLeadAccountScopeWhere,
  buildMeetingScopeWhere,
  buildTaskScopeWhere,
} from "../utils/scope.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_RANGE_DAYS = 70; // a 6-week month grid is 42 days
const MAX_PER_SOURCE = 300;
const TEAM_ROLES = ["manager", "admin", "superAdmin"];
const DONE_STATUS = "Completed";

function parseRange(query) {
  const from = new Date(query.from);
  const to = new Date(query.to);

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    throw new ApiError(400, "Valid 'from' and 'to' dates are required.");
  }

  if (to <= from) {
    throw new ApiError(400, "'to' must be after 'from'.");
  }

  if (to - from > MAX_RANGE_DAYS * DAY_MS) {
    throw new ApiError(400, `Date range cannot exceed ${MAX_RANGE_DAYS} days.`);
  }

  return { from, to };
}

/**
 * Task/todo due dates are stored as a bare date (UTC midnight), so widen the
 * window by a day on each side; the client buckets them by their date string.
 */
function dateOnlyRange({ from, to }) {
  return {
    gte: new Date(from.getTime() - DAY_MS),
    lt: new Date(to.getTime() + DAY_MS),
  };
}

/* -----------------------------
    EVENT SOURCES
    Each returns { events, capped }; every event has one shape:
    { id, kind, title, subtitle, start, end, allDay, status, priority, done, ref }
    To add a new source (e.g. tickets with SLA dates), add a function here and
    include it in `sources` below - the frontend only needs a type entry.
----------------------------- */

async function meetingEvents(user, range, teamView) {
  const scopeWhere = teamView
    ? await buildMeetingScopeWhere(user)
    : {
        OR: [
          { hostId: user.id },
          { participants: { some: { userId: user.id } } },
        ],
      };

  const meetings = await prisma.meeting.findMany({
    where: {
      AND: [
        scopeWhere,
        {
          startAt: { gte: range.from, lt: range.to },
          status: { not: "Cancelled" },
        },
      ],
    },
    select: {
      id: true,
      title: true,
      startAt: true,
      durationMinutes: true,
      status: true,
      location: true,
      meetingUrl: true,
      host: { select: { id: true, name: true } },
      _count: { select: { participants: true } },
    },
    orderBy: { startAt: "asc" },
    take: MAX_PER_SOURCE,
  });

  const events = meetings.map((meeting) => ({
    id: `meeting:${meeting.id}`,
    kind: "meeting",
    title: meeting.title,
    subtitle:
      meeting.location ||
      (meeting.meetingUrl ? "Online meeting" : `Host: ${meeting.host.name}`),
    start: meeting.startAt,
    end: new Date(meeting.startAt.getTime() + meeting.durationMinutes * 60_000),
    allDay: false,
    status: meeting.status,
    priority: null,
    done: meeting.status === DONE_STATUS,
    meta: {
      host: meeting.host.name,
      participants: meeting._count.participants,
      meetingUrl: meeting.meetingUrl,
    },
    ref: { id: meeting.id },
  }));

  return { events, capped: meetings.length >= MAX_PER_SOURCE };
}

async function taskEvents(user, range, teamView) {
  const scopeWhere = teamView
    ? await buildTaskScopeWhere(user)
    : { assigneeId: user.id };

  const tasks = await prisma.assignedTask.findMany({
    where: { AND: [scopeWhere, { dueDate: dateOnlyRange(range) }] },
    select: {
      id: true,
      title: true,
      dueDate: true,
      priority: true,
      status: true,
      assignee: { select: { id: true, name: true } },
      assignedBy: { select: { id: true, name: true } },
    },
    orderBy: { dueDate: "asc" },
    take: MAX_PER_SOURCE,
  });

  const events = tasks.map((task) => ({
    id: `task:${task.id}`,
    kind: "task",
    title: task.title,
    subtitle:
      teamView && task.assignee.id !== user.id
        ? `Assigned to ${task.assignee.name}`
        : `From ${task.assignedBy.name}`,
    start: task.dueDate,
    end: null,
    allDay: true,
    status: task.status,
    priority: task.priority,
    done: task.status === DONE_STATUS,
    ref: { id: task.id },
  }));

  return { events, capped: tasks.length >= MAX_PER_SOURCE };
}

// To-dos are always personal, in both "mine" and "team" views
async function todoEvents(user, range) {
  const todos = await prisma.todo.findMany({
    where: { userId: user.id, dueDate: dateOnlyRange(range) },
    select: { id: true, title: true, dueDate: true, priority: true, status: true },
    orderBy: { dueDate: "asc" },
    take: MAX_PER_SOURCE,
  });

  const events = todos.map((todo) => ({
    id: `todo:${todo.id}`,
    kind: "todo",
    title: todo.title,
    subtitle: "My to-do",
    start: todo.dueDate,
    end: null,
    allDay: true,
    status: todo.status,
    priority: todo.priority,
    done: todo.status === DONE_STATUS,
    ref: { id: todo.id },
  }));

  return { events, capped: todos.length >= MAX_PER_SOURCE };
}

async function followUpEvents(user, range, teamView) {
  const scopeWhere = teamView
    ? await buildLeadAccountScopeWhere(user)
    : { cyvoraAMId: user.id };

  const where = {
    AND: [scopeWhere, { followUpDate: { gte: range.from, lt: range.to } }],
  };

  const select = { id: true, customerName: true, status: true, followUpDate: true };

  const [leads, accounts] = await Promise.all([
    prisma.lead.findMany({
      where,
      select,
      orderBy: { followUpDate: "asc" },
      take: MAX_PER_SOURCE,
    }),
    prisma.account.findMany({
      where,
      select,
      orderBy: { followUpDate: "asc" },
      take: MAX_PER_SOURCE,
    }),
  ]);

  const toEvent = (entityType, label) => (row) => ({
    id: `followup:${entityType}:${row.id}`,
    kind: "followup",
    title: row.customerName,
    subtitle: `${label} follow-up · ${row.status}`,
    start: row.followUpDate,
    end: null,
    allDay: false,
    status: row.status,
    priority: null,
    done: false,
    ref: { id: row.id, entityType },
  });

  return {
    events: [
      ...leads.map(toEvent("lead", "Lead")),
      ...accounts.map(toEvent("account", "Account")),
    ],
    capped:
      leads.length >= MAX_PER_SOURCE || accounts.length >= MAX_PER_SOURCE,
  };
}

/**
 * GET /api/calendar/events?from=<ISO>&to=<ISO>&scope=mine|team
 *
 * One request returns everything the dashboard calendar needs for the visible
 * date range. "mine" (default) is personal; "team" widens to the user's
 * reporting scope and is only available to manager / admin / superAdmin.
 */
export const listCalendarEvents = asyncHandler(async (req, res) => {
  const range = parseRange(req.query);
  const teamView = req.query.scope === "team";

  if (teamView && !TEAM_ROLES.includes(req.user.role)) {
    throw new ApiError(403, "Team calendar is not available for your role.");
  }

  const sources = [
    meetingEvents(req.user, range, teamView),
    taskEvents(req.user, range, teamView),
    todoEvents(req.user, range),
    followUpEvents(req.user, range, teamView),
  ];

  const results = await Promise.all(sources);

  const events = results
    .flatMap((result) => result.events)
    .sort((a, b) => new Date(a.start) - new Date(b.start));

  res.json({
    data: events,
    scope: teamView ? "team" : "mine",
    // true when any source hit its cap, so the UI can say the view is partial
    truncated: results.some((result) => result.capped),
  });
});

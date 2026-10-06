// Mock data standing in for the Prisma/Express API responses.
// Swap these out for real fetches once the backend is wired up.

/* -----------------------------------------------------------
    ORG DIRECTORY (drives department + role based scoping)
----------------------------------------------------------- */

export const MEMBER_DIRECTORY = [
  { id: "alicia", name: "Alicia Reyes", role: "Sales Manager", department: "Sales" },
  { id: "daniel", name: "Daniel Cho", role: "Sales Executive", department: "Sales" },
  { id: "sara", name: "Sara Khan", role: "Sales Executive", department: "Sales" },
  { id: "priya", name: "Priya Nair", role: "Support Lead", department: "Support" },
  { id: "marcus", name: "Marcus Webb", role: "Marketing Executive", department: "Marketing" },
  { id: "ankit", name: "Ankit Singh", role: "HR Manager", department: "HR" },
  { id: "rahul", name: "Rahul Sharma", role: "Admin", department: "Management" },
];

export function getMember(id) {
  return MEMBER_DIRECTORY.find((m) => m.id === id) || null;
}

export const MEMBER_OPTIONS = MEMBER_DIRECTORY.map((m) => ({
  value: m.id,
  label: `${m.name} — ${m.role}`,
}));

export const HOST_OPTIONS = MEMBER_DIRECTORY.map((m) => ({
  value: m.id,
  label: m.name,
}));

export const DEPARTMENT_OPTIONS = [
  ...new Set(MEMBER_DIRECTORY.map((m) => m.department)),
].map((d) => ({ value: d, label: d }));

export const ROLE_OPTIONS = [
  ...new Set(MEMBER_DIRECTORY.map((m) => m.role)),
].map((r) => ({ value: r, label: r }));

export const DEPARTMENT_FILTER_OPTIONS = [
  { value: "All", label: "All Departments" },
  ...DEPARTMENT_OPTIONS,
];

export const DURATION_OPTIONS = [
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "1 hour" },
  { value: "90", label: "1.5 hours" },
];

export const REMINDER_OPTIONS = [
  { value: "5", label: "5 minutes before" },
  { value: "10", label: "10 minutes before" },
  { value: "15", label: "15 minutes before" },
  { value: "30", label: "30 minutes before" },
  { value: "60", label: "1 hour before" },
];

export const MEETING_STATUS_VARIANT = {
  Scheduled: "primary",
  Completed: "success",
  Cancelled: "danger",
};

/* -----------------------------------------------------------
    SEED MEETINGS
----------------------------------------------------------- */

function localDateTime(hoursOffset) {
  const d = new Date();
  d.setMinutes(d.getMinutes() + hoursOffset * 60);
  d.setSeconds(0, 0);

  const pad = (n) => String(n).padStart(2, "0");

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export const INITIAL_MEETINGS = [
  {
    id: 1,
    title: "Weekly Sales Sync",
    agenda: "Pipeline review and blockers for this week's top deals.",
    dateTime: localDateTime(3),
    durationMinutes: 30,
    department: "Sales",
    visibleRoles: ["Sales Manager", "Sales Executive"],
    host: "alicia",
    members: ["daniel", "sara"],
    location: "https://meet.google.com/sales-weekly",
    isOnline: true,
    status: "Scheduled",
    reminderMinutesBefore: 30,
    reminderNotified: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Client Demo — Bluewave Analytics",
    agenda: "Product walkthrough for the Bluewave evaluation team.",
    dateTime: localDateTime(26),
    durationMinutes: 45,
    department: "Sales",
    visibleRoles: ["Sales Manager"],
    host: "daniel",
    members: ["alicia"],
    location: "https://meet.google.com/bluewave-demo",
    isOnline: true,
    status: "Scheduled",
    reminderMinutesBefore: 15,
    reminderNotified: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: "Support Escalation Review",
    agenda: "Review open P1 tickets and staffing for next week.",
    dateTime: localDateTime(50),
    durationMinutes: 60,
    department: "Support",
    visibleRoles: ["Support Lead"],
    host: "priya",
    members: ["rahul"],
    location: "Conference Room B",
    isOnline: false,
    status: "Scheduled",
    reminderMinutesBefore: 30,
    reminderNotified: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    title: "Q3 Campaign Kickoff",
    agenda: "Align on messaging and channel budget for Q3.",
    dateTime: localDateTime(-30),
    durationMinutes: 60,
    department: "Marketing",
    visibleRoles: ["Marketing Executive"],
    host: "marcus",
    members: ["alicia", "rahul"],
    location: "Conference Room A",
    isOnline: false,
    status: "Completed",
    reminderMinutesBefore: 15,
    reminderNotified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 5,
    title: "Monthly All-Hands",
    agenda: "Company updates, wins of the month, and open Q&A.",
    dateTime: localDateTime(-5),
    durationMinutes: 45,
    department: "Management",
    visibleRoles: [
      "Admin",
      "Sales Manager",
      "Sales Executive",
      "Support Lead",
      "Marketing Executive",
      "HR Manager",
    ],
    host: "rahul",
    members: [],
    location: "https://meet.google.com/all-hands",
    isOnline: true,
    status: "Completed",
    reminderMinutesBefore: 10,
    reminderNotified: true,
    createdAt: new Date().toISOString(),
  },
];

/* -----------------------------------------------------------
    SCOPE + FORMAT HELPERS
----------------------------------------------------------- */

// A meeting is visible to a user if they're hosting it, invited to it,
// in the same department, or their role is explicitly given access.
export function canViewMeeting(meeting, user) {
  if (!meeting || !user) return false;
  if (meeting.host === user.id) return true;
  if (meeting.members?.includes(user.id)) return true;
  if (meeting.department === user.department) return true;
  if (meeting.visibleRoles?.includes(user.role)) return true;
  return false;
}

export function isHost(meeting, user) {
  return Boolean(meeting && user && meeting.host === user.id);
}

export function isUpcoming(meeting) {
  return (
    meeting.status === "Scheduled" &&
    new Date(meeting.dateTime).getTime() >= Date.now()
  );
}

export function formatMeetingDateTime(dateTime) {
  const date = new Date(dateTime);

  const dayLabel = date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const timeLabel = date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  const prefix = isToday ? "Today" : isTomorrow ? "Tomorrow" : dayLabel;

  return `${prefix}, ${timeLabel}`;
}

export function getCountdownLabel(dateTime) {
  const diffMs = new Date(dateTime).getTime() - Date.now();

  if (diffMs <= 0) return null;

  const diffMins = Math.round(diffMs / 60000);

  if (diffMins < 60) return `in ${diffMins}m`;

  const diffHours = Math.round(diffMins / 60);
  if (diffHours < 24) return `in ${diffHours}h`;

  const diffDays = Math.round(diffHours / 24);
  return `in ${diffDays}d`;
}

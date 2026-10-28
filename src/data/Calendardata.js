import { ClipboardList, ListChecks, PhoneCall, Video } from "lucide-react";

export const WEEK_STARTS_ON = 0; // 0 = Sunday, 1 = Monday

// One entry per event kind returned by GET /api/calendar/events.
// To show a new kind, add the backend source, then add it here.
export const EVENT_TYPES = {
  meeting: {
    label: "Meetings",
    singular: "Meeting",
    icon: Video,
    dot: "bg-primary-500",
    pill: "border-primary-500 bg-primary-50 text-primary-700",
    bar: "bg-primary-500",
  },
  task: {
    label: "Assigned tasks",
    singular: "Task",
    icon: ClipboardList,
    dot: "bg-warning-500",
    pill: "border-warning-500 bg-warning-50 text-warning-600",
    bar: "bg-warning-500",
  },
  todo: {
    label: "My to-dos",
    singular: "To-do",
    icon: ListChecks,
    dot: "bg-ink-faint",
    pill: "border-ink-faint bg-canvas text-ink-muted",
    bar: "bg-ink-faint",
  },
  followup: {
    label: "Follow-ups",
    singular: "Follow-up",
    icon: PhoneCall,
    dot: "bg-success-500",
    pill: "border-success-500 bg-success-50 text-success-600",
    bar: "bg-success-500",
  },
};

export const EVENT_TYPE_KEYS = Object.keys(EVENT_TYPES);

/** Where clicking an event should take the user. */
export function getEventPath(event) {
  switch (event.kind) {
    case "meeting":
      return "/meetings";
    case "task":
      return "/tasks?tab=assigned";
    case "todo":
      return "/tasks?tab=todo";
    case "followup":
      return `/${event.ref.entityType}s/${event.ref.id}?tab=follow-ups`;
    default:
      return null;
  }
}

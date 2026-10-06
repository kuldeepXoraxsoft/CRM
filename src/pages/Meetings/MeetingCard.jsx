import {
  CalendarClock,
  MapPin,
  Video,
  Users,
  Pencil,
  Ban,
  Trash2,
  ExternalLink,
} from "lucide-react";

import { Badge, Button, Avatar } from "../../components/ui";

import {
  MEETING_STATUS_VARIANT,
  formatMeetingDateTime,
  getCountdownLabel,
  getMember,
  isHost,
} from "../../data/meetingData";

export default function MeetingCard({
  meeting,
  currentUser,
  onView,
  onEdit,
  onCancel,
  onDelete,
}) {
  const host = getMember(meeting.host);
  const members = meeting.members.map(getMember).filter(Boolean);
  const countdown = getCountdownLabel(meeting.dateTime);
  const canManage = isHost(meeting, currentUser);

  return (
    <div className="rounded-lg border border-border bg-surface p-4 transition hover:border-border-strong">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-ink">{meeting.title}</h3>

            <Badge variant={MEETING_STATUS_VARIANT[meeting.status]} size="sm">
              {meeting.status}
            </Badge>

            <Badge variant="neutral" size="sm">
              {meeting.department}
            </Badge>

            {countdown && meeting.status === "Scheduled" && (
              <Badge variant="warning" size="sm">
                {countdown}
              </Badge>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-ink-muted">
            <div className="flex items-center gap-1.5">
              <CalendarClock size={15} />
              {formatMeetingDateTime(meeting.dateTime)} · {meeting.durationMinutes}m
            </div>

            <div className="flex items-center gap-1.5">
              {meeting.isOnline ? <Video size={15} /> : <MapPin size={15} />}
              {meeting.location}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-5 text-sm">
            <div className="flex items-center gap-2">
              <Avatar name={host?.name} size="sm" />
              <span className="text-ink-muted">
                Hosted by{" "}
                <span className="font-medium text-ink">{host?.name}</span>
              </span>
            </div>

            {members.length > 0 && (
              <div className="flex items-center gap-2 text-ink-muted">
                <Users size={15} />
                {members.map((m) => m.name).join(", ")}
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <Button size="sm" variant="outline" onClick={() => onView(meeting)}>
            View
          </Button>

          {canManage && meeting.status === "Scheduled" && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                title="Edit"
                onClick={() => onEdit(meeting)}
                className="rounded-md p-1.5 text-ink-muted hover:bg-canvas hover:text-ink"
              >
                <Pencil size={15} />
              </button>

              <button
                type="button"
                title="Cancel meeting"
                onClick={() => onCancel(meeting.id)}
                className="rounded-md p-1.5 text-ink-muted hover:bg-canvas hover:text-warning-600"
              >
                <Ban size={15} />
              </button>

              <button
                type="button"
                title="Delete"
                onClick={() => onDelete(meeting.id)}
                className="rounded-md p-1.5 text-ink-muted hover:bg-canvas hover:text-danger-500"
              >
                <Trash2 size={15} />
              </button>
            </div>
          )}

          {meeting.isOnline && meeting.status === "Scheduled" && (
            <a
              href={meeting.location}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700"
            >
              Join <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

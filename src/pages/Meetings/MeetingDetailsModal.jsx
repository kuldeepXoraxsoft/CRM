import {
  CalendarClock,
  MapPin,
  Video,
  ExternalLink,
} from "lucide-react";

import { Modal, Button, Badge, Avatar } from "../../components/ui";

import {
  MEETING_STATUS_VARIANT,
  formatMeetingDateTime,
  getMember,
} from "../../data/meetingData";

export default function MeetingDetailsModal({ isOpen, onClose, meeting }) {
  if (!meeting) return null;

  const host = getMember(meeting.host);
  const members = meeting.members.map(getMember).filter(Boolean);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={meeting.title}
      size="md"
      footer={
        <>
          {meeting.isOnline && meeting.status === "Scheduled" && (
            <Button
              variant="outline"
              leftIcon={<ExternalLink size={15} />}
              onClick={() => window.open(meeting.location, "_blank")}
            >
              Join Meeting
            </Button>
          )}

          <Button onClick={onClose}>Close</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={MEETING_STATUS_VARIANT[meeting.status]} size="sm">
            {meeting.status}
          </Badge>
          <Badge variant="neutral" size="sm">
            {meeting.department}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-sm text-ink-muted">
          <CalendarClock size={15} />
          {formatMeetingDateTime(meeting.dateTime)} · {meeting.durationMinutes} minutes
        </div>

        <div className="flex items-center gap-2 text-sm text-ink-muted">
          {meeting.isOnline ? <Video size={15} /> : <MapPin size={15} />}
          {meeting.location || "No location set"}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
            Host
          </p>
          <div className="mt-2 flex items-center gap-2">
            <Avatar name={host?.name} size="sm" />
            <span className="text-sm text-ink">{host?.name}</span>
          </div>
        </div>

        {members.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
              Members
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {members.map((m) => (
                <span
                  key={m.id}
                  className="flex items-center gap-1.5 rounded-full bg-canvas px-2.5 py-1 text-xs font-medium text-ink"
                >
                  <Avatar name={m.name} size="sm" />
                  {m.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {meeting.agenda && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
              Agenda
            </p>
            <p className="mt-1 text-sm text-ink-muted">{meeting.agenda}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}

import { Modal, Button, Badge } from "../../components/ui";
import { meetingsApi } from "../../api/Meetingsapi";
import { useAuth } from "../../context/AuthContext";

const STATUS_VARIANT = {
  Scheduled: "primary",
  Completed: "success",
  Cancelled: "danger",
};

export default function MeetingDetailsModal({
  isOpen,
  onClose,
  meeting,
  onSaved,
}) {
  const { currentUser } = useAuth();
  if (!meeting) return null;

  const participant = meeting.participants?.find(
    (item) => item.userId === currentUser?.id,
  );
  const canCancel =
    currentUser?.role === "superAdmin" || meeting.hostId === currentUser?.id;

  async function respond(response) {
    const result = await meetingsApi.respond(meeting.id, response);
    const next = {
      ...meeting,
      participants: meeting.participants.map((item) =>
        item.userId === currentUser.id
          ? { ...item, response: result.response }
          : item,
      ),
    };
    onSaved(next);
  }

  async function cancel() {
    const updated = await meetingsApi.cancel(meeting.id);
    onSaved(updated);
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={meeting.title}
      size="lg"
      footer={<Button onClick={onClose}>Close</Button>}
    >
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          <Badge variant={STATUS_VARIANT[meeting.status] || "neutral"}>
            {meeting.status}
          </Badge>
          <Badge variant="neutral">{meeting.durationMinutes} min</Badge>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-ink-faint">When</span>
            <div>
              {new Date(meeting.startAt).toLocaleString("en-IN", {
                dateStyle: "full",
                timeStyle: "short",
              })}
            </div>
          </div>
          <div>
            <span className="text-ink-faint">Host</span>
            <div>{meeting.host?.name || "-"}</div>
          </div>
          <div>
            <span className="text-ink-faint">
              {meeting.meetingUrl ? "Meeting Link" : "Location"}
            </span>

            <div>
              {meeting.meetingUrl ? (
                <a
                  href={meeting.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  Join Meeting
                </a>
              ) : (
                meeting.location || "-"
              )}
            </div>
          </div>

          <div>
            <span className="text-ink-faint">Reminder</span>
            <div>
              {meeting.reminderMinutesBefore
                ? `${meeting.reminderMinutesBefore} min before`
                : "No reminder"}
            </div>
          </div>
        </div>
        <div>
          <h4 className="mb-2 font-semibold">Agenda / Description</h4>
          <p className="whitespace-pre-wrap rounded-lg bg-canvas p-4 text-sm text-ink-muted">
            {meeting.description || "No description."}
          </p>
        </div>
        <div>
          <h4 className="mb-2 font-semibold">Participants</h4>
          <div className="space-y-2">
            {meeting.participants?.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-md border border-border p-3"
              >
                <span>{item.user?.name}</span>
                <Badge
                  variant={
                    item.response === "Accepted"
                      ? "success"
                      : item.response === "Declined"
                        ? "danger"
                        : "neutral"
                  }
                >
                  {item.response}
                </Badge>
              </div>
            ))}
          </div>
        </div>
        {participant && meeting.status === "Scheduled" && (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => respond("Accepted")}>
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => respond("Declined")}
            >
              Decline
            </Button>
          </div>
        )}
        {canCancel && meeting.status === "Scheduled" && (
          <Button size="sm" variant="danger" onClick={cancel}>
            Cancel Meeting
          </Button>
        )}
      </div>
    </Modal>
  );
}

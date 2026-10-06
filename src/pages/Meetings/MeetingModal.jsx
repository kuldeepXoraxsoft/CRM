import { useEffect, useState } from "react";
import { Modal, Button, Input, Select, Textarea, Checkbox, UserSearchSelect } from "../../components/ui";

const DURATION_OPTIONS = [30, 45, 60, 90, 120].map((value) => ({ value: String(value), label: `${value} minutes` }));
const REMINDER_OPTIONS = [0, 5, 10, 15, 30, 60].map((value) => ({ value: String(value), label: value === 0 ? "No reminder" : `${value} minutes before` }));

const EMPTY = {
  title: "",
  description: "",
  startAt: "",
  durationMinutes: "30",
  participantIds: [],
  isOnline: false,
  location: "",
  meetingUrl: "",
  reminderMinutesBefore: "15",
};

function toLocalInput(value) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
}

export default function MeetingModal({ isOpen, onClose, onSave, meeting = null }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;
    setErrors({});
    setForm(
      meeting
        ? {
            title: meeting.title || "",
            description: meeting.description || "",
            startAt: toLocalInput(meeting.startAt),
            durationMinutes: String(meeting.durationMinutes || 30),
            participantIds: meeting.participants?.map((item) => item.userId) || [],
            isOnline: Boolean(meeting.meetingUrl),
            location: meeting.location || "",
            meetingUrl: meeting.meetingUrl || "",
            reminderMinutesBefore: String(meeting.reminderMinutesBefore ?? 15),
          }
        : EMPTY,
    );
  }, [isOpen, meeting]);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  async function submit() {
    const next = {};
    if (!form.title.trim()) next.title = "Title is required.";
    if (!form.startAt) next.startAt = "Start date & time is required.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    try {
      await onSave({
        title: form.title.trim(),
        description: form.description.trim() || null,
        startAt: new Date(form.startAt).toISOString(),
        durationMinutes: Number(form.durationMinutes),
        participantIds: form.participantIds,
        location: form.isOnline ? null : form.location.trim() || null,
        meetingUrl: form.isOnline ? form.meetingUrl.trim() || null : null,
        reminderMinutesBefore: Number(form.reminderMinutesBefore),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={meeting ? "Edit Meeting" : "Schedule Meeting"}
      size="lg"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={submit} disabled={saving}>{saving ? "Saving..." : meeting ? "Save Changes" : "Schedule Meeting"}</Button></>}
    >
      <div className="space-y-4">
        <Input label="Title" required value={form.title} error={errors.title} placeholder="e.g. Weekly Sales Sync" onChange={(e) => update("title", e.target.value)} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Start date & time" required type="datetime-local" value={form.startAt} error={errors.startAt} onChange={(e) => update("startAt", e.target.value)} />
          <Select label="Duration" options={DURATION_OPTIONS} value={form.durationMinutes} onChange={(e) => update("durationMinutes", e.target.value)} />
        </div>
        <UserSearchSelect label="Participants" isMulti purpose="meeting" value={form.participantIds} onChange={(value) => update("participantIds", value)} placeholder="Invite team members..." searchPlaceholder="Search team members..." />
        <div className="grid grid-cols-2 gap-4">
          <Select label="Reminder" options={REMINDER_OPTIONS} value={form.reminderMinutesBefore} onChange={(e) => update("reminderMinutesBefore", e.target.value)} />
          <Checkbox label="This is an online meeting" checked={form.isOnline} onChange={(e) => update("isOnline", e.target.checked)} />
        </div>
        <Input label={form.isOnline ? "Meeting link" : "Location"} value={form.isOnline ? form.meetingUrl : form.location} placeholder={form.isOnline ? "https://meet.google.com/..." : "Conference room / office"} onChange={(e) => update(form.isOnline ? "meetingUrl" : "location", e.target.value)} />
        <Textarea label="Agenda / Description" rows={4} value={form.description} onChange={(e) => update("description", e.target.value)} />
      </div>
    </Modal>
  );
}

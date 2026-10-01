import { useEffect, useState } from "react";

import {
  Modal,
  Button,
  Input,
  Select,
  SearchSelect,
  Textarea,
  Checkbox,
} from "../../components/ui";

import {
  DURATION_OPTIONS,
  REMINDER_OPTIONS,
  ROLE_OPTIONS,
  MEMBER_OPTIONS,
} from "../../data/meetingData";
import DateSelector from "../../components/ui/DateSelector";

function buildEmptyForm(currentUser) {
  return {
    title: "",
    dateTime: "",
    durationMinutes: "30",
    department: currentUser?.department || "",
    visibleRoles: [],
    host: currentUser?.id || "",
    members: [],
    isOnline: true,
    location: "",
    agenda: "",
    reminderMinutesBefore: "30",
  };
}

export default function MeetingModal({
  isOpen,
  onClose,
  onSave,
  currentUser,
  mode = "create",
  meeting = null,
}) {
  const [form, setForm] = useState(buildEmptyForm(currentUser));
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (mode === "edit" && meeting) {
      setForm({
        ...meeting,
        durationMinutes: String(meeting.durationMinutes),
        reminderMinutesBefore: String(meeting.reminderMinutesBefore),
      });
    } else {
      setForm(buildEmptyForm(currentUser));
    }
    setErrors({});
  }, [mode, meeting, isOpen, currentUser]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate() {
    const nextErrors = {};

    if (!form.title.trim()) nextErrors.title = "Title is required.";
    if (!form.dateTime) nextErrors.dateTime = "Please choose a date & time.";
    if (!form.host) nextErrors.host = "Please choose a host.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;

    const payload = {
      ...form,
      durationMinutes: Number(form.durationMinutes),
      reminderMinutesBefore: Number(form.reminderMinutesBefore),
    };

    if (mode === "create") {
      onSave({
        ...payload,
        id: Date.now(),
        status: "Scheduled",
        reminderNotified: false,
        createdAt: new Date().toISOString(),
      });
    } else {
      onSave({ ...meeting, ...payload });
    }

    handleClose();
  }

  function handleClose() {
    setErrors({});
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={mode === "create" ? "Schedule Meeting" : "Edit Meeting"}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>

          <Button onClick={handleSubmit}>
            {mode === "create" ? "Schedule Meeting" : "Save Changes"}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <Input
          label="Title"
          required
          value={form.title}
          error={errors.title}
          placeholder="e.g. Weekly Sales Sync"
          onChange={(e) => update("title", e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Follow-up Date
              </label>
        <DateSelector
                       mode="single"
                       includeTime
                       value={form.followUpDate}
                       onChange={(date) =>
                         update("datetime", date)
                       }
                     />
 </div>
          <Select
            label="Duration"
            options={DURATION_OPTIONS}
            value={form.durationMinutes}
            onChange={(e) => update("durationMinutes", e.target.value)}
          />
        </div>
        <SearchSelect
          label="Members"
          isMulti
          placeholder="Invite members..."
          searchPlaceholder="Search team members"
          options={MEMBER_OPTIONS}
          value={form.members}
          onChange={(value) => update("members", value)}
        />


        <Checkbox
          label="This is an online meeting"
          checked={form.isOnline}
          onChange={(e) => update("isOnline", e.target.checked)}
        />

        <Input
          label={form.isOnline ? "Meeting Link" : "Location"}
          placeholder={
            form.isOnline
              ? "https://meet.google.com/..."
              : "e.g. Conference Room A"
          }
          value={form.location}
          onChange={(e) => update("location", e.target.value)}
        />

        <Textarea
          label="Agenda"
          rows={3}
          placeholder="What is this meeting about?"
          value={form.agenda}
          onChange={(e) => update("agenda", e.target.value)}
        />
      </div>
    </Modal>
  );
}

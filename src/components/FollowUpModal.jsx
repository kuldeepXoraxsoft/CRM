
import { useEffect, useState } from "react";
import { History } from "lucide-react";

import { Modal, Button, Textarea } from "./ui";
import DateSelector from "./ui/DateSelector";
import { formatHistoryTimestamp } from "../utils/followUpUtils";

function formatFollowUpDateTime(value) {
  if (!value) return "Not set";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function toDateTimeLocalValue(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function FollowUpModal({
  isOpen,
  onClose,
  entity,
  onSave,
}) {
  const [newDate, setNewDate] = useState("");
  const [remark, setRemark] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && entity) {
      setNewDate(toDateTimeLocalValue(entity.followUpDate));
      setRemark("");
      setError("");
    }
  }, [isOpen, entity]);

  if (!entity) return null;

  const history = entity.followUpHistory || [];

  async function handleSubmit() {
    if (!newDate) {
      setError("Please select a follow-up date and time.");
      return;
    }

    if (!remark.trim()) {
      setError(
        "Please add a remark explaining this follow-up update."
      );
      return;
    }

    const selectedDate = new Date(newDate);

    if (Number.isNaN(selectedDate.getTime())) {
      setError(
        "Please select a valid follow-up date and time."
      );
      return;
    }

    const now = new Date();

    if (selectedDate < now) {
      setError(
        "Follow-up date and time cannot be in the past."
      );
      return;
    }

    const payload = {
      followUpDate: newDate,
      remark: remark.trim(),
    };

    setIsSaving(true);
    setError("");

    try {
      console.log("Follow-up payload:", payload);
      await onSave(payload);
      onClose();
    } catch (err) {
      console.error("Follow-up save failed:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to save follow-up. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Update Follow-up — ${entity.customerName}`}
      size="lg"
      footer={
        <>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Follow-up"}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Current Follow-up
            </label>

            <div className="rounded-md border border-border bg-canvas px-3 py-2 text-sm text-ink-muted">
              {formatFollowUpDateTime(entity.followUpDate)}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              New Follow-up{" "}
              <span className="text-danger-500">*</span>
            </label>

            <DateSelector
              mode="single"
              includeTime
              value={newDate}
              onChange={setNewDate}
              placeholder="Select date & time"
            />
          </div>
        </div>

        <Textarea
          label="Remark"
          required
          rows={3}
          placeholder="e.g. Client asked for 2 more days, will call again on new date"
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
        />

        {error && (
          <p className="text-xs font-medium text-danger-500">
            {error}
          </p>
        )}

        <div className="border-t border-border pt-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
            <History size={15} />
            <span>History ({history.length})</span>
          </div>

          {history.length === 0 ? (
            <p className="text-xs text-ink-faint">
              No follow-up changes yet.
            </p>
          ) : (
            <ul className="max-h-52 space-y-2.5 overflow-y-auto">
              {history.map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-md border border-border bg-canvas px-3 py-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-ink">
                      {formatFollowUpDateTime(entry.previousDate)}

                      <span className="text-ink-faint">
                        {" "}
                        &rarr;{" "}
                      </span>

                      {formatFollowUpDateTime(entry.newDate)}
                    </span>

                    <span className="text-[11px] text-ink-faint">
                      {formatHistoryTimestamp(entry.updatedAt)}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-ink-muted">
                    {entry.remark}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
}

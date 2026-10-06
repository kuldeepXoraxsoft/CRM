import { useEffect, useState } from "react";
import { History } from "lucide-react";

import { Modal, Button, Textarea } from "../components/ui";
import DateSelector from "../components/ui/DateSelector";
import { addFollowUpEntry, formatHistoryTimestamp } from "../utils/followUpUtils";

/**
 * Shared modal to update a lead's or account's follow-up date.
 * A remark is REQUIRED every time the date is changed, and every
 * change is appended to the entity's followUpHistory.
 *
 * Usage:
 * <FollowUpModal
 *   isOpen={isFollowUpModalOpen}
 *   onClose={() => setFollowUpModalOpen(false)}
 *   entity={selectedLeadOrAccount}   // needs: customerName, followUpDate, followUpHistory
 *   onSave={(updatedEntity) => handleSaveFollowUp(updatedEntity)}
 * />
 */
export default function FollowUpModal({ isOpen, onClose, entity, onSave }) {
  const [newDate, setNewDate] = useState("");
  const [remark, setRemark] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && entity) {
      setNewDate(entity.followUpDate || "");
      setRemark("");
      setError("");
    }
  }, [isOpen, entity]);

  if (!entity) return null;

  const history = entity.followUpHistory || [];

  function handleSubmit() {
    if (!newDate) {
      setError("Please select a follow-up date.");
      return;
    }

    if (!remark.trim()) {
      setError("Please add a remark explaining this follow-up update.");
      return;
    }

    const updatedEntity = addFollowUpEntry(entity, { newDate, remark });
    onSave(updatedEntity);
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Update Follow-up — ${entity.customerName}`}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save Follow-up</Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Current Follow-up Date
            </label>
            <div className="rounded-md border border-border bg-canvas px-3 py-2 text-sm text-ink-muted">
              {entity.followUpDate || "Not set"}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              New Follow-up Date <span className="text-danger-500">*</span>
            </label>
            <DateSelector mode="single" value={newDate} onChange={setNewDate} />
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

        {error && <p className="text-xs font-medium text-danger-500">{error}</p>}

        <div className="border-t border-border pt-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
            <History size={15} />
            <span>History ({history.length})</span>
          </div>

          {history.length === 0 ? (
            <p className="text-xs text-ink-faint">No follow-up changes yet.</p>
          ) : (
            <ul className="max-h-52 space-y-2.5 overflow-y-auto">
              {history.map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-md border border-border bg-canvas px-3 py-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-ink">
                      {entry.previousDate || "—"}{" "}
                      <span className="text-ink-faint">&rarr;</span> {entry.newDate}
                    </span>
                    <span className="text-[11px] text-ink-faint">
                      {formatHistoryTimestamp(entry.updatedAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-ink-muted">{entry.remark}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
}
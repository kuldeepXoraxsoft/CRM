import { useEffect, useState } from "react";
import { Modal, Button, UserSearchSelect } from "../../components/ui";

export default function AssignTicketModal({ isOpen, onClose, ticket, onAssign }) {
  const [assigneeId, setAssigneeId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) setAssigneeId(ticket?.assigneeId || null);
  }, [isOpen, ticket]);

  async function submit() {
    setSaving(true);
    try {
      await onAssign(assigneeId);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={ticket ? `Assign Ticket #${ticket.ticketNumber}` : "Assign Ticket"}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? "Assigning..." : "Assign Ticket"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-md bg-canvas p-3 text-sm">
          <div className="font-medium text-ink">{ticket?.title}</div>
          <div className="mt-1 text-ink-muted">#{ticket?.ticketNumber}</div>
        </div>
        <UserSearchSelect
          label="Assign To"
          purpose="assignment"
          value={assigneeId}
          onChange={setAssigneeId}
          placeholder="Search employee or manager..."
          clearable
        />
      </div>
    </Modal>
  );
}

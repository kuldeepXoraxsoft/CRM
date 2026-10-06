import { useEffect, useState } from "react";
import { Modal, Button, Input, Select, Textarea } from "../../components/ui";

const priorities = ["Low", "Medium", "High", "Urgent"].map((x) => ({ value: x, label: x }));
const statuses = ["Open", "In Progress", "Pending", "Resolved", "Closed"].map((x) => ({ value: x, label: x }));

const EMPTY = { title: "", description: "", priority: "Medium", status: "Open" };

export default function TicketModal({ isOpen, onClose, onSave, ticket = null }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setForm(ticket
      ? {
          title: ticket.title || "",
          description: ticket.description || "",
          priority: ticket.priority || "Medium",
          status: ticket.status || "Open",
        }
      : EMPTY
    );
  }, [isOpen, ticket]);

  async function submit() {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={ticket ? "Edit Ticket" : "Raise Ticket"}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? "Saving..." : ticket ? "Save Changes" : "Raise Ticket"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Issue / Title"
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Describe the issue briefly"
        />
        <Textarea
          label="Description"
          rows={5}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Describe the issue in detail..."
        />
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Priority"
            options={priorities}
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
          />
          <Select
            label="Status"
            options={statuses}
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          />
        </div>
      </div>
    </Modal>
  );
}

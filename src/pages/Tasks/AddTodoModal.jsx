import { useState } from "react";
import {
  Modal,
  Button,
  Input,
  Select,
  Textarea,
} from "../../components/ui";

const PRIORITY_OPTIONS = [
  {
    value: "high",
    label: "High",
  },
  {
    value: "medium",
    label: "Medium",
  },
  {
    value: "low",
    label: "Low",
  },
];

const STATUS_OPTIONS = [
  {
    value: "pending",
    label: "Pending",
  },
  {
    value: "in-progress",
    label: "In Progress",
  },
];

const INITIAL_FORM = {
  title: "",
  dueDate: "",
  priority: "medium",
  status: "pending",
  notes: "",
};

export default function AddTodoModal({
  isOpen,
  onClose,
  onCreate,
}) {
  const [form, setForm] = useState(INITIAL_FORM);

  const [errors, setErrors] = useState({});

  function update(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function resetForm() {
    setForm(INITIAL_FORM);
    setErrors({});
  }

  function handleSubmit() {
    const newErrors = {};

    if (!form.title.trim()) {
      newErrors.title = "Todo title is required.";
    }

    if (!form.dueDate) {
      newErrors.dueDate = "Please select a due date.";
    }

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    onCreate({
      id: Date.now(),
      ...form,
      completed: false,
    });

    resetForm();

    onClose();
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Personal Todo"
      size="md"
      footer={
        <>
          <Button
            variant="outline"
            onClick={handleClose}
          >
            Cancel
          </Button>

          <Button onClick={handleSubmit}>
            Save Todo
          </Button>
        </>
      }
    >
      <div className="space-y-5">

        <Input
          label="Title"
          placeholder="Finish quotation"
          value={form.title}
          onChange={(e) =>
            update("title", e.target.value)
          }
          error={errors.title}
          required
        />

        <Input
          type="date"
          label="Due Date"
          value={form.dueDate}
          onChange={(e) =>
            update("dueDate", e.target.value)
          }
          error={errors.dueDate}
          required
        />

        <Select
          label="Priority"
          options={PRIORITY_OPTIONS}
          value={form.priority}
          onChange={(e) =>
            update("priority", e.target.value)
          }
        />

        <Select
          label="Status"
          options={STATUS_OPTIONS}
          value={form.status}
          onChange={(e) =>
            update("status", e.target.value)
          }
        />

        <Textarea
          label="Notes"
          placeholder="Add reminder, meeting details or anything..."
          value={form.notes}
          onChange={(e) =>
            update("notes", e.target.value)
          }
          rows={5}
        />

      </div>
    </Modal>
  );
}
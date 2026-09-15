import { useEffect, useState } from "react";
import {
  Modal,
  Button,
  Input,
  Select,
  Textarea,
} from "../../components/ui";

import {
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
} from "../../data/Taskdata";

const EMPTY_FORM = {
  title: "",
  dueDate: "",
  priority: "Medium",
  status: "Pending",
  notes: "",
};

export default function TaskModal({
  isOpen,
  onClose,
  onSave,
  mode = "create",
  todo = null,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (mode === "edit" && todo) {
      setForm(todo);
    } else {
      setForm(EMPTY_FORM);
    }
  }, [mode, todo, isOpen]);

  function update(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function validate() {
    const nextErrors = {};

    if (!form.title.trim()) {
      nextErrors.title = "Title is required.";
    }

    if (!form.dueDate) {
      nextErrors.dueDate = "Please choose a due date.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;

    if (mode === "create") {
      onSave({
        ...form,
        id: Date.now(),
      });
    } else {
      onSave(form);
    }

    handleClose();
  }

  function handleClose() {
    setErrors({});
    setForm(EMPTY_FORM);
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        mode === "create"
          ? "Add Todo"
          : "Edit Todo"
      }
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
            {mode === "create"
              ? "Create Todo"
              : "Save Changes"}
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
          placeholder="Enter todo title"
          onChange={(e) =>
            update("title", e.target.value)
          }
        />

        <Input
          type="date"
          label="Due Date"
          required
          value={form.dueDate}
          error={errors.dueDate}
          onChange={(e) =>
            update("dueDate", e.target.value)
          }
        />

        <div className="grid grid-cols-2 gap-4">

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

        </div>

        <Textarea
          label="Notes"
          rows={5}
          placeholder="Write reminders or notes..."
          value={form.notes}
          onChange={(e) =>
            update("notes", e.target.value)
          }
        />

      </div>
    </Modal>
  );
}
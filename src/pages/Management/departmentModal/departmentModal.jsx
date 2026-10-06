import { useEffect, useState } from "react";

import {
  Modal,
  Button,
  Input,
} from "../../../components/ui";

export default function DepartmentModal({
  isOpen,
  onClose,
  mode,
  department,
  onSave,
}) {
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setName(department?.name || "");
    setIsSaving(false);
  }, [isOpen, department]);

  async function handleSubmit(e) {
    e.preventDefault();

    const cleanName = name.trim();

    if (!cleanName) return;

    try {
      setIsSaving(true);

      await onSave({
        name: cleanName,
      });
    } catch (err) {
      console.error(
        "Department save failed:",
        err
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        mode === "edit"
          ? "Edit Department"
          : "Add Department"
      }
      size="sm"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            form="department-form"
            disabled={isSaving}
          >
            {isSaving
              ? "Saving..."
              : mode === "edit"
              ? "Save Changes"
              : "Create Department"}
          </Button>
        </>
      }
    >
      <form
        id="department-form"
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <Input
          label="Department Name"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          placeholder="e.g. Sales"
          required
          autoFocus
        />
      </form>
    </Modal>
  );
}
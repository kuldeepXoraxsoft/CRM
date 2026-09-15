import { useEffect, useMemo, useState } from "react";

import {
  Modal,
  Button,
  Input,
  Select,
} from "../../../components/ui";

export default function AdminModal({
  isOpen,
  onClose,
  mode,
  admin,
  departments,
  onSave,
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    departmentId: "",
    status: "Active",
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setForm({
      name: admin?.name || "",
      email: admin?.email || "",
      password: "",
      departmentId: admin?.departmentId || "",
      status: admin?.status || "Active",
    });

    setIsSaving(false);
  }, [isOpen, admin]);

  const departmentOptions = useMemo(
    () =>
      departments.map((department) => ({
        value: department.id,
        label: department.name,
      })),
    [departments]
  );

  function updateField(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();

    if (!name || !email || !form.departmentId) {
      return;
    }

    if (
      mode === "create" &&
      !form.password
    ) {
      return;
    }

    try {
      setIsSaving(true);

      const payload = {
        name,
        email,
        departmentId: form.departmentId,
        status: form.status,
      };

      // Password required only while creating.
      if (mode === "create") {
        payload.password = form.password;
      }

      // While editing, send password only
      // when user entered a new one.
      if (
        mode === "edit" &&
        form.password
      ) {
        payload.password = form.password;
      }

      await onSave(payload);
    } catch (err) {
      console.error(
        "Admin save failed:",
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
          ? "Edit Admin"
          : "Add Admin"
      }
      size="md"
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
            form="admin-form"
            disabled={isSaving}
          >
            {isSaving
              ? "Saving..."
              : mode === "edit"
              ? "Save Changes"
              : "Create Admin"}
          </Button>
        </>
      }
    >
      <form
        id="admin-form"
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <Input
          label="Name"
          value={form.name}
          onChange={(e) =>
            updateField(
              "name",
              e.target.value
            )
          }
          placeholder="Enter admin name"
          required
          autoFocus
        />

        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) =>
            updateField(
              "email",
              e.target.value
            )
          }
          placeholder="admin@example.com"
          required
        />

        <Input
          label={
            mode === "create"
              ? "Password"
              : "New Password"
          }
          type="password"
          value={form.password}
          onChange={(e) =>
            updateField(
              "password",
              e.target.value
            )
          }
          placeholder={
            mode === "create"
              ? "Enter password"
              : "Leave empty to keep current password"
          }
          required={mode === "create"}
        />

        <Select
          label="Department"
          value={form.departmentId}
          onChange={(e) =>
            updateField(
              "departmentId",
              e.target.value
            )
          }
          options={departmentOptions}
          placeholder="Select department"
          required
        />

        <Select
          label="Status"
          value={form.status}
          onChange={(e) =>
            updateField(
              "status",
              e.target.value
            )
          }
          options={[
            {
              value: "Active",
              label: "Active",
            },
            {
              value: "Inactive",
              label: "Inactive",
            },
          ]}
          placeholder="Select status"
          required
        />
      </form>
    </Modal>
  );
}
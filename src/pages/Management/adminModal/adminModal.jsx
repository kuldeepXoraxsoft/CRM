
import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

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

  const [showPassword, setShowPassword] = useState(false);
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

    setShowPassword(false);
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

    if (!name || !email || !form.departmentId) return;

    if (mode === "create" && !form.password) return;

    try {
      setIsSaving(true);

      const payload = {
        name,
        email,
        departmentId: form.departmentId,
        status: form.status,
      };

      if (form.password) {
        payload.password = form.password;
      }

      await onSave(payload);
    } catch (err) {
      console.error("Admin save failed:", err);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "edit" ? "Edit Admin" : "Add Admin"}
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
          onChange={(e) => updateField("name", e.target.value)}
          placeholder="Enter admin name"
          required
          autoFocus
        />

        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          placeholder="admin@example.com"
          required
        />

        {/* Password with show/hide toggle */}
       <div className="relative">
  <Input
    label={mode === "create" ? "Password" : "New Password"}
    type={showPassword ? "text" : "password"}
    value={form.password}
    onChange={(e) => updateField("password", e.target.value)}
    placeholder={
      mode === "create"
        ? "Enter password"
        : "Leave empty to keep current password"
    }
    required={mode === "create"}
  />

  <button
    type="button"
    onClick={() => setShowPassword((prev) => !prev)}
    className="absolute right-3 top-[45px] -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-surface-subtle hover:text-ink"
    aria-label={showPassword ? "Hide password" : "Show password"}
  >
    {showPassword ? (
      <EyeOff size={18} strokeWidth={1.8} />
    ) : (
      <Eye size={18} strokeWidth={1.8} />
    )}
  </button>
</div>

        <Select
          label="Department"
          value={form.departmentId}
          onChange={(e) => updateField("departmentId", e.target.value)}
          options={departmentOptions}
          placeholder="Select department"
          required
        />

        <Select
          label="Status"
          value={form.status}
          onChange={(e) => updateField("status", e.target.value)}
          options={[
            { value: "Active", label: "Active" },
            { value: "Inactive", label: "Inactive" },
          ]}
          placeholder="Select status"
          required
        />
      </form>
    </Modal>
  );
}

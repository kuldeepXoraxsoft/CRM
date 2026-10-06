import { useEffect, useState } from "react";
import { Modal, Button, Input, Select } from "../components/ui";

import {
  createEmptyEmployee,
  EMPLOYEE_ROLE_OPTIONS,
  EMPLOYEE_STATUS_OPTIONS,
} from "../data/Employeedata";

import { ROLES } from "../utils/roles";
import { useEmployees } from "../hooks/useEmployees";
import { useTeams } from "../hooks/useTeams";
import { useAuth } from "../context/AuthContext";

export default function EmployeeModal({
  isOpen,
  onClose,
  mode,
  employee,
  onSave,
}) {
  const { getManagers } = useEmployees();
  const { teams } = useTeams();
  const { currentUser } = useAuth();

  const [form, setForm] = useState(createEmptyEmployee());
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;

    if (mode === "edit" && employee) {
      setForm(employee);
    } else {
      const base = createEmptyEmployee();

      if (currentUser?.role === ROLES.MANAGER) {
        base.managerId = currentUser.id;
        base.teamId = currentUser.teamId || "";
      }

      setForm(base);
    }

    setErrors({});
  }, [isOpen, mode, employee, currentUser]);

  function update(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function validate() {
    const nextErrors = {};

    if (!form.name?.trim()) {
      nextErrors.name = "Name is required.";
    }

    if (!form.email?.trim()) {
      nextErrors.email = "Email is required.";
    }

    if (mode === "create" && !form.password?.trim()) {
      nextErrors.password = "A temporary password is required.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;

    onSave(form);
    onClose();
  }

  const managers = getManagers();

  const managerOptions = [
    {
      value: "",
      label: "None",
    },
    ...managers.map((manager) => ({
      value: manager.id,
      label: manager.name,
    })),
  ];

  const teamOptions = [
    {
      value: "",
      label: "None",
    },
    ...teams.map((team) => ({
      value: team.id,
      label: team.name,
    })),
  ];

  const roleOptions =
    currentUser?.role === ROLES.MANAGER
      ? EMPLOYEE_ROLE_OPTIONS.filter(
          (option) => option.value === ROLES.EMPLOYEE
        )
      : EMPLOYEE_ROLE_OPTIONS;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "edit" ? "Edit Employee" : "Add New Employee"}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <Button onClick={handleSubmit}>
            {mode === "edit" ? "Save Changes" : "Add Employee"}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        {/* Name */}
        <Input
          label="Name"
          required
          value={form.name || ""}
          error={errors.name}
          onChange={(e) => update("name", e.target.value)}
        />

        {/* Email */}
        <Input
          label="Email"
          type="email"
          required
          value={form.email || ""}
          error={errors.email}
          onChange={(e) => update("email", e.target.value)}
        />

        {/* Password */}
        {mode === "create" && (
          <Input
            label="Temporary Password"
            type="text"
            required
            value={form.password || ""}
            error={errors.password}
            placeholder="They can change this after logging in"
            onChange={(e) => update("password", e.target.value)}
          />
        )}

        {/* Role */}
        <Select
          label="Role"
          options={roleOptions}
          value={form.role || ""}
          onChange={(e) => update("role", e.target.value)}
          disabled={currentUser?.role !== ROLES.ADMIN}
        />

        {/* Status */}
        <Select
          label="Status"
          options={EMPLOYEE_STATUS_OPTIONS}
          value={form.status || ""}
          onChange={(e) => update("status", e.target.value)}
        />

        {/* Reports To */}
        {form.role !== ROLES.MANAGER && (
          <Select
            label="Reports To"
            options={managerOptions}
            value={form.managerId || ""}
            onChange={(e) => update("managerId", e.target.value)}
            disabled={currentUser?.role === ROLES.MANAGER}
          />
        )}

        {/* Team */}
        {form.role !== ROLES.MANAGER && (
          <Select
            label="Team"
            options={teamOptions}
            value={form.teamId || ""}
            onChange={(e) => update("teamId", e.target.value)}
          />
        )}
      </div>
    </Modal>
  );
}
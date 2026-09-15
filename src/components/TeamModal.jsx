import { useEffect, useState } from "react";
import { Modal, Button, Input, Select } from "../components/ui";

import { createEmptyTeam } from "../data/Teamdata";
import { useEmployees } from "../hooks/useEmployees";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../utils/roles";

export default function TeamModal({ isOpen, onClose, mode, team, onSave }) {
  const { employees, getManagers } = useEmployees();
  const { currentUser } = useAuth();

  const [form, setForm] = useState(createEmptyTeam());
  const [errors, setErrors] = useState({});

 useEffect(() => {
  if (!isOpen) return;

  if (mode === "edit" && team) {
    setForm({
      id: team.id,
      name: team.name || "",
      managerId: team.manager?.id || team.managerId || "",
      memberIds: team.members
        ? team.members.map((member) => member.id)
        : team.memberIds || [],
    });
  } else {
    const base = createEmptyTeam();

    if (currentUser?.role === ROLES.MANAGER) {
      base.managerId = currentUser.id;
    }

    setForm(base);
  }

  setErrors({});
}, [isOpen, mode, team, currentUser]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleMember(employeeId) {
    setForm((prev) => {
      const isSelected = prev.memberIds.includes(employeeId);
      return {
        ...prev,
        memberIds: isSelected
          ? prev.memberIds.filter((id) => id !== employeeId)
          : [...prev.memberIds, employeeId],
      };
    });
  }

  function validate() {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Team name is required.";
    if (!form.managerId) nextErrors.managerId = "Please pick a manager.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;

    try {
      await onSave(form);
      onClose();
    } catch (err) {
      console.error("Team save failed:", err);
    }
  }

  const managers = getManagers();
  const managerOptions = managers.map((m) => ({ value: m.id, label: m.name }));

  const availableEmployees = employees.filter(
    (emp) => emp.role === ROLES.EMPLOYEE && emp.managerId === form.managerId
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "edit" ? "Edit Team" : "Create New Team"}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {mode === "edit" ? "Save Changes" : "Create Team"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          label="Team Name"
          required
          value={form.name}
          error={errors.name}
          placeholder="e.g. Sales - APAC"
          onChange={(e) => update("name", e.target.value)}
        />

        <Select
          label="Manager"
          options={managerOptions}
          value={form.managerId}
          error={errors.managerId}
          onChange={(e) => update("managerId", e.target.value)}
          disabled={currentUser?.role === ROLES.MANAGER}
        />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Team Members</label>

          {availableEmployees.length === 0 ? (
            <p className="text-xs text-ink-faint">
              No employees reporting to this manager yet — add employees first.
            </p>
          ) : (
            <div className="flex flex-col gap-1.5 rounded-md border border-border p-2.5">
              {availableEmployees.map((emp) => (
                <label
                  key={emp.id}
                  className="flex items-center gap-2 rounded px-1.5 py-1 text-sm hover:bg-canvas"
                >
                  <input
                    type="checkbox"
                    checked={form.memberIds.includes(emp.id)}
                    onChange={() => toggleMember(emp.id)}
                  />
                  <span className="text-ink">{emp.name}</span>
                  <span className="text-ink-faint">({emp.email})</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
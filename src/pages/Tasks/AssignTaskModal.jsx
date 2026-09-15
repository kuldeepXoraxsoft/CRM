import { useEffect, useState } from "react";
import { Modal, Button, Input, Select, Textarea } from "../../components/ui";
import DateSelector from "../../components/ui/DateSelector";

import { useEmployees } from "../../hooks/useEmployees";
import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../utils/roles";

const PRIORITY_OPTIONS = [
  { value: "High", label: "High" },
  { value: "Medium", label: "Medium" },
  { value: "Low", label: "Low" },
];

const EMPTY_FORM = {
  title: "",
  managerNotes: "",
  priority: "Medium",
  dueDate: "",
  assigneeId: "",
};

/**
 * Manager/Admin only - creates a new task and assigns it to an employee.
 * Route-gate this with can("ASSIGN_TASK") wherever it's opened from.
 */
export default function AssignTaskModal({ isOpen, onClose, onSave }) {
  const { getVisibleEmployees } = useEmployees();
  const { currentUser } = useAuth();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setForm(EMPTY_FORM);
      setErrors({});
    }
  }, [isOpen]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate() {
    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = "Task title is required.";
    if (!form.assigneeId) nextErrors.assigneeId = "Please pick who to assign this to.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    onSave(form);
    onClose();
  }

  // Employees this manager/admin can assign to - direct reports (or
  // anyone, for admin).
  const employeeOptions = getVisibleEmployees(currentUser)
    .filter((emp) => emp.role === ROLES.EMPLOYEE)
    .map((emp) => ({ value: emp.id, label: emp.name }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign New Task"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Assign Task</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          label="Task Title"
          required
          value={form.title}
          error={errors.title}
          placeholder="e.g. Follow up on Digintra Germany route"
          onChange={(e) => update("title", e.target.value)}
        />

        <Select
          label="Assign To"
          options={employeeOptions}
          value={form.assigneeId}
          error={errors.assigneeId}
          onChange={(e) => update("assigneeId", e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Priority"
            options={PRIORITY_OPTIONS}
            value={form.priority}
            onChange={(e) => update("priority", e.target.value)}
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Due Date</label>
            <DateSelector
              mode="single"
              value={form.dueDate}
              onChange={(date) => update("dueDate", date)}
            />
          </div>
        </div>

        <Textarea
          label="Instructions"
          rows={4}
          placeholder="Any context or instructions for the employee..."
          value={form.managerNotes}
          onChange={(e) => update("managerNotes", e.target.value)}
        />
      </div>
    </Modal>
  );
}
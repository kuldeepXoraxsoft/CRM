import { useEffect, useState } from "react";
import { Modal, Button, Select, Badge } from "../../components/ui";
import { User, CalendarDays, Flag, Repeat } from "lucide-react";

import CommentsThread from "../../components/Commentsthread";

import { STATUS_OPTIONS } from "../../data/Taskdata";
import { tasksApi } from "../../api/Tasksapi";
import { toDateInputValue } from "../../utils/formateDate";
import { useEmployees } from "../../hooks/useEmployees";
import { useAuth } from "../../context/AuthContext";
import { useActivity } from "../../hooks/useActivity";

const PRIORITY_VARIANT = {
  High: "danger",
  Medium: "warning",
  Low: "success",
};

export default function AssignedTaskModal({ isOpen, onClose, task, onSave }) {
  const { getVisibleEmployees, getEmployeeName } = useEmployees();
  const { currentUser, can } = useAuth();
  const { logActivity } = useActivity();

  const [status, setStatus] = useState("Pending");
  const [assigneeId, setAssigneeId] = useState("");
  const [comments, setComments] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setStatus(task.status);
      setAssigneeId(task.assigneeId || "");
      setComments(task.comments || []);
    }
  }, [task]);

  if (!task) return null;

  // Comments post immediately via their own inline submit in
  // CommentsThread, independent of the modal's main Save button.
  async function handleAddComment(text) {
    const updatedTask = await tasksApi.addComment(task.id, text);
    setComments(updatedTask.comments || []);
    onSave(updatedTask);
  }

  async function handleSubmit() {
    setIsSaving(true);
    try {
      let latestTask = task;

      if (status !== task.status) {
        latestTask = await tasksApi.updateStatus(task.id, status);
      }

      if (can("REASSIGN_TASK") && assigneeId && assigneeId !== task.assigneeId) {
        latestTask = await tasksApi.reassign(task.id, assigneeId);
        logActivity();
      }

      onSave({ ...latestTask, comments });
      onClose();
    } finally {
      setIsSaving(false);
    }
  }

  const reassignOptions = getVisibleEmployees(currentUser)
    .filter((emp) => emp.role === "employee" || emp.id === currentUser?.id)
    .map((emp) => ({ value: emp.id, label: emp.name }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Task Details"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="rounded-lg border border-border bg-canvas p-5">
          <h3 className="text-lg font-semibold text-ink">{task.title}</h3>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-2 text-sm">
              <User size={16} className="text-primary-600" />
              <span className="text-ink-muted">Assigned By</span>
              <strong>{task.assignedBy?.name}</strong>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <CalendarDays size={16} className="text-primary-600" />
              <span className="text-ink-muted">Due Date</span>
              <strong>{toDateInputValue(task.dueDate) || "-"}</strong>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Flag size={16} className="text-primary-600" />
              <span className="text-ink-muted">Priority</span>
              <Badge variant={PRIORITY_VARIANT[task.priority]}>{task.priority}</Badge>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <User size={16} className="text-primary-600" />
              <span className="text-ink-muted">Assigned To</span>
              <strong>{task.assignee?.name || getEmployeeName(task.assigneeId) || "Unassigned"}</strong>
            </div>
          </div>
        </div>

        <div>
          <h4 className="mb-2 font-semibold text-ink">Manager Instructions</h4>
          <div className="rounded-lg border border-border bg-primary-50 p-4">
            <p className="text-sm leading-6 text-ink-muted">{task.managerNotes}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Task Status"
            options={STATUS_OPTIONS}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          />

          {can("REASSIGN_TASK") && (
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-ink">
                <Repeat size={14} /> Reassign To
              </label>
              <Select
                options={reassignOptions}
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
              />
            </div>
          )}
        </div>

        <div>
          <h4 className="mb-2 font-semibold text-ink">Updates</h4>
          <CommentsThread
            comments={comments}
            currentUserName={currentUser?.name}
            onAddComment={handleAddComment}
          />
        </div>
      </div>
    </Modal>
  );
}
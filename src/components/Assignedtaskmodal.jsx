import { useEffect, useState } from "react";
import { Modal, Button, Select, Badge } from "../../components/ui";
import { User, CalendarDays, Flag, Repeat } from "lucide-react";

import CommentsThread from "../../components/CommentsThread";

import { STATUS_OPTIONS } from "../../data/taskData";
import { useEmployees } from "../../context/EmployeesContext";
import { useAuth } from "../../context/AuthContext";
import { useActivity } from "../../context/ActivityContext";

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

  useEffect(() => {
    if (task) {
      setStatus(task.status);
      setAssigneeId(task.assigneeId || "");
      setComments(task.comments || []);
    }
  }, [task]);

  if (!task) return null;

  function handleAddComment(text) {
    const newComment = {
      id: `cmt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      authorName: currentUser.name,
      text,
      createdAt: new Date().toISOString(),
    };
    setComments((prev) => [...prev, newComment]);
  }

  function handleSubmit() {
    const reassigned = assigneeId && assigneeId !== task.assigneeId;

    onSave({
      ...task,
      status,
      assigneeId,
      comments,
    });

    if (reassigned) {
      logActivity({
        message: `${currentUser.name} reassigned "${task.title}" to ${getEmployeeName(assigneeId)}`,
        type: "task",
        departmentId:currentUser.departmentId,
      });
    }

    onClose();
  }

  // Employees this manager/admin can reassign the task to.
  const reassignOptions = getVisibleEmployees(currentUser)
    .filter((emp) => emp.role === "employee" || emp.id === currentUser.id)
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
          <Button onClick={handleSubmit}>Save</Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Task Information */}
        <div className="rounded-lg border border-border bg-canvas p-5">
          <h3 className="text-lg font-semibold text-ink">{task.title}</h3>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-2 text-sm">
              <User size={16} className="text-primary-600" />
              <span className="text-ink-muted">Assigned By</span>
              <strong>{task.assignedBy}</strong>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <CalendarDays size={16} className="text-primary-600" />
              <span className="text-ink-muted">Due Date</span>
              <strong>{task.dueDate}</strong>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Flag size={16} className="text-primary-600" />
              <span className="text-ink-muted">Priority</span>
              <Badge variant={PRIORITY_VARIANT[task.priority]}>{task.priority}</Badge>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <User size={16} className="text-primary-600" />
              <span className="text-ink-muted">Assigned To</span>
              <strong>{getEmployeeName(task.assigneeId) || "Unassigned"}</strong>
            </div>
          </div>
        </div>

        {/* Manager Notes */}
        <div>
          <h4 className="mb-2 font-semibold text-ink">Manager Instructions</h4>
          <div className="rounded-lg border border-border bg-primary-50 p-4">
            <p className="text-sm leading-6 text-ink-muted">{task.managerNotes}</p>
          </div>
        </div>

        {/* Status + Reassign */}
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

        {/* Follow-up Comments */}
        <div>
          <h4 className="mb-2 font-semibold text-ink">Updates</h4>
          <CommentsThread
            comments={comments}
            currentUserName={currentUser.name}
            onAddComment={handleAddComment}
          />
        </div>
      </div>
    </Modal>
  );
}
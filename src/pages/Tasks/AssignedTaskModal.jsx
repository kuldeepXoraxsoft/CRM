import { useEffect, useState } from "react";
import {
  Modal,
  Button,
  Select,
  Textarea,
  Badge,
} from "../../components/ui";

import { User, CalendarDays, Flag } from "lucide-react";

import { STATUS_OPTIONS } from "../../data/taskData";

const PRIORITY_VARIANT = {
  High: "danger",
  Medium: "warning",
  Low: "success",
};

export default function AssignedTaskModal({
  isOpen,
  onClose,
  task,
  onSave,
}) {
  const [status, setStatus] = useState("Pending");
  const [employeeUpdate, setEmployeeUpdate] = useState("");

  useEffect(() => {
    if (task) {
      setStatus(task.status);
      setEmployeeUpdate(task.employeeUpdate || "");
    }
  }, [task]);

  if (!task) return null;

  function handleSubmit() {
    onSave({
      ...task,
      status,
      employeeUpdate,
    });

    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Task Details"
      size="lg"
      footer={
        <>
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button onClick={handleSubmit}>
            Save Update
          </Button>
        </>
      }
    >
      <div className="space-y-6">

        {/* Task Information */}

        <div className="rounded-lg border border-border bg-canvas p-5">

          <h3 className="text-lg font-semibold text-ink">
            {task.title}
          </h3>

          <div className="mt-4 grid gap-4 md:grid-cols-2">

            <div className="flex items-center gap-2 text-sm">

              <User
                size={16}
                className="text-primary-600"
              />

              <span className="text-ink-muted">
                Assigned By
              </span>

              <strong>{task.assignedBy}</strong>

            </div>

            <div className="flex items-center gap-2 text-sm">

              <CalendarDays
                size={16}
                className="text-primary-600"
              />

              <span className="text-ink-muted">
                Due Date
              </span>

              <strong>{task.dueDate}</strong>

            </div>

            <div className="flex items-center gap-2 text-sm">

              <Flag
                size={16}
                className="text-primary-600"
              />

              <span className="text-ink-muted">
                Priority
              </span>

              <Badge
                variant={
                  PRIORITY_VARIANT[
                    task.priority
                  ]
                }
              >
                {task.priority}
              </Badge>

            </div>

          </div>

        </div>

        {/* Manager Notes */}

        <div>

          <h4 className="mb-2 font-semibold text-ink">
            Manager Instructions
          </h4>

          <div className="rounded-lg border border-border bg-primary-50 p-4">

            <p className="text-sm text-ink-muted leading-6">
              {task.managerNotes}
            </p>

          </div>

        </div>

        {/* Status */}

        <Select
          label="Task Status"
          options={STATUS_OPTIONS}
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
        />

        {/* Employee Update */}

        <Textarea
          label="Your Update"
          rows={6}
          placeholder="Write today's progress..."
          value={employeeUpdate}
          onChange={(e) =>
            setEmployeeUpdate(
              e.target.value
            )
          }
        />

      </div>
    </Modal>
  );
}
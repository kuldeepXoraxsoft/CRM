import { useState } from "react";
import {
  CalendarDays,
  User,
  ClipboardList,
} from "lucide-react";

import {
  Badge,
  Button,
  Select,
  Textarea,
} from "../../components/ui";

const STATUS_OPTIONS = [
  {
    value: "pending",
    label: "Pending",
  },
  {
    value: "in-progress",
    label: "In Progress",
  },
  {
    value: "completed",
    label: "Completed",
  },
];

const PRIORITY_VARIANT = {
  high: "danger",
  medium: "warning",
  low: "success",
};

export default function AssignedTaskCard({
  task,
  onStatusChange,
  onEmployeeUpdate,
}) {
  const [status, setStatus] = useState(task.status);

  const [update, setUpdate] = useState(
    task.employeeUpdate || ""
  );

  function handleSave() {
    onStatusChange(task.id, status);
    onEmployeeUpdate(task.id, update);
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm transition hover:shadow-md">

      {/* Header */}

      <div className="flex items-start justify-between">

        <div>

          <h3 className="text-lg font-semibold text-ink">
            {task.title}
          </h3>

          <div className="mt-2 flex gap-2">

            <Badge
              variant={PRIORITY_VARIANT[task.priority]}
            >
              {task.priority}
            </Badge>

            <Badge variant="primary">
              Assigned
            </Badge>

          </div>

        </div>

      </div>

      {/* Assigned By */}

      <div className="mt-5 flex items-center gap-2 text-sm text-ink-muted">

        <User size={16} />

        <span>
          Assigned by{" "}
          <strong>{task.assignedBy}</strong>
        </span>

      </div>

      {/* Due Date */}

      <div className="mt-3 flex items-center gap-2 text-sm text-ink-muted">

        <CalendarDays size={16} />

        <span>
          Due: {task.dueDate}
        </span>

      </div>

      {/* Manager Instructions */}

      <div className="mt-6 rounded-lg bg-primary-50 p-4">

        <div className="flex items-center gap-2">

          <ClipboardList
            size={17}
            className="text-primary-600"
          />

          <h4 className="font-medium text-primary-700">
            Manager Instructions
          </h4>

        </div>

        <p className="mt-2 text-sm text-ink-muted">
          {task.instructions}
        </p>

      </div>

      {/* Status */}

      <div className="mt-6">

        <Select
          label="Task Status"
          value={status}
          options={STATUS_OPTIONS}
          onChange={(e) =>
            setStatus(e.target.value)
          }
        />

      </div>

      {/* Employee Update */}

      <div className="mt-5">

        <Textarea
          label="Your Update"
          placeholder="Write your progress..."
          value={update}
          onChange={(e) =>
            setUpdate(e.target.value)
          }
          rows={4}
        />

      </div>

      <div className="mt-5 flex justify-end">

        <Button onClick={handleSave}>
          Save Update
        </Button>

      </div>

    </div>
  );
}
import {
  CalendarDays,
  User,
  FileText,
  Eye,
} from "lucide-react";

import { Badge, Button } from "../../components/ui";

const PRIORITY_VARIANT = {
  High: "danger",
  Medium: "warning",
  Low: "success",
};

const STATUS_VARIANT = {
  Pending: "warning",
  "In Progress": "primary",
  Completed: "success",
};

export default function AssignedTaskListItem({
  task,
  onView,
}) {
  return (
    <div className="border-b border-border px-5 py-4 transition hover:bg-canvas">

      <div className="flex items-start justify-between gap-4">

        {/* Left */}

        <div className="min-w-0 flex-1">

          <h3 className="font-semibold text-ink">
            {task.title}
          </h3>

          <div className="mt-3 flex flex-wrap items-center gap-5 text-sm text-ink-muted">

            <div className="flex items-center gap-2">
              <User size={15} />
              {task.assignedBy}
            </div>

            <div className="flex items-center gap-2">
              <CalendarDays size={15} />
              {task.dueDate}
            </div>

            <Badge
              variant={
                PRIORITY_VARIANT[
                  task.priority
                ]
              }
            >
              {task.priority}
            </Badge>

            <Badge
              variant={
                STATUS_VARIANT[
                  task.status
                ]
              }
            >
              {task.status}
            </Badge>

          </div>

          {/* Manager Notes */}

          <div className="mt-3 flex items-start gap-2">

            <FileText
              size={15}
              className="mt-0.5 shrink-0 text-primary-600"
            />

            <div className="text-sm">

              <span className="font-medium text-ink">
                Manager:
              </span>

              <p className="text-ink-muted line-clamp-2">
                {task.managerNotes}
              </p>

            </div>

          </div>

          {/* Employee Update */}

          {task.employeeUpdate && (
            <div className="mt-3 rounded-md border border-primary-100 bg-primary-50 p-3">

              <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">
                Your Latest Update
              </p>

              <p className="mt-1 text-sm text-ink-muted line-clamp-2">
                {task.employeeUpdate}
              </p>

            </div>
          )}

        </div>

        {/* Right */}

        <Button
          size="sm"
          variant="outline"
          leftIcon={<Eye size={15} />}
          onClick={() => onView(task)}
        >
          View / Update
        </Button>

      </div>

    </div>
  );
}
import {
  CalendarDays,
  FileText,
  Pencil,
  Trash2,
  CheckCircle2,
  Circle,
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

export default function TodoListItem({
  todo,
  onToggleComplete,
  onEdit,
  onDelete,
}) {
  return (
    <div className="border-b border-border px-5 py-4 transition hover:bg-canvas">

      <div className="flex items-start justify-between gap-4">

        {/* Left */}

        <div className="flex flex-1 gap-4">

          <button
            type="button"
            onClick={() => onToggleComplete(todo.id)}
            className="mt-1"
          >
            {todo.status === "Completed" ? (
              <CheckCircle2
                size={22}
                className="text-success-500"
              />
            ) : (
              <Circle
                size={22}
                className="text-ink-faint hover:text-primary-500"
              />
            )}
          </button>

          <div className="min-w-0 flex-1">

            <h3
              className={`font-semibold ${
                todo.status === "Completed"
                  ? "line-through text-ink-faint"
                  : "text-ink"
              }`}
            >
              {todo.title}
            </h3>

            <div className="mt-2 flex flex-wrap items-center gap-5 text-sm text-ink-muted">

              <div className="flex items-center gap-2">
                <CalendarDays size={15} />
                {todo.dueDate}
              </div>

              <Badge
                variant={
                  PRIORITY_VARIANT[
                    todo.priority
                  ]
                }
              >
                {todo.priority}
              </Badge>

              <Badge
                variant={
                  STATUS_VARIANT[
                    todo.status
                  ]
                }
              >
                {todo.status}
              </Badge>

            </div>

            {todo.notes && (
              <div className="mt-3 flex items-start gap-2 text-sm text-ink-muted">

                <FileText
                  size={15}
                  className="mt-0.5 shrink-0"
                />

                <p className="line-clamp-2">
                  {todo.notes}
                </p>

              </div>
            )}

          </div>

        </div>

        {/* Right */}

        <div className="flex items-center gap-2">

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(todo)}
          >
            <Pencil size={16} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(todo.id)}
          >
            <Trash2
              size={16}
              className="text-danger-500"
            />
          </Button>

        </div>

      </div>

    </div>
  );
}
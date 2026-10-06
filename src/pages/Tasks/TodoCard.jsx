import { useState } from "react";
import {
  CalendarDays,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
} from "lucide-react";

import {
  Badge,
  Button,
  Textarea,
} from "../../components/ui";

const PRIORITY_VARIANT = {
  high: "danger",
  medium: "warning",
  low: "success",
};

const STATUS_VARIANT = {
  pending: "warning",
  "in-progress": "primary",
  completed: "success",
};

export default function TodoCard({
  todo,
  onToggleComplete,
  onDelete,
  onUpdateNotes,
  onEdit,
}) {
  const [expanded, setExpanded] = useState(false);

  const [notes, setNotes] = useState(todo.notes);

  function saveNotes() {
    onUpdateNotes(todo.id, notes);
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm transition hover:shadow-md">

      {/* Header */}

      <div className="flex items-start justify-between">

        <div className="flex gap-3">

          <button
            onClick={() => onToggleComplete(todo.id)}
            className="mt-1"
          >
            {todo.completed ? (
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

          <div>

            <h3
              className={`font-semibold ${
                todo.completed
                  ? "line-through text-ink-faint"
                  : "text-ink"
              }`}
            >
              {todo.title}
            </h3>

            <div className="mt-2 flex flex-wrap gap-2">

              <Badge
                variant={PRIORITY_VARIANT[todo.priority]}
              >
                {todo.priority}
              </Badge>

              <Badge
                variant={STATUS_VARIANT[todo.status]}
              >
                {todo.status}
              </Badge>

            </div>

          </div>

        </div>

        <div className="flex gap-1">

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

      {/* Due Date */}

      <div className="mt-4 flex items-center gap-2 text-sm text-ink-muted">

        <CalendarDays size={16} />

        <span>
          Due: {todo.dueDate}
        </span>

      </div>

      {/* Notes */}

      <div className="mt-5 border-t border-border pt-4">

        <button
          onClick={() =>
            setExpanded((prev) => !prev)
          }
          className="flex w-full items-center justify-between font-medium text-ink"
        >
          Notes

          {expanded ? (
            <ChevronUp size={18} />
          ) : (
            <ChevronDown size={18} />
          )}
        </button>

        {expanded && (
          <div className="mt-4 space-y-3">

            <Textarea
              rows={4}
              value={notes}
              onChange={(e) =>
                setNotes(e.target.value)
              }
              placeholder="Write reminders..."
            />

            <div className="flex justify-end">

              <Button
                size="sm"
                onClick={saveNotes}
              >
                Save Notes
              </Button>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
import { Phone, Mail, Users, RotateCcw, Trash2 } from 'lucide-react'
import { cn } from '../../lib/cn'
import { Badge, Avatar } from '../../components/ui'
import { TEAM_MEMBERS } from '../../data/mockData'

const TYPE_ICON = {
  call: Phone,
  email: Mail,
  meeting: Users,
  'follow-up': RotateCcw,
}

const PRIORITY_VARIANT = {
  high: 'danger',
  medium: 'warning',
  low: 'neutral',
}

function formatDueDate(dueDate, status) {
  const due = new Date(dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)
  const diffDays = Math.round((due - today) / 86400000)

  let label
  if (diffDays === 0) label = 'Today'
  else if (diffDays === -1) label = 'Yesterday'
  else if (diffDays === 1) label = 'Tomorrow'
  else
    label = due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

  const isOverdue = diffDays < 0 && status !== 'completed'
  const isToday = diffDays === 0 && status !== 'completed'

  return { label, isOverdue, isToday }
}

/**
 * TaskRow - one row in the TaskQueue list.
 *
 * Props:
 * - task: { id, title, type, relatedTo, priority, dueDate, assignee, status }
 * - onToggleComplete(id)
 * - onDelete(id)
 */
export default function TaskRow({ task, onToggleComplete, onDelete }) {
  const TypeIcon = TYPE_ICON[task.type] ?? RotateCcw
  const isCompleted = task.status === 'completed'
  const { label: dueLabel, isOverdue, isToday } = formatDueDate(task.dueDate, task.status)
  const assignee = TEAM_MEMBERS.find((m) => m.value === task.assignee)

  return (
    <div className="group flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0 hover:bg-canvas">
      <button
        type="button"
        onClick={() => onToggleComplete(task.id)}
        aria-label={isCompleted ? 'Mark as pending' : 'Mark as complete'}
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
          isCompleted
            ? 'border-primary-500 bg-primary-500 text-white'
            : 'border-border-strong hover:border-primary-500',
        )}
      >
        {isCompleted && (
          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none">
            <path d="M2 6l2.5 2.5L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-canvas text-ink-faint">
        <TypeIcon size={15} />
      </span>

      <div className="min-w-0 flex-1">
        <p className={cn('truncate text-sm font-medium', isCompleted ? 'text-ink-faint line-through' : 'text-ink')}>
          {task.title}
        </p>
        <p className="truncate text-xs text-ink-muted">{task.relatedTo}</p>
      </div>

      <Badge variant={PRIORITY_VARIANT[task.priority]} size="sm" className="hidden sm:inline-flex">
        {task.priority}
      </Badge>

      <span
        className={cn(
          'hidden w-20 shrink-0 text-xs font-medium sm:block',
          isOverdue ? 'text-danger-500' : isToday ? 'text-warning-600' : 'text-ink-muted',
        )}
      >
        {dueLabel}
      </span>

      {assignee && <Avatar name={assignee.label} size="sm" className="hidden md:flex" />}

      <button
        type="button"
        onClick={() => onDelete(task.id)}
        aria-label="Delete task"
        className="text-ink-faint opacity-0 hover:text-danger-500 group-hover:opacity-100"
      >
        <Trash2 size={15} />
      </button>
    </div>
  )
}

import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { cn } from '../../lib/cn'

export default function StatCard({
  label,
  value,
  change,
  trend = 'up',
  icon,
  onClick,
}) {
  const isUp = trend === 'up'

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onClick()
        }
      }}
      className={cn(
        'rounded-lg border border-border bg-surface p-5',
        onClick &&
          'cursor-pointer transition-all hover:border-primary-500 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm text-ink-muted">{label}</p>
        {icon && <span className="text-ink-faint">{icon}</span>}
      </div>

      <p className="mt-2 text-2xl font-semibold text-ink">
        {value}
      </p>

      {change && (
        <p
          className={cn(
            'mt-1 flex items-center gap-1 text-xs font-medium',
            isUp ? 'text-success-600' : 'text-danger-500',
          )}
        >
          {isUp ? (
            <ArrowUpRight size={14} />
          ) : (
            <ArrowDownRight size={14} />
          )}
          {change}
          <span className="font-normal text-ink-faint">
            vs last month
          </span>
        </p>
      )}
    </div>
  )
}

import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { cn } from '../../lib/cn'

/**
 * StatCard - a single KPI card for the dashboard header row.
 *
 * Props:
 * - label: string
 * - value: string / number
 * - change: string, e.g. "+8.2%"
 * - trend: 'up' | 'down'
 * - icon: ReactNode (optional icon shown top-right)
 */
export default function StatCard({ label, value, change, trend = 'up', icon }) {
  const isUp = trend === 'up'

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm text-ink-muted">{label}</p>
        {icon && <span className="text-ink-faint">{icon}</span>}
      </div>
      <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
      {change && (
        <p
          className={cn(
            'mt-1 flex items-center gap-1 text-xs font-medium',
            isUp ? 'text-success-600' : 'text-danger-500',
          )}
        >
          {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {change}
          <span className="font-normal text-ink-faint">vs last month</span>
        </p>
      )}
    </div>
  )
}
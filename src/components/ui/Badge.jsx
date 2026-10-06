import { cn } from '../../lib/cn'

const VARIANTS = {
  neutral: 'bg-canvas text-ink-muted border-border-strong',
  primary: 'bg-primary-50 text-primary-700 border-primary-100',
  success: 'bg-success-50 text-success-600 border-success-500/20',
  warning: 'bg-warning-50 text-warning-600 border-warning-500/20',
  danger: 'bg-danger-50 text-danger-600 border-danger-500/20',
}

const SIZES = {
  sm: 'text-[11px] px-1.5 py-0.5',
  md: 'text-xs px-2 py-1',
}

/**
 * Badge - a small status / tag label.
 *
 * Props:
 * - variant: 'neutral' | 'primary' | 'success' | 'warning' | 'danger' (default 'neutral')
 * - size: 'sm' | 'md' (default 'md')
 * - dot: bool - shows a small colored dot before the label
 * - children: label content
 */
export default function Badge({
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
  children,
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium leading-none',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
    >
      {dot && (
        <span className={cn('h-1.5 w-1.5 rounded-full', {
          neutral: 'bg-ink-faint',
          primary: 'bg-primary-500',
          success: 'bg-success-500',
          warning: 'bg-warning-500',
          danger: 'bg-danger-500',
        }[variant])} />
      )}
      {children}
    </span>
  )
}

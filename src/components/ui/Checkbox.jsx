import { forwardRef, useId } from 'react'
import { Check, Minus } from 'lucide-react'
import { cn } from '../../lib/cn'

/**
 * Checkbox - a styled checkbox with a label, driven by a real native
 * checkbox input under the hood for accessibility.
 *
 * Props:
 * - label: string / ReactNode - shown to the right of the box
 * - checked, onChange: controlled state
 * - indeterminate: bool - shows a dash instead of a check (e.g. "select all"
 *   when only some rows are selected)
 * - disabled: bool
 * - error: string - shows error styling + message below
 * - description: string - muted helper text under the label
 * - className: extra classes on the outer <label>
 */
const Checkbox = forwardRef(function Checkbox(
  {
    label,
    id,
    name,
    checked = false,
    onChange,
    indeterminate = false,
    disabled = false,
    error = '',
    description = '',
    className = '',
    ...rest
  },
  ref,
) {
  const autoId = useId()
  const inputId = id || name || autoId

  return (
    <div className={className}>
      <label
        htmlFor={inputId}
        className={cn(
          'flex items-start gap-2.5',
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        )}
      >
        <span className="relative flex items-center justify-center mt-0.5">
          <input
            ref={ref}
            type="checkbox"
            id={inputId}
            name={name}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="peer sr-only"
            {...rest}
          />
          <span
            className={cn(
              'h-4 w-4 shrink-0 rounded border flex items-center justify-center transition-colors',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500/40',
              checked || indeterminate
                ? 'bg-primary-500 border-primary-500 text-white'
                : 'bg-surface border-border-strong',
              error && !checked && !indeterminate && 'border-danger-500',
            )}
          >
            {indeterminate ? (
              <Minus size={11} strokeWidth={3} />
            ) : checked ? (
              <Check size={11} strokeWidth={3} />
            ) : null}
          </span>
        </span>

        {label && (
          <span className="text-sm">
            <span className="text-ink">{label}</span>
            {description && (
              <span className="block text-xs text-ink-muted">{description}</span>
            )}
          </span>
        )}
      </label>

      {error && <p className="mt-1 text-xs text-danger-500">{error}</p>}
    </div>
  )
})

export default Checkbox

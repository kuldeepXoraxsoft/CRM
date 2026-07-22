import { forwardRef, useId } from 'react'
import { cn } from '../../lib/cn'
import Field from './Field'

/**
 * Textarea - a labeled multi-line text field.
 *
 * Props:
 * - label, id/name, value, onChange, placeholder
 * - rows: number (default 4)
 * - error / helperText / required / disabled
 * - resize: 'none' | 'vertical' | 'both' (default 'vertical')
 * - containerClassName / className
 */
const Textarea = forwardRef(function Textarea(
  {
    label,
    id,
    name,
    rows = 4,
    error = '',
    helperText = '',
    required = false,
    disabled = false,
    resize = 'vertical',
    containerClassName = '',
    className = '',
    ...rest
  },
  ref,
) {
  const autoId = useId()
  const inputId = id || name || autoId

  return (
    <Field
      label={label}
      htmlFor={inputId}
      required={required}
      error={error}
      helperText={helperText}
      className={containerClassName}
    >
      <textarea
        ref={ref}
        id={inputId}
        name={name}
        rows={rows}
        disabled={disabled}
        required={required}
        aria-invalid={Boolean(error) || undefined}
        className={cn(
          'w-full rounded-md border bg-surface text-ink placeholder:text-ink-faint px-3 py-2 text-sm',
          'transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500',
          'disabled:bg-canvas disabled:text-ink-faint disabled:cursor-not-allowed',
          resize === 'none' && 'resize-none',
          resize === 'vertical' && 'resize-y',
          resize === 'both' && 'resize',
          error
            ? 'border-danger-500 focus:ring-danger-500/30 focus:border-danger-500'
            : 'border-border-strong',
          className,
        )}
        {...rest}
      />
    </Field>
  )
})

export default Textarea

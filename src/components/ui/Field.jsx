import { cn } from '../../lib/cn'

/**
 * Field - shared layout wrapper for form controls.
 * Renders a label, the control itself (children), and an error or helper
 * message below it. Used internally by Input, Textarea, Select, SearchSelect
 * so every form control looks and behaves consistently.
 *
 * Props:
 * - label: string - field label text
 * - htmlFor: string - id of the control the label points to
 * - required: bool - shows a "*" next to the label
 * - error: string - error message; when present, overrides helperText and
 *          styles the label/message red
 * - helperText: string - muted helper text shown under the control
 * - className: extra classes on the outer wrapper
 * - children: the actual control (input, select, etc.)
 */
export default function Field({
  label,
  htmlFor,
  required = false,
  error = '',
  helperText = '',
  className = '',
  children,
}) {
  const message = error || helperText

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="text-sm font-medium text-ink flex items-center gap-0.5"
        >
          {label}
          {required && <span className="text-danger-500">*</span>}
        </label>
      )}

      {children}

      {message && (
        <p
          className={cn(
            'text-xs',
            error ? 'text-danger-500' : 'text-ink-muted',
          )}
        >
          {message}
        </p>
      )}
    </div>
  )
}

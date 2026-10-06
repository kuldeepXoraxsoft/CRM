import { forwardRef, useId } from 'react'
import { cn } from '../../lib/cn'
import Field from './Field'

const SIZES = {
  sm: 'h-8 text-sm px-2.5',
  md: 'h-10 text-sm px-3',
  lg: 'h-12 text-base px-4',
}

/**
 * Input - a labeled text input with optional icons, error, and helper text.
 *
 * Props:
 * - label: string - field label
 * - id / name: string - defaults to an auto-generated id if omitted
 * - type: HTML input type (default 'text')
 * - value, onChange: controlled input state
 * - placeholder: string
 * - size: 'sm' | 'md' | 'lg' (default 'md')
 * - error: string - shows error state + message
 * - helperText: string - muted helper text (hidden when `error` is set)
 * - required: bool
 * - disabled: bool
 * - leftIcon / rightIcon: ReactNode rendered inside the input
 * - containerClassName: className for the outer Field wrapper
 * - className: className for the <input> element itself
 * - ...rest: any other native input props
 */
const Input = forwardRef(function Input(
  {
    label,
    id,
    name,
    type = 'text',
    size = 'md',
    error = '',
    helperText = '',
    required = false,
    disabled = false,
    leftIcon = null,
    rightIcon = null,
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
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3 flex items-center text-ink-faint pointer-events-none">
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          disabled={disabled}
          required={required}
          aria-invalid={Boolean(error) || undefined}
          className={cn(
            'w-full rounded-md border bg-surface text-ink placeholder:text-ink-faint',
            'transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500',
            'disabled:bg-canvas disabled:text-ink-faint disabled:cursor-not-allowed',
            error
              ? 'border-danger-500 focus:ring-danger-500/30 focus:border-danger-500'
              : 'border-border-strong',
            SIZES[size],
            leftIcon && 'pl-9',
            rightIcon && 'pr-9',
            className,
          )}
          {...rest}
        />

        {rightIcon && (
          <span className="absolute right-3 flex items-center text-ink-faint">
            {rightIcon}
          </span>
        )}
      </div>
    </Field>
  )
})

export default Input

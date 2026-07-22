import { forwardRef, useId } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/cn'
import Field from './Field'

const SIZES = {
  sm: 'h-8 text-sm pl-2.5 pr-8',
  md: 'h-10 text-sm pl-3 pr-9',
  lg: 'h-12 text-base pl-4 pr-10',
}

/**
 * Select - a labeled native <select> dropdown, styled to match Input.
 * Use this for simple, short option lists. For searchable / async /
 * multi-select needs, use SearchSelect instead.
 *
 * Props:
 * - label: string
 * - options: Array<{ value, label, disabled? }>
 * - value, onChange: controlled state (onChange receives the raw event)
 * - placeholder: string - shown as a disabled first option when no value
 * - size: 'sm' | 'md' | 'lg' (default 'md')
 * - error / helperText / required / disabled
 * - containerClassName / className
 * - ...rest: any other native select props
 */
const Select = forwardRef(function Select(
  {
    label,
    id,
    name,
    options = [],
    value,
    onChange,
    placeholder = 'Select an option',
    size = 'md',
    error = '',
    helperText = '',
    required = false,
    disabled = false,
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
      <div className="relative">
        <select
          ref={ref}
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          aria-invalid={Boolean(error) || undefined}
          className={cn(
            'w-full appearance-none rounded-md border bg-surface text-ink',
            'transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500',
            'disabled:bg-canvas disabled:text-ink-faint disabled:cursor-not-allowed',
            !value && 'text-ink-faint',
            error
              ? 'border-danger-500 focus:ring-danger-500/30 focus:border-danger-500'
              : 'border-border-strong',
            SIZES[size],
            className,
          )}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>

        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint"
        />
      </div>
    </Field>
  )
})

export default Select

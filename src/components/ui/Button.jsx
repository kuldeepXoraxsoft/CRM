import { forwardRef } from 'react'
import { cn } from '../../lib/cn'
import Spinner from './Spinner'

const BASE =
  'inline-flex items-center justify-center gap-2 font-medium rounded-md ' +
  'transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none ' +
  'whitespace-nowrap select-none'

const VARIANTS = {
  primary:
    'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700',
  secondary:
    'bg-ink text-white hover:bg-ink/90 active:bg-ink/80',
  outline:
    'border border-border-strong bg-surface text-ink hover:bg-canvas active:bg-border/40',
  ghost:
    'text-ink hover:bg-canvas active:bg-border/40',
  danger:
    'bg-danger-500 text-white hover:bg-danger-600 active:bg-danger-600',
  link:
    'text-primary-600 hover:text-primary-700 underline-offset-4 hover:underline p-0 h-auto',
}

const SIZES = {
  sm: 'h-7 px-2 text-sm',
  md: 'h-8 px-3 text-sm',
  lg: 'h-10 px-5 text-base',
}

/**
 * Button - the base action control.
 *
 * Props:
 * - variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link' (default 'primary')
 * - size: 'sm' | 'md' | 'lg' (default 'md')
 * - loading: bool - shows a spinner and disables the button
 * - disabled: bool
 * - fullWidth: bool - stretches to 100% width
 * - leftIcon / rightIcon: ReactNode rendered before/after the label
 * - type: 'button' | 'submit' | 'reset' (default 'button')
 * - className: extra classes
 * - children: button label / content
 * - ...rest: any other button props (onClick, form, etc.)
 */
const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    leftIcon = null,
    rightIcon = null,
    type = 'button',
    className = '',
    children,
    ...rest
  },
  ref,
) {
  const isLink = variant === 'link'

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        BASE,
        VARIANTS[variant],
        !isLink && SIZES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? (
        <Spinner size={size === 'lg' ? 'md' : 'sm'} />
      ) : (
        leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
      )}
      {children}
      {!loading && rightIcon && (
        <span className="inline-flex shrink-0">{rightIcon}</span>
      )}
    </button>
  )
})

export default Button

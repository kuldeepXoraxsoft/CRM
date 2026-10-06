import { cn } from '../../lib/cn'

const SIZES = {
  sm: 'h-3.5 w-3.5 border-2',
  md: 'h-4 w-4 border-2',
  lg: 'h-6 w-6 border-[2.5px]',
}

/**
 * Spinner - a small circular loading indicator.
 *
 * Props:
 * - size: 'sm' | 'md' | 'lg' (default 'md')
 * - className: extra classes, e.g. to set a custom color via `border-current text-white`
 */
export default function Spinner({ size = 'md', className = '' }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        'inline-block animate-spin rounded-full border-current border-t-transparent',
        SIZES[size],
        className,
      )}
    />
  )
}

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '../../lib/cn'

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-[95vw]',
}

/**
 * Modal - a centered dialog rendered in a portal, with an overlay backdrop.
 *
 * Props:
 * - isOpen: bool - controls visibility
 * - onClose(): called when the modal should close (overlay click, Escape,
 *   or the close button)
 * - title: string / ReactNode - shown in the header
 * - children: modal body content
 * - footer: ReactNode - shown in a footer row (e.g. action buttons)
 * - size: 'sm' | 'md' | 'lg' | 'xl' | 'full' (default 'md')
 * - closeOnOverlayClick: bool (default true)
 * - showCloseButton: bool (default true)
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
  showCloseButton = true,
}) {
  const dialogRef = useRef(null)
const onCloseRef = useRef(onClose)

useEffect(() => {
  onCloseRef.current = onClose
}, [onClose])

 useEffect(() => {
  if (!isOpen) return

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      onCloseRef.current?.()
    }
  }

  document.addEventListener('keydown', handleKeyDown)

  const prevOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'

  // Only runs when isOpen changes
  dialogRef.current?.focus()

  return () => {
    document.removeEventListener('keydown', handleKeyDown)
    document.body.style.overflow = prevOverflow
  }
}, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-[1px]"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        tabIndex={-1}
        className={cn(
          'relative z-10 w-full rounded-lg bg-surface shadow-xl outline-none',
          'max-h-[85vh] flex flex-col',
          SIZES[size],
        )}
      >
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 id="modal-title" className="text-base font-semibold text-ink">
              {title}
            </h2>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="text-ink-faint hover:text-ink rounded-md p-1 -mr-1"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        <div className="overflow-y-auto px-5 py-4 text-sm text-ink">
          {children}
        </div>

        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3.5">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}

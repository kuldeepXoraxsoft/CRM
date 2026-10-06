import { useCallback, useState } from 'react'

/**
 * useDisclosure - tiny helper for open/close state, handy for modals,
 * drawers, and dropdowns.
 *
 *   const modal = useDisclosure()
 *   <Button onClick={modal.open}>Open</Button>
 *   <Modal isOpen={modal.isOpen} onClose={modal.close}>...</Modal>
 */
export function useDisclosure(initial = false) {
  const [isOpen, setIsOpen] = useState(initial)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((v) => !v), [])

  return { isOpen, open, close, toggle }
}

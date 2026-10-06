import { AlertTriangle, HelpCircle } from "lucide-react";

import { Modal, Button } from "./ui";

/**
 * Reusable confirmation dialog. Use it anywhere you need a "are you sure?"
 * step before an action — delete, convert-to-account, bulk actions, etc.
 *
 * Usage:
 * <ConfirmDialog
 *   isOpen={confirmState.isOpen}
 *   onClose={() => setConfirmState({ isOpen: false })}
 *   onConfirm={() => { doTheThing(); setConfirmState({ isOpen: false }); }}
 *   title="Delete this lead?"
 *   message={`"${lead.customerName}" will be permanently removed. This can't be undone.`}
 *   confirmLabel="Delete"
 *   variant="danger"        // "danger" (red) | "default" (primary color)
 * />
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
}) {
  const isDanger = variant === "danger";

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="flex flex-col items-center py-0 text-center">
        <div
          className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
            isDanger ? "bg-danger-50 text-danger-500" : "bg-primary-50 text-primary-600"
          }`}
        >
          {isDanger ? <AlertTriangle size={22} /> : <HelpCircle size={22} />}
        </div>

        <h2 className="text-base font-semibold text-ink">{title}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{message}</p>

        <div className="mt-6 flex w-full justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            {cancelLabel}
          </Button>

          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-md px-4 py-2 text-sm font-medium text-white transition-colors ${
              isDanger
                ? "bg-danger-500 hover:bg-danger-600"
                : "bg-primary-600 hover:bg-primary-700"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
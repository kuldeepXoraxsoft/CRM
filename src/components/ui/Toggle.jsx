/**
 * Reusable on/off switch. Use it anywhere a boolean preference needs a
 * toggle instead of a checkbox — notification settings, feature flags, etc.
 *
 * Usage:
 * <Toggle
 *   checked={notifications.taskAssigned}
 *   onChange={(value) => update("taskAssigned", value)}
 *   label="New task assigned to me"
 *   description="Get notified when your manager assigns you a task."
 * />
 */
export default function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="pr-4">
        {label && <p className="text-sm font-medium text-ink">{label}</p>}
        {description && <p className="mt-0.5 text-xs text-ink-muted">{description}</p>}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-primary-500" : "bg-border"
        }`}
      >
        <span
          className={`inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
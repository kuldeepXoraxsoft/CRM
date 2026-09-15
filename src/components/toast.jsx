import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";

const TOAST_CONFIG = {
  success: {
    icon: CheckCircle2,
    iconClass: "text-success-600",
  },
  error: {
    icon: XCircle,
    iconClass: "text-danger-500",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "text-warning-500",
  },
  info: {
    icon: Info,
    iconClass: "text-blue-500",
  },
};

export default function Toast({
  toast,
  onClose,
}) {
  if (!toast) return null;

  const config =
    TOAST_CONFIG[toast.type] || TOAST_CONFIG.info;

  const Icon = config.icon;

  return (
    <div className="fixed right-5 bottom-5 z-[9999] w-[360px] max-w-[calc(100vw-40px)]">
      <div className="flex items-start gap-3 rounded-lg border border-border bg-white px-4 py-3.5 shadow-lg">
        <Icon
          size={20}
          className={`mt-0.5 shrink-0 ${config.iconClass}`}
        />

        <div className="min-w-0 flex-1">
          {toast.title && (
            <p className="text-sm font-semibold text-ink">
              {toast.title}
            </p>
          )}

          <p
            className={`text-sm text-ink-faint ${
              toast.title ? "mt-0.5" : ""
            }`}
          >
            {toast.message}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="shrink-0 text-ink-faint transition hover:text-ink"
          aria-label="Close notification"
        >
          <X size={17} />
        </button>
      </div>
    </div>
  );
}
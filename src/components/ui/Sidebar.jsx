import { NavLink } from "react-router-dom";
import { X, Zap } from "lucide-react";
import { cn } from "../../lib/cn";
import { useAuth } from "../../context/AuthContext";
import { getNavItems } from "../../config/navigation";

export default function Sidebar({ isOpen = false, onClose }) {
  const { currentUser } = useAuth();
  console.log(currentUser?.role);

  const navItems = getNavItems(currentUser?.role);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-ink/40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "group fixed inset-y-0 left-0 z-40 flex w-54 flex-col border-r border-border bg-surface",

          // Desktop collapsed
          "md:static md:w-16 md:translate-x-0",

          // Expand on hover
          "md:hover:w-54",

          // Transition
          "transition-[width,transform] duration-200",

          // Mobile
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex h-16 shrink-0 items-center justify-between px-4">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary-500 text-white">
              <Zap size={18} />
            </span>

            <span
              className={cn(
                "whitespace-nowrap text-base font-semibold text-ink",
                "md:opacity-0 md:transition-opacity md:duration-150",
                "md:group-hover:opacity-100"
              )}
            >
              CyvoraTech
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-ink-faint hover:text-ink md:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {navItems.map(({ label, to, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              title={label}
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-md py-2 text-sm font-medium",
                  "transition-colors duration-150",
                  "gap-3 px-3",

                  isActive
                    ? "bg-primary-50 text-primary-700"
                    : "text-ink-muted hover:bg-canvas hover:text-ink"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={18}
                    strokeWidth={isActive ? 2.5 : 2}
                    className="shrink-0 transition-all duration-150"
                  />

                  <span
                    className={cn(
                      "whitespace-nowrap transition-opacity duration-150",
                      "md:opacity-0 md:group-hover:opacity-100"
                    )}
                  >
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
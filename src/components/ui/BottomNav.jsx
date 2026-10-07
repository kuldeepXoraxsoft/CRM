import { useState } from "react";
import { NavLink } from "react-router-dom";
import { MoreHorizontal, X } from "lucide-react";

import { cn } from "../../lib/cn";
import { useAuth } from "../../context/AuthContext";
import { getNavItems } from "../../config/navigation";

const MAX_PRIMARY_ITEMS = 4;

/**
 * Mobile-only bottom tab bar - replaces the Sidebar on small screens.
 * Shows the first 4 role-visible nav items directly; anything beyond
 * that collapses into a "More" bottom sheet.
 */
export default function BottomNav() {
  const { currentUser } = useAuth();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const navItems = getNavItems(currentUser?.role);
  const primaryItems = navItems.slice(0, MAX_PRIMARY_ITEMS);
  const moreItems = navItems.slice(MAX_PRIMARY_ITEMS);

  return (
    <>
      <nav
        className={cn(
          "fixed inset-x-0 bottom-0 z-30 flex items-stretch border-t border-border bg-surface md:hidden",
          "pb-[env(safe-area-inset-bottom,0px)]"
        )}
      >
        {primaryItems.map(({ label, to, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium",
                isActive ? "text-primary-600" : "text-ink-muted"
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="max-w-[64px] truncate">{label}</span>
              </>
            )}
          </NavLink>
        ))}

        {moreItems.length > 0 && (
          <button
            type="button"
            onClick={() => setIsMoreOpen(true)}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium text-ink-muted"
          >
            <MoreHorizontal size={20} />
            <span>More</span>
          </button>
        )}
      </nav>

      {isMoreOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-ink/40"
            onClick={() => setIsMoreOpen(false)}
            aria-hidden="true"
          />

          <div className="absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-border bg-surface pb-[env(safe-area-inset-bottom,0px)]">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-sm font-semibold text-ink">More</p>
              <button
                type="button"
                onClick={() => setIsMoreOpen(false)}
                className="text-ink-faint hover:text-ink"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-1 p-4">
              {moreItems.map(({ label, to, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setIsMoreOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex flex-col items-center gap-1.5 rounded-lg py-3 text-[11px] font-medium",
                      isActive
                        ? "bg-primary-50 text-primary-700"
                        : "text-ink-muted hover:bg-canvas"
                    )
                  }
                >
                  <Icon size={20} />
                  <span className="max-w-[64px] truncate text-center">{label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
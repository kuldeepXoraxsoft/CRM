import { useEffect, useRef, useState } from "react";
import {
  Menu,
  Search,
  ChevronDown,
  LogOut,
  Settings,
  UserCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { cn } from "../../lib/cn";
import { Avatar } from "../ui";
import { CURRENT_USER } from "../../data/mockData";
import NotificationBell from "../Notifications/NotificationBell";

export default function Navbar({ onMenuClick }) {
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuRef = useRef(null);

  useEffect(() => {
    function handleClick(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);

    return () =>
      document.removeEventListener("mousedown", handleClick);
  }, []);

  function goToSettings() {
    setIsMenuOpen(false);
    navigate("/settings");
  }

  function logout() {
    setIsMenuOpen(false);
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-4 border-b border-border bg-surface px-4 sm:px-6">

      {/* Mobile Menu */}

      <button
        type="button"
        onClick={onMenuClick}
        className="text-ink-muted hover:text-ink md:hidden"
        aria-label="Open sidebar"
      >
        <Menu size={22} />
      </button>

      {/* Search */}

      <div className="relative hidden max-w-md flex-1 sm:block">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
        />

        <input
          type="text"
          placeholder="Search contacts, deals, tasks..."
          className={cn(
            "h-9 w-full rounded-md border border-border-strong bg-canvas pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint",
            "focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          )}
        />
      </div>

      {/* Right Section */}

      <div className="ml-auto flex items-center gap-3">

        {/* Notifications */}

        <NotificationBell />

        {/* Profile */}

        <div
          ref={menuRef}
          className="relative"
        >
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-md py-1 pl-1 pr-2 hover:bg-canvas"
          >
            <Avatar
              name={CURRENT_USER.name}
              size="sm"
            />

            <span className="hidden text-left sm:block">
              <span className="block text-sm font-medium text-ink">
                {CURRENT_USER.name}
              </span>

              <span className="block text-xs text-ink-muted">
                {CURRENT_USER.role}
              </span>
            </span>

            <ChevronDown
              size={16}
              className="hidden text-ink-faint sm:block"
            />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-lg border border-border bg-surface shadow-lg">

              <div className="border-b border-border px-4 py-3">
                <p className="text-sm font-medium text-ink">
                  {CURRENT_USER.name}
                </p>

                <p className="text-xs text-ink-muted">
                  {CURRENT_USER.email}
                </p>
              </div>

              <button
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-ink hover:bg-canvas"
              >
                <UserCircle
                  size={16}
                  className="text-ink-faint"
                />

                Your Profile
              </button>

              <button
                onClick={goToSettings}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-ink hover:bg-canvas"
              >
                <Settings
                  size={16}
                  className="text-ink-faint"
                />

                Settings
              </button>

              <button
                onClick={logout}
                className="flex w-full items-center gap-2 border-t border-border px-4 py-2.5 text-left text-sm text-danger-500 hover:bg-danger-50"
              >
                <LogOut size={16} />

                Sign Out
              </button>

            </div>
          )}
        </div>
      </div>
    </header>
  );
}
import { useEffect, useRef, useState } from "react";
import {
  Menu,
  ChevronDown,
  LogOut,
  Settings,
  UserCircle,
  Key,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Avatar } from "../ui";
import NotificationBell from "../Notifications/NotificationBell";
import { useAuth } from "../../context/AuthContext";
import ConfirmDialog from "../ConfirmDialog";
import ChangePasswordModal from "../changePasswordModal";

export default function Navbar({ onMenuClick }) {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuRef = useRef(null);

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    target: null,
  });
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

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

  function closeConfirmDialog() {
    setConfirmDialog({
      isOpen: false,
      target: null,
    });
  }

  async function handleConfirmLogout() {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      closeConfirmDialog();
    }
  }

  function handleLogout() {
    setIsMenuOpen(false);

    // Open confirmation dialog
    setConfirmDialog({
      isOpen: true,
      target: "logout",
    });
  }

  // Prevent rendering user information before auth state is restored
  if (!currentUser) {
    return (
      <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center border-b border-border bg-surface px-4 sm:px-6">
        <button
          type="button"
          onClick={onMenuClick}
          className="text-ink-muted hover:text-ink md:hidden"
          aria-label="Open sidebar"
        >
          <Menu size={22} />
        </button>
      </header>
    );
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
              name={currentUser.name}
              size="sm"
            />

            <span className="hidden text-left sm:block">
              <span className="block text-sm font-medium text-ink">
                {currentUser.name}
              </span>

              <span className="block text-xs capitalize text-ink-muted">
                {currentUser.role}
              </span>
            </span>

            <ChevronDown
              size={16}
              className="hidden text-ink-faint sm:block"
            />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-lg border border-border bg-surface shadow-lg">

              {/* User Info */}
              <div className="border-b border-border px-4 py-3">
                <p className="text-sm font-medium text-ink">
                  {currentUser.name}
                </p>

                <p className="text-xs text-ink-muted">
                  {currentUser.email}
                </p>

                <p className="mt-1 text-xs capitalize text-ink-faint">
                  {currentUser.role}
                </p>
              </div>

              {/* Profile */}
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate("/profile");
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-ink hover:bg-canvas"
              >
                <UserCircle
                  size={16}
                  className="text-ink-faint"
                />

                Your Profile
              </button>

              {/* Settings */}
              <button
                type="button"
                onClick={goToSettings}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-ink hover:bg-canvas"
              >
                <Settings
                  size={16}
                  className="text-ink-faint"
                />

                Settings
              </button>

              {/* Change Password */}
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                   setChangePasswordOpen(true)
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-ink hover:bg-canvas"
              >
                <Key
                  size={16}
                  className="text-ink-faint"
                />

                Change Password
              </button>

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 border-t border-border px-4 py-2.5 text-left text-sm text-danger-500 hover:bg-danger-50"
              >
                <LogOut size={16} />

                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Logout Confirmation */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={closeConfirmDialog}
        onConfirm={handleConfirmLogout}
        variant="danger"
        title="Sign out?"
        message="Are you sure you want to sign out of this account?"
        confirmLabel="Logout"
      />
      <ChangePasswordModal
        isOpen={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
        onSuccess={() => {
          // optional toast
        }}
      />
    </header>
  );
}
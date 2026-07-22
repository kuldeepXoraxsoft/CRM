import { useEffect, useMemo, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

import NotificationDropdown from "./NotificationDropdown";
import { NOTIFICATIONS } from "../../data/notification";

export default function NotificationBell() {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);

  // Local state for now (will be replaced by Redux later)
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const dropdownRef = useRef(null);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
  );

  function toggleDropdown() {
    setIsOpen((prev) => !prev);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        closeDropdown();
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () =>
      document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  function markAsRead(id) {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, read: true } : item
      )
    );
  }

  function deleteNotification(id) {
    setNotifications((prev) =>
      prev.filter((item) => item.id !== id)
    );
  }

  function handleViewAll() {
    closeDropdown();
    navigate("/notifications");
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={toggleDropdown}
        aria-label="Notifications"
        className="relative rounded-md p-2 text-ink-muted transition-colors hover:bg-canvas hover:text-ink"
      >
        <Bell size={19} />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-danger-500 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationDropdown
          notifications={notifications}
          unreadCount={unreadCount}
          onRead={markAsRead}
          onDelete={deleteNotification}
          onViewAll={handleViewAll}
          onClose={closeDropdown}
        />
      )}
    </div>
  );
}
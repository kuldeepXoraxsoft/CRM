import { useMemo, useState } from "react";

import NotificationHeader from "./NotificationHeader";
import NotificationTabs from "./NotificationTabs";
import NotificationList from "./NotificationList";
import NotificationPagination from "./NotificationPagination";

import { NOTIFICATIONS } from "../../data/notifications";


const PAGE_SIZE = 5;

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const [activeTab, setActiveTab] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);


  const filteredNotifications = useMemo(() => {
    if (activeTab === "unread") {
      return notifications.filter((n) => !n.read);
    }

    return notifications;
  }, [notifications, activeTab]);


  const totalPages = Math.max(
    1,
    Math.ceil(filteredNotifications.length / PAGE_SIZE)
  );

  const paginatedNotifications = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;

    return filteredNotifications.slice(start, start + PAGE_SIZE);
  }, [filteredNotifications, currentPage]);


  const unreadCount = notifications.filter((n) => !n.read).length;


  function handleMarkRead(id) {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, read: true } : item
      )
    );
  }

  function handleMarkAllRead() {
    setNotifications((prev) =>
      prev.map((item) => ({
        ...item,
        read: true,
      }))
    );
  }

  function handleDelete(id) {
    setNotifications((prev) =>
      prev.filter((item) => item.id !== id)
    );
  }

  function handleDeleteAll() {
    setNotifications([]);
  }


  function handleTabChange(tab) {
    setActiveTab(tab);

    setCurrentPage(1);
  }


  function handlePageChange(page) {
    setCurrentPage(page);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">

      <NotificationHeader
        totalCount={notifications.length}
        unreadCount={unreadCount}
        onDeleteAll={handleDeleteAll}
        onMarkAllRead={handleMarkAllRead}
      />

      <NotificationTabs
        activeTab={activeTab}
        allCount={notifications.length}
        unreadCount={unreadCount}
        onChange={handleTabChange}
      />

      <NotificationList
        notifications={paginatedNotifications}
        onDelete={handleDelete}
        onRead={handleMarkRead}
      />

      <NotificationPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

    </div>
  );
}
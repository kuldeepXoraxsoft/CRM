import client from "./client";

export const notificationsApi = {
  list: () => client.get("/notifications").then((r) => r.data),
  unreadCount: () => client.get("/notifications/unread-count").then((r) => r.data),
  markAsRead: (id) => client.patch(`/notifications/${id}/read`).then((r) => r.data),
  markAllAsRead: () => client.patch("/notifications/read-all").then((r) => r.data),
  remove: (id) => client.delete(`/notifications/${id}`),
  removeAll: () => client.delete("/notifications"),
};
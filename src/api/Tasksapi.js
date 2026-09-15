import client from "./client";

export const tasksApi = {
  list: () => client.get("/tasks").then((r) => r.data),
  create: (data) => client.post("/tasks", data).then((r) => r.data),
  updateStatus: (id, status) =>
    client.patch(`/tasks/${id}/status`, { status }).then((r) => r.data),
  reassign: (id, assigneeId) =>
    client.patch(`/tasks/${id}/reassign`, { assigneeId }).then((r) => r.data),
  addComment: (id, text) =>
    client.post(`/tasks/${id}/comments`, { text }).then((r) => r.data),
  remove: (id) => client.delete(`/tasks/${id}`),
};
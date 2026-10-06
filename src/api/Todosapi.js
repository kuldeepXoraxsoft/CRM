import client from "./client";

export const todosApi = {
  list: ({ page = 1, limit = 10, search = "" } = {}) =>
    client.get("/todos", { params: { page, limit, search: search || undefined } }).then((r) => r.data),
  create: (data) => client.post("/todos", data).then((r) => r.data),
  update: (id, data) => client.patch(`/todos/${id}`, data).then((r) => r.data),
  toggle: (id) => client.patch(`/todos/${id}/toggle`).then((r) => r.data),
  remove: (id) => client.delete(`/todos/${id}`),
};

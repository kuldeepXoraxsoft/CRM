import client from "./client";

export const meetingsApi = {
  list: ({ page = 1, limit = 10, search = "" } = {}) =>
    client.get("/meetings", { params: { page, limit, search: search || undefined } }).then((r) => r.data),
  create: (data) => client.post("/meetings", data).then((r) => r.data),
  update: (id, data) => client.patch(`/meetings/${id}`, data).then((r) => r.data),
  cancel: (id) => client.post(`/meetings/${id}/cancel`).then((r) => r.data),
  respond: (id, response) => client.post(`/meetings/${id}/respond`, { response }).then((r) => r.data),
  remove: (id) => client.delete(`/meetings/${id}`),
};

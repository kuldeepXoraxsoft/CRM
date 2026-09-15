import client from "./client";

export const accountsApi = {
  list: () => client.get("/accounts").then((r) => r.data),
  get: (id) => client.get(`/accounts/${id}`).then((r) => r.data),
  create: (data) => client.post("/accounts", data).then((r) => r.data),
  update: (id, data) => client.patch(`/accounts/${id}`, data).then((r) => r.data),
  remove: (id) => client.delete(`/accounts/${id}`),
  followUp: (id, payload) => client.post(`/accounts/${id}/follow-up`, payload).then((r) => r.data),
  count: () => client.get("/accounts/count").then((r) => r.data),
};
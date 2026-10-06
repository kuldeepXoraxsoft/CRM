import api from "./client";

export const ticketsApi = {
  list: async (params = {}) => (await api.get("/tickets", { params })).data,
  get: async (id) => (await api.get(`/tickets/${id}`)).data,
  create: async (payload) => (await api.post("/tickets", payload)).data,
  update: async (id, payload) => (await api.patch(`/tickets/${id}`, payload)).data,
  assign: async (id, assigneeId) => (await api.patch(`/tickets/${id}/assign`, { assigneeId })).data,
  addComment: async (id, text) => (await api.post(`/tickets/${id}/comments`, { text })).data,
};

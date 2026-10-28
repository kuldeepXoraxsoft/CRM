import client from "./client";

export const accountsApi = {
  list: ({ page = 1, limit = 20, search = "" } = {}) => client.get("/accounts", {
      params: {
        page,
        limit,
        search: search || undefined,
      },
    }).then((r) => r.data),
  get: (id) => client.get(`/accounts/${id}`).then((r) => r.data),
  create: (data) => client.post("/accounts", data).then((r) => r.data),
  update: (id, data) => client.patch(`/accounts/${id}`, data).then((r) => r.data),
  remove: (id) => client.delete(`/accounts/${id}`),
  followUp: (id, payload) => client.post(`/accounts/${id}/follow-up`, payload).then((r) => r.data),
  count: () => client.get("/accounts/count").then((r) => r.data),
  getFollowUpHistory: (id, page = 1) =>
  client
    .get(`/accounts/${id}/follow-ups`, {
      params: { page },
    })
    .then((response) => response.data),

  
  listDocuments: (id) =>
    client.get(`/accounts/${id}/documents`).then((r) => r.data),

  uploadDocument: (id, { title, file }) => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);

    return client
      .post(`/accounts/${id}/documents`, formData)
      .then((r) => r.data);
  },

  downloadDocument: (id, documentId) =>
    client.get(
      `/accounts/${id}/documents/${documentId}/download`,
      { responseType: "blob" }
    ).then((r) => r.data),

  deleteDocument: (id, documentId) =>
    client.delete(`/accounts/${id}/documents/${documentId}`)
      .then((r) => r.data),
};
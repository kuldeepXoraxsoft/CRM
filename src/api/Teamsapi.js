import client from "./client";

export const teamsApi = {
  list: () => client.get("/teams").then((r) => r.data),
  create: (data) => client.post("/teams", data).then((r) => r.data),
  update: (id, data) => client.patch(`/teams/${id}`, data).then((r) => r.data),
  remove: (id) => client.delete(`/teams/${id}`),
};
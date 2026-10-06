import client from "./client";

export const employeesApi = {
  list: ({ page = 1, limit = 20, search = "", } = {}) => client.get("/employees", {
      params: {
        page,
        limit,
        search: search || undefined,
      },
    }).then((r) => r.data),
  create: (data) => client.post("/employees", data).then((r) => r.data),
  update: (id, data) => client.patch(`/employees/${id}`, data).then((r) => r.data),
  remove: (id) => client.delete(`/employees/${id}`),
};
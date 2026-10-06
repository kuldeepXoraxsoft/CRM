import client from "./client";

const managementApi = {
  getDepartments: () => client.get("/management/departments").then((r) => r.data),
  createDepartment: (data) => client.post("/management/departments", data).then((r) => r.data),
  updateDepartment: (id, data) => client.put(`/management/departments/${id}`, data).then((r) => r.data),
  deleteDepartment: (id) => client.delete(`/management/departments/${id}`).then((r) => r.data),

  getAdmins: () => client.get("/management/admins").then((r) => r.data),
  createAdmin: (data) => client.post("/management/admins", data).then((r) => r.data),
  updateAdmin: (id, data) => client.put(`/management/admins/${id}`, data).then((r) => r.data),
  deleteAdmin: (id) => client.delete(`/management/admins/${id}`).then((r) => r.data),
};

export default managementApi;
import client from "./client";

export const leadsApi = {
  list: () => client.get("/leads").then((r) => r.data),
  get: (id) => client.get(`/leads/${id}`).then((r) => r.data),
  create: (data) => client.post("/leads", data).then((r) => r.data),
  bulkCreate: (leads) => client.post("/leads/bulk", { leads }).then((r) => r.data),
  update: (id, data) => client.patch(`/leads/${id}`, data).then((r) => r.data),
  remove: (id) => client.delete(`/leads/${id}`),
  followUp: (id, payload) => client.post(`/leads/${id}/follow-up`, payload).then((r) => r.data),
  convert: (id) => client.post(`/leads/${id}/convert`).then((r) => r.data),
  downloadSample: () =>
    client.get("/leads/sample", {
      responseType: "blob",
    }).then((r) => {
      const blob = new Blob([r.data], {
        type: "text/csv;charset=utf-8;",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "lead-import-sample.csv";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    }),
};
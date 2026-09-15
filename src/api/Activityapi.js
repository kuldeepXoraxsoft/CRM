import client from "./client";

export const activityApi = {
  list: () => client.get("/activity").then((r) => r.data),
};
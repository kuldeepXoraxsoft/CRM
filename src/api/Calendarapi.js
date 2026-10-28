import client from "./client";

export const calendarApi = {
  // scope: "mine" (default) | "team" (manager / admin / superAdmin only)
  events: ({ from, to, scope = "mine" }) =>
    client
      .get("/calendar/events", {
        params: { from: from.toISOString(), to: to.toISOString(), scope },
      })
      .then((r) => r.data),
};

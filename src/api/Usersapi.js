import client from "./client";

export const usersApi = {
  options: ({ page = 1, limit = 20, search = "", ids = [], purpose = "assignment" } = {}) =>
    client
      .get("/users/options", {
        params: {
          page,
          limit,
          search: search || undefined,
          ids: ids.length ? ids.join(",") : undefined,
          purpose,
        },
      })
      .then((r) => r.data),
};

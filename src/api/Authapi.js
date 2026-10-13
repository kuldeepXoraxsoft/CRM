import client from "./client";

export const authApi = {
  login: (email, password) =>
    client.post("/auth/login", { email, password }).then((r) => r.data),

  me: () =>
    client.get("/auth/me").then((r) => r.data),

  changePassword: (currentPassword, newPassword) =>
    client
      .patch("/auth/password", {
        currentPassword,
        newPassword,
      })
      .then((r) => r.data),

  // NEW: send reset link to email
  forgotPassword: (email) =>
    client.post("/auth/forgot-password", { email }).then((r) => r.data),

  // NEW: set a new password using the token from the email link
  resetPassword: (token, newPassword) =>
    client
      .post("/auth/reset-password", { token, newPassword })
      .then((r) => r.data),
};
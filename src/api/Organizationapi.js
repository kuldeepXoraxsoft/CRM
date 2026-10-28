import client from "./client";

export const organizationApi = {
  // Public: { companyName, hasLogo, logoVersion }
  get: () => client.get("/organization").then((r) => r.data),

  // superAdmin. payload: { companyName?, logo?: dataURL, removeLogo? }
  update: (payload) => client.put("/organization", payload).then((r) => r.data),

  // Department email (SMTP). superAdmin passes departmentId; admin omits it.
  getEmailConfig: (departmentId) =>
    client
      .get("/organization/email-config", {
        params: departmentId ? { departmentId } : {},
      })
      .then((r) => r.data),

  saveEmailConfig: (payload) =>
    client.put("/organization/email-config", payload).then((r) => r.data),

  deleteEmailConfig: (departmentId) =>
    client
      .delete("/organization/email-config", {
        params: departmentId ? { departmentId } : {},
      })
      .then((r) => r.data),

  sendTestEmail: (payload) =>
    client.post("/organization/email-config/test", payload).then((r) => r.data),
};

// Logo is served by the backend; ?v=<version> busts the cache after a change.
export const getLogoUrl = (version) =>
  version ? `${client.defaults.baseURL}/organization/logo?v=${version}` : null;

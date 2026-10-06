// Mirrors the frontend's option lists exactly (see data/leadData.js,
// data/accountData.js, constants/roles.js on the client). Keeping these
// in one place lets controllers validate incoming values before writing
// to the DB.

export const ROLES = ["employee", "manager", "admin"];

export const LEAD_STATUSES = [
  "New Lead",
  "Following Up",
  "Agreement Sent",
  "Connected",
  "On Hold",
  "Inactive",
  "Live",
  "Spam",
];

export const CONVERTIBLE_LEAD_STATUSES = ["Live", "Connected"];

export const ACCOUNT_STATUSES = ["Live", "On Hold", "Inactive", "Churned"];

export const AGREEMENT_STATUSES = ["Not Sent", "Sent", "Signed", "Not Required"];

export const PAYMENT_TYPES = ["Prepay", "Postpay"];

export const TODO_PRIORITIES = ["High", "Medium", "Low"];

export const TODO_STATUSES = ["Pending", "In Progress", "Completed"];
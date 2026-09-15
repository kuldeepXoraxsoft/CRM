/* -----------------------------
    PREFERENCE OPTIONS
----------------------------- */

export const THEME_OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "Match System" },
];

export const DENSITY_OPTIONS = [
  { value: "comfortable", label: "Comfortable" },
  { value: "compact", label: "Compact" },
];

export const LANDING_PAGE_OPTIONS = [
  { value: "/dashboard", label: "Dashboard" },
  { value: "/leads", label: "Leads" },
  { value: "/accounts", label: "Accounts" },
  { value: "/tasks", label: "My Tasks" },
];

export const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "INR", label: "INR (₹)" },
];

/* -----------------------------
    NOTIFICATION PREFERENCE CONFIG
    (key -> what it means, shown as toggles)
----------------------------- */

export const NOTIFICATION_PREFERENCES = [
  {
    key: "followUpDueToday",
    label: "Follow-up due today",
    description: "Get notified when a lead or account follow-up is due today.",
  },
  {
    key: "followUpOverdue",
    label: "Follow-up overdue",
    description: "Get notified when a follow-up date has passed with no update.",
  },
  {
    key: "taskAssigned",
    label: "New task assigned to me",
    description: "Get notified when your manager assigns you a new task.",
  },
  {
    key: "taskReassigned",
    label: "Task reassigned",
    description: "Get notified when a task assigned to you gets reassigned.",
  },
  {
    key: "leadConverted",
    label: "Lead converted to Account",
    description: "Get notified when one of your leads converts.",
  },
  {
    key: "newEmployeeAdded",
    label: "New employee added to my team",
    description: "Managers only — get notified when someone joins your team.",
  },
];

/* -----------------------------
    DEFAULT / EMPTY SETTINGS
----------------------------- */

export function createDefaultSettings() {
  return {
    profile: {
      name: "",
      email: "",
    },
    preferences: {
      theme: "light",
      density: "comfortable",
      landingPage: "/dashboard",
    },
    notifications: {
      followUpDueToday: true,
      followUpOverdue: true,
      taskAssigned: true,
      taskReassigned: true,
      leadConverted: true,
      newEmployeeAdded: false,
    },
    organization: {
      companyName: "",
      defaultCurrency: "USD",
    },
  };
}

/* -----------------------------
    SAMPLE SETTINGS
    (preview data - swap for the real logged-in user's settings once
    a GET /api/settings endpoint exists)
----------------------------- */

export const SAMPLE_SETTINGS = {
  profile: {
    name: "Arun Arya",
    email: "arun@cyvora.com",
  },
  preferences: {
    theme: "light",
    density: "comfortable",
    landingPage: "/dashboard",
  },
  notifications: {
    followUpDueToday: true,
    followUpOverdue: true,
    taskAssigned: true,
    taskReassigned: true,
    leadConverted: true,
    newEmployeeAdded: true,
  },
  organization: {
    companyName: "Cyvora Tech",
    defaultCurrency: "USD",
  },
};
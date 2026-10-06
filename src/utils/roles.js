export const ROLES = {
  EMPLOYEE: "employee",
  MANAGER: "manager",
  ADMIN: "admin",
};

export const ROLE_LABELS = {
  [ROLES.EMPLOYEE]: "Employee",
  [ROLES.MANAGER]: "Manager",
  [ROLES.ADMIN]: "Admin",
};

export const ROLE_BADGE_VARIANT = {
  [ROLES.EMPLOYEE]: "neutral",
  [ROLES.MANAGER]: "primary",
  [ROLES.ADMIN]: "danger",
};

export const PERMISSIONS = {
  // Todos (personal)
  CREATE_OWN_TODO: [ROLES.EMPLOYEE, ROLES.MANAGER, ROLES.ADMIN],

  // Assigned tasks
  ASSIGN_TASK: [ROLES.MANAGER, ROLES.ADMIN],
  REASSIGN_TASK: [ROLES.MANAGER, ROLES.ADMIN],
  VIEW_ALL_ASSIGNED_TASKS: [ROLES.ADMIN],
  VIEW_TEAM_ASSIGNED_TASKS: [ROLES.MANAGER, ROLES.ADMIN],

  // Employees
  ADD_EMPLOYEE: [ROLES.MANAGER, ROLES.ADMIN],
  EDIT_EMPLOYEE: [ROLES.MANAGER, ROLES.ADMIN],
  DELETE_EMPLOYEE: [ROLES.ADMIN],
  VIEW_ALL_EMPLOYEES: [ROLES.ADMIN],
  VIEW_TEAM_EMPLOYEES: [ROLES.MANAGER, ROLES.ADMIN],
  VIEW_ALL_MANAGERS: [ROLES.ADMIN],

  // Teams
  CREATE_TEAM: [ROLES.MANAGER, ROLES.ADMIN],
  EDIT_TEAM: [ROLES.MANAGER, ROLES.ADMIN],
  DELETE_TEAM: [ROLES.ADMIN],

  // Leads / Accounts (existing modules) - admin+manager full, employee own only
  VIEW_ALL_LEADS: [ROLES.ADMIN],
  VIEW_TEAM_LEADS: [ROLES.MANAGER, ROLES.ADMIN],
};

export function hasPermission(role, permissionKey) {
  const allowedRoles = PERMISSIONS[permissionKey];
  return Array.isArray(allowedRoles) && allowedRoles.includes(role);
}
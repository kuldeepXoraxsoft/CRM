export const PERMISSIONS = {

  CREATE_OWN_TODO: ["employee", "manager", "admin", "superAdmin"],

  ASSIGN_TASK: ["manager", "admin", "superAdmin"],
  REASSIGN_TASK: ["manager", "admin", "superAdmin"],

  VIEW_ALL_ASSIGNED_TASKS: ["admin", "superAdmin"],
  VIEW_TEAM_ASSIGNED_TASKS: ["manager", "admin", "superAdmin"],

  ADD_EMPLOYEE: ["manager", "admin", "superAdmin"],
  EDIT_EMPLOYEE: ["manager", "admin", "superAdmin"],
  DELETE_EMPLOYEE: ["admin", "superAdmin"],

  VIEW_ALL_EMPLOYEES: ["admin", "superAdmin"],
  VIEW_TEAM_EMPLOYEES: ["manager", "admin", "superAdmin"],

  VIEW_ALL_MANAGERS: ["admin", "superAdmin"],

  CREATE_TEAM: ["manager", "admin", "superAdmin"],
  EDIT_TEAM: ["manager", "admin", "superAdmin"],
  DELETE_TEAM: ["admin", "superAdmin"],

  VIEW_ALL_LEADS: ["admin", "superAdmin"],
  VIEW_TEAM_LEADS: ["manager", "admin", "superAdmin"],

  VIEW_ALL_ACCOUNTS: ["admin", "superAdmin"],
  VIEW_TEAM_ACCOUNTS: ["manager", "admin", "superAdmin"],

  VIEW_DEPARTMENTS: ["superAdmin"],
  ADD_DEPARTMENT: ["superAdmin"],
  EDIT_DEPARTMENT: ["superAdmin"],
  DELETE_DEPARTMENT: ["superAdmin"],

  VIEW_ADMINS: ["superAdmin"],
  ADD_ADMIN: ["superAdmin"],
  EDIT_ADMIN: ["superAdmin"],
  DELETE_ADMIN: ["superAdmin"],
};

export function hasPermission(role, permissionKey) {
  const allowedRoles = PERMISSIONS[permissionKey];

  return Array.isArray(allowedRoles) && allowedRoles.includes(role);
}
import { ROLES } from "../utils/roles";

export const EMPLOYEE_ROLE_OPTIONS = [
  {
    value: ROLES.EMPLOYEE,
    label: "Employee",
  },
  {
    value: ROLES.MANAGER,
    label: "Manager",
  },
];

export const EMPLOYEE_STATUS_OPTIONS = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
];

export const EMPLOYEE_TABLE_COLUMNS = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "role", label: "Role" },
  { key: "managerName", label: "Reports To" },
  { key: "teamName", label: "Team" },
  { key: "status", label: "Status" },
  { key: "joinedDate", label: "Joined" },
];

export function createEmptyEmployee() {
  return {
    id: `emp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: "",
    email: "",
    role: ROLES.EMPLOYEE,
    managerId: "",
    teamId: "",
    status: "Active",
    joinedDate: new Date().toISOString().slice(0, 10),
  };
}

export const INITIAL_EMPLOYEES = [
  {
    id: "admin_1",
    name: "Sandeep Sir",
    email: "admin@cyvora.com",
    role: ROLES.ADMIN,
    managerId: "",
    teamId: "",
    status: "Active",
    joinedDate: "2025-01-01",
  },
  {
    id: "mgr_1",
    name: "Arun Arya",
    email: "arun@cyvora.com",
    role: ROLES.MANAGER,
    managerId: "",
    teamId: "team_1",
    status: "Active",
    joinedDate: "2025-02-01",
  },
  {
    id: "mgr_2",
    name: "Harshit",
    email: "harshit@cyvora.com",
    role: ROLES.MANAGER,
    managerId: "",
    teamId: "team_2",
    status: "Active",
    joinedDate: "2025-02-10",
  },
  {
    id: "emp_1",
    name: "Diyorbek",
    email: "diyorbek@cyvora.com",
    role: ROLES.EMPLOYEE,
    managerId: "mgr_1",
    teamId: "team_1",
    status: "Active",
    joinedDate: "2025-03-01",
  },
  {
    id: "emp_2",
    name: "Anjali",
    email: "anjali@cyvora.com",
    role: ROLES.EMPLOYEE,
    managerId: "mgr_2",
    teamId: "team_2",
    status: "Active",
    joinedDate: "2025-03-05",
  },
];
export function createEmptyTeam() {
  return {
    id: `team_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: "",
    managerId: "",
    memberIds: [],
    createdAt: new Date().toISOString().slice(0, 10),
  };
}

export const INITIAL_TEAMS = [
  {
    id: "team_1",
    name: "Sales - Team Arun",
    managerId: "mgr_1",
    memberIds: ["emp_1"],
    createdAt: "2025-02-01",
  },
  {
    id: "team_2",
    name: "Sales - Team Harshit",
    managerId: "mgr_2",
    memberIds: ["emp_2"],
    createdAt: "2025-02-10",
  },
];
export const INITIAL_TODOS = [
  {
    id: 1,
    title: "Follow up with ABC Pvt Ltd",
    dueDate: "2026-07-25",
    priority: "High",
    status: "Pending",
    notes: "Need manager approval before sending quotation.",
  },
  {
    id: 2,
    title: "Update CRM Records",
    dueDate: "2026-07-26",
    priority: "Medium",
    status: "In Progress",
    notes: "Update after client meeting.",
  },
  {
    id: 3,
    title: "Prepare Proposal",
    dueDate: "2026-07-27",
    priority: "Low",
    status: "Completed",
    notes: "Proposal shared with customer.",
  },
];

export const INITIAL_ASSIGNED_TASKS = [
  {
    id: 101,
    title: "Call XYZ Pvt Ltd",
    assignedBy: "Rahul Sharma",
    dueDate: "2026-07-25",
    priority: "High",
    status: "Pending",
    managerNotes:
      "Discuss pricing and schedule demo before Friday.",
    employeeUpdate: "",
  },
  {
    id: 102,
    title: "Prepare Monthly Sales Report",
    assignedBy: "Rahul Sharma",
    dueDate: "2026-07-28",
    priority: "Medium",
    status: "In Progress",
    managerNotes:
      "Include region-wise sales comparison.",
    employeeUpdate:
      "Revenue section completed.",
  },
  {
    id: 103,
    title: "Collect Customer Feedback",
    assignedBy: "Ankit Singh",
    dueDate: "2026-07-30",
    priority: "Low",
    status: "Pending",
    managerNotes:
      "Call only premium customers.",
    employeeUpdate: "",
  },
];

export const PRIORITY_OPTIONS = [
  {
    value: "High",
    label: "High",
  },
  {
    value: "Medium",
    label: "Medium",
  },
  {
    value: "Low",
    label: "Low",
  },
];

export const STATUS_OPTIONS = [
  {
    value: "Pending",
    label: "Pending",
  },
  {
    value: "In Progress",
    label: "In Progress",
  },
  {
    value: "Completed",
    label: "Completed",
  },
];
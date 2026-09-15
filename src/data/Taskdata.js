export const PRIORITY_OPTIONS = [
  { value: "High", label: "High" },
  { value: "Medium", label: "Medium" },
  { value: "Low", label: "Low" },
];

export const STATUS_OPTIONS = [
  { value: "Pending", label: "Pending" },
  { value: "In Progress", label: "In Progress" },
  { value: "Completed", label: "Completed" },
];

export const INITIAL_TODOS = [
  {
    id: 1,
    title: "Finish quotation for Digintra",
    dueDate: "2026-09-15",
    priority: "High",
    status: "Pending",
    notes: "Send updated rates before EOD.",
  },
  {
    id: 2,
    title: "Follow up with Kite on Germany route",
    dueDate: "2026-09-13",
    priority: "Medium",
    status: "In Progress",
    notes: "",
  },
  {
    id: 3,
    title: "Update promo list on LinkedIn",
    dueDate: "2026-09-10",
    priority: "Low",
    status: "Completed",
    notes: "Posted local bypass routes.",
  },
];

export const INITIAL_ASSIGNED_TASKS = [
  {
    id: 101,
    title: "Get CIS region routes from partners",
    assignedBy: "Arun Arya",
    dueDate: "2026-09-18",
    priority: "High",
    status: "Pending",
    managerNotes: "Focus on Kazakhstan and Uzbekistan first.",
    employeeUpdate: "",
  },
  {
    id: 102,
    title: "Test Uzbekistan Local Bypass route",
    assignedBy: "Arun Arya",
    dueDate: "2026-09-14",
    priority: "Medium",
    status: "In Progress",
    managerNotes: "Use AirSpider vendor for this test.",
    employeeUpdate: "Tested on tool, passed. Waiting on live traffic confirmation.",
  },
  {
    id: 103,
    title: "Share signed agreement with Zafta Link",
    assignedBy: "Harshit",
    dueDate: "2026-09-08",
    priority: "Low",
    status: "Completed",
    managerNotes: "",
    employeeUpdate: "Sent and countersigned.",
  },
];
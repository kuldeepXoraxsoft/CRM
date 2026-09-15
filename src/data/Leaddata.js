/* -----------------------------
    LEAD STATUS OPTIONS
    (format matches your Select component: { value, label })
----------------------------- */

export const LEAD_STATUS_OPTIONS = [
  { value: "New Lead", label: "New Lead" },
  { value: "Following Up", label: "Following Up" },
  { value: "Agreement Sent", label: "Agreement Sent" },
  { value: "Connected", label: "Connected" },
  { value: "On Hold", label: "On Hold" },
  { value: "Inactive", label: "Inactive" },
  { value: "Live", label: "Live" },
  { value: "Spam", label: "Spam" },
];

// Badge variant for each lead status (used with your <Badge variant="...">)
export const LEAD_STATUS_VARIANT = {
  "New Lead": "primary",
  "Following Up": "warning",
  "Agreement Sent": "warning",
  Connected: "primary",
  "On Hold": "neutral",
  Inactive: "danger",
  Live: "success",
  Spam: "neutral",
};

// Statuses jinke aane par lead ko "Convert to Account" karne ka option milega
export const CONVERTIBLE_STATUSES = ["Live", "Connected"];

export const AGREEMENT_STATUS_OPTIONS = [
  { value: "Not Sent", label: "Not Sent" },
  { value: "Sent", label: "Sent" },
  { value: "Signed", label: "Signed" },
  { value: "Not Required", label: "Not Required" },
];

export const PAYMENT_OPTIONS = [
  { value: "", label: "Select" },
  { value: "Prepay", label: "Prepay" },
  { value: "Postpay", label: "Postpay" },
];

export const LEAD_SOURCE_OPTIONS = [
  { value: "", label: "Select" },
  { value: "LinkedIn", label: "LinkedIn" },
  { value: "Event", label: "Event" },
  { value: "Referral", label: "Referral" },
  { value: "Website", label: "Website" },
  { value: "Cold Call", label: "Cold Call" },
  { value: "Other", label: "Other" },
];

/* -----------------------------
    TABLE COLUMN CONFIG
----------------------------- */

export const LEAD_TABLE_COLUMNS = [
  { key: "customerName", label: "Customer Name" },
  { key: "cyvoraAM", label: "Cyvora AM" },
  { key: "clientAM", label: "Client AM" },
  { key: "status", label: "Status" },
  { key: "traffic", label: "Traffic" },
  { key: "dateAdded", label: "Date Added" },
  { key: "followUpDate", label: "Follow-up Date" },
  { key: "nextStep", label: "Next Step" },
  { key: "agreementStatus", label: "Agreement Status" },
  { key: "payment", label: "Payment" },
  { key: "creditLimit", label: "Credit Limit" },
  { key: "leadSource", label: "Lead Source" },
  { key: "phoneNumber", label: "Phone Number" },
  { key: "email", label: "Email" },
];

/* -----------------------------
    EMPTY / NEW LEAD FACTORY
----------------------------- */

export function createEmptyLead() {
  return {
    id: `lead_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    customerName: "",
    cyvoraAM: "",
    clientAM: "",
    status: "New Lead",
    traffic: "",
    dateAdded: new Date().toISOString().slice(0, 10),
    followUpDate: "",
    followUpHistory: [],
    statusNotes: "",
    nextStep: "",
    dealsInProgress: "",
    agreementStatus: "Not Sent",
    payment: "",
    creditLimit: "",
    theirRoutes: "",
    theirRequirements: "",
    ratesOffered: "",
    routeListOnSheets: "",
    leadSource: "",
    phoneNumber: "",
    teams: "",
    email: "",
  };
}

/* -----------------------------
    SAMPLE INITIAL LEADS
----------------------------- */

export const INITIAL_LEADS = [
  {
    id: "lead_1001",
    customerName: "Digintra",
    cyvoraAM: "Arun Arya",
    clientAM: "Mimansa",
    status: "Live",
    traffic: "2000 OTP, Casino",
    dateAdded: "2026-08-03",
    followUpDate: "2026-08-10",
    followUpHistory: [],
    statusNotes: "Need to ask more routes next time.",
    nextStep: "Done",
    dealsInProgress: "",
    agreementStatus: "Signed",
    payment: "Postpay",
    creditLimit: "1000",
    theirRoutes: "",
    theirRequirements: "",
    ratesOffered: "",
    routeListOnSheets: "",
    leadSource: "",
    phoneNumber: "91 90310 65131",
    teams: "",
    email: "salesteam02@digintra.com",
  },
  {
    id: "lead_1002",
    customerName: "Kite",
    cyvoraAM: "Arun Arya",
    clientAM: "Dhruva Kumar",
    status: "Live",
    traffic: "1000",
    dateAdded: "2026-07-20",
    followUpDate: "2026-08-07",
    followUpHistory: [],
    statusNotes: "Have asked for Germany route. Keep HindIT route in backup.",
    nextStep: "Waiting on route confirmation",
    dealsInProgress: "",
    agreementStatus: "Not Sent",
    payment: "",
    creditLimit: "",
    theirRoutes: "",
    theirRequirements: "",
    ratesOffered: "",
    routeListOnSheets: "",
    leadSource: "",
    phoneNumber: "",
    teams: "",
    email: "",
  },
  {
    id: "lead_1003",
    customerName: "Braxis Technologies",
    cyvoraAM: "Anjali",
    clientAM: "Kimberly Trinh",
    status: "Agreement Sent",
    traffic: "",
    dateAdded: "2026-07-20",
    followUpDate: "2026-07-23",
    followUpHistory: [],
    statusNotes: "They gave us all documents, but couldn't provide TR.",
    nextStep: "Waiting for TR",
    dealsInProgress: "",
    agreementStatus: "Sent",
    payment: "",
    creditLimit: "",
    theirRoutes: "",
    theirRequirements: "",
    ratesOffered: "",
    routeListOnSheets: "",
    leadSource: "",
    phoneNumber: "",
    teams: "",
    email: "",
  },
  {
    id: "lead_1004",
    customerName: "Hamza Imran",
    cyvoraAM: "Diyorbek",
    clientAM: "",
    status: "New Lead",
    traffic: "",
    dateAdded: "2026-07-28",
    followUpDate: "2026-07-30",
    followUpHistory: [],
    statusNotes: "Interconnection request discussed, routes shared.",
    nextStep: "Waiting for reply",
    dealsInProgress: "Sim routes",
    agreementStatus: "Not Sent",
    payment: "",
    creditLimit: "",
    theirRoutes: "",
    theirRequirements: "",
    ratesOffered: "",
    routeListOnSheets: "",
    leadSource: "",
    phoneNumber: "",
    teams: "",
    email: "",
  },
];

/* -----------------------------
    HEADER MAP FOR BULK UPLOAD
    (Excel/CSV column header -> internal field key, lowercase match)
----------------------------- */

export const LEAD_HEADER_MAP = {
  "customer name": "customerName",
  "cyvora am": "cyvoraAM",
  "client am": "clientAM",
  status: "status",
  traffic: "traffic",
  "date added": "dateAdded",
  "follow-up date": "followUpDate",
  "follow up date": "followUpDate",
  "status (notes)": "statusNotes",
  "status notes": "statusNotes",
  notes: "statusNotes",
  "next step": "nextStep",
  "deals in progress": "dealsInProgress",
  "agreement status": "agreementStatus",
  "agreement statu": "agreementStatus",
  payment: "payment",
  "credit limit": "creditLimit",
  "their routes": "theirRoutes",
  "their requirements": "theirRequirements",
 "rates offered": "ratesOffered",
"rates we offered": "ratesOffered",
  "route list on sheets": "routeListOnSheets",
  "lead source": "leadSource",
  "phone number": "phoneNumber",
  teams: "teams",
  email: "email",
};
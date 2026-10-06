export const ACCOUNT_STATUS_OPTIONS = [
  { value: "Live", label: "Live" },
  { value: "On Hold", label: "On Hold" },
  { value: "Inactive", label: "Inactive" },
  { value: "Churned", label: "Churned" },
];

// Badge variant for each account status
export const ACCOUNT_STATUS_VARIANT = {
  Live: "success",
  "On Hold": "neutral",
  Inactive: "danger",
  Churned: "danger",
};

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

/* -----------------------------
    TABLE COLUMN CONFIG
----------------------------- */

export const ACCOUNT_TABLE_COLUMNS = [
  { key: "customerName", label: "Customer Name" },
  { key: "cyvoraAM", label: "Cyvora AM" },
  { key: "clientAM", label: "Client AM" },
  { key: "status", label: "Status" },
  { key: "traffic", label: "Traffic" },
  { key: "followUpDate", label: "Follow-up Date" },
  { key: "agreementStatus", label: "Agreement Status" },
  { key: "payment", label: "Payment" },
  { key: "creditLimit", label: "Credit Limit" },
  { key: "phoneNumber", label: "Phone Number" },
  { key: "email", label: "Email" },
];

/* -----------------------------
    EMPTY / NEW ACCOUNT FACTORY
----------------------------- */

export function createEmptyAccount() {
  return {
    id: `acct_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    customerName: "",
    cyvoraAM: "",
    clientAM: "",
    status: "Live",
    traffic: "",
    dateAdded: new Date().toISOString().slice(0, 10),
    followUpDate: "",
    followUpHistory: [],
    statusNotes: "",
    nextStep: "",
    agreementStatus: "Signed",
    payment: "",
    creditLimit: "",
    theirRoutes: "",
    theirRequirements: "",
    ratesOffered: "",
    routeListOnSheets: "",
    phoneNumber: "",
    teams: "",
    email: "",
    convertedFromLeadId: null,
    convertedAt: null,
  };
}

/**
 * Converts a Lead object into a new Account object once a deal is closed
 * (e.g. status becomes "Live" / "Connected" on the Leads page).
 */
export function convertLeadToAccount(lead) {
  return {
    ...createEmptyAccount(),
    ...lead,
    id: `acct_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    status: "Live",
    agreementStatus:
      lead.agreementStatus && lead.agreementStatus !== "Not Sent"
        ? lead.agreementStatus
        : "Signed",
    convertedFromLeadId: lead.id,
    convertedAt: new Date().toISOString(),
  };
}

/* -----------------------------
    SAMPLE INITIAL ACCOUNTS
----------------------------- */

export const INITIAL_ACCOUNTS = [
  {
    ...createEmptyAccount(),
    id: "acct_2001",
    customerName: "HK kwaifong Group Limited",
    cyvoraAM: "Arun Arya",
    clientAM: "Apple Cheng",
    status: "Live",
    traffic: "Mexico SIM route, high volume",
    dateAdded: "2026-06-01",
    followUpDate: "2026-08-06",
    followUpHistory: [],
    agreementStatus: "Signed",
    payment: "Postpay",
    creditLimit: "5000",
  },
  {
    ...createEmptyAccount(),
    id: "acct_2002",
    customerName: "Itnio Tech",
    cyvoraAM: "Arun Arya",
    clientAM: "Randall He",
    status: "Live",
    traffic: "Colombia, Pakistan WhatsApp routes",
    dateAdded: "2026-06-10",
    followUpDate: "2026-08-03",
    followUpHistory: [],
    agreementStatus: "Signed",
    payment: "Postpay",
    creditLimit: "1000",
  },
  {
    ...createEmptyAccount(),
    id: "acct_2003",
    customerName: "Beenet",
    cyvoraAM: "Arun Arya",
    clientAM: "Nidhi",
    status: "Live",
    traffic: "Australia testing traffic",
    dateAdded: "2026-06-06",
    followUpDate: "2026-07-30",
    followUpHistory: [],
    agreementStatus: "Signed",
    payment: "Postpay",
    creditLimit: "1000",
  },
];
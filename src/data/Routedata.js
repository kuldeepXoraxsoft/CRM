/* -----------------------------
    ROUTE TYPE (connection/technical type)
----------------------------- */

export const ROUTE_TYPE_OPTIONS = [
  { value: "HQ", label: "HQ (High Quality)" },
  { value: "Direct", label: "Direct (0 Hop)" },
  { value: "SIM", label: "SIM" },
  { value: "Local Bypass", label: "Local Bypass" },
  { value: "SS7", label: "SS7" },
];

export const ROUTE_TYPE_VARIANT = {
  HQ: "primary",
  Direct: "success",
  SIM: "warning",
  "Local Bypass": "primary",
  SS7: "neutral",
};

/* -----------------------------
    CONTENT TYPE (what's allowed on this route)
----------------------------- */

export const CONTENT_TYPE_OPTIONS = [
  { value: "OTP", label: "OTP" },
  { value: "Transactional", label: "Transactional" },
  { value: "WhatsApp", label: "WhatsApp" },
  { value: "Marketing", label: "Marketing / Promo" },
  { value: "Casino", label: "Casino / Betting" },
];

export const CONTENT_TYPE_VARIANT = {
  OTP: "success",
  Transactional: "primary",
  WhatsApp: "success",
  Marketing: "warning",
  Casino: "danger",
};

/* -----------------------------
    ROUTE STATUS
----------------------------- */

export const ROUTE_STATUS_OPTIONS = [
  { value: "Active", label: "Active" },
  { value: "Testing", label: "Testing" },
  { value: "Down", label: "Down" },
  { value: "Inactive", label: "Inactive" },
];

export const ROUTE_STATUS_VARIANT = {
  Active: "success",
  Testing: "warning",
  Down: "danger",
  Inactive: "neutral",
};

/* -----------------------------
    TABLE COLUMN CONFIG
----------------------------- */

export const ROUTE_TABLE_COLUMNS = [
  { key: "destination", label: "Destination" },
  { key: "network", label: "Network" },
  { key: "routeType", label: "Route Type" },
  { key: "contentType", label: "Content" },
  { key: "sid", label: "SID" },
  { key: "vendor", label: "Vendor" },
  { key: "costRate", label: "Cost" },
  { key: "sellingRate", label: "Selling Rate" },
  { key: "capacity", label: "Capacity" },
  { key: "dlr", label: "DLR %" },
  { key: "status", label: "Status" },
  { key: "lastTested", label: "Last Tested" },
];

/* -----------------------------
    EMPTY / NEW ROUTE FACTORY
----------------------------- */

export function createEmptyRoute() {
  return {
    id: `route_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    destination: "",
    network: "All",
    routeType: "HQ",
    contentType: "OTP",
    sid: "",
    vendor: "",
    costRate: "",
    sellingRate: "",
    capacity: "",
    dlr: "",
    status: "Testing",
    lastTested: new Date().toISOString().slice(0, 10),
    notes: "",
  };
}

/* -----------------------------
    SAMPLE INITIAL ROUTES
    (mix of route types / content types, matching the shape of the
    real route sheet - Cost = what we pay the vendor, Selling Rate =
    what we offer clients)
----------------------------- */

export const INITIAL_ROUTES = [
  {
    id: "route_1001",
    destination: "Mexico",
    network: "All",
    routeType: "SIM",
    contentType: "OTP",
    sid: "",
    vendor: "Mexico_DIR",
    costRate: "0.0013",
    sellingRate: "0.0022",
    capacity: "50k/day",
    dlr: "98",
    status: "Active",
    lastTested: "2026-08-10",
    notes: "Highest volume route, HKKwaifong live on this.",
  },
  {
    id: "route_1002",
    destination: "USA",
    network: "AT&T / T-Mobile",
    routeType: "SIM",
    contentType: "OTP",
    sid: "+1",
    vendor: "USA_SIM",
    costRate: "0.015",
    sellingRate: "0.019",
    capacity: "20k/day",
    dlr: "95",
    status: "Active",
    lastTested: "2026-08-08",
    notes: "No phishing content allowed.",
  },
  {
    id: "route_1003",
    destination: "India",
    network: "All",
    routeType: "Local Bypass",
    contentType: "Transactional",
    sid: "",
    vendor: "Pai_Local",
    costRate: "0.0012",
    sellingRate: "0.0016",
    capacity: "100k/day",
    dlr: "97",
    status: "Active",
    lastTested: "2026-08-12",
    notes: "RigelVoice_Local running traffic on this.",
  },
  {
    id: "route_1004",
    destination: "Pakistan",
    network: "All",
    routeType: "HQ",
    contentType: "WhatsApp",
    sid: "WA-SID-01",
    vendor: "Pinnacle_WP",
    costRate: "0.0066",
    sellingRate: "0.0092",
    capacity: "15k/day",
    dlr: "92",
    status: "Active",
    lastTested: "2026-08-05",
    notes: "",
  },
  {
    id: "route_1005",
    destination: "Portugal",
    network: "Vodafone",
    routeType: "HQ",
    contentType: "Casino",
    sid: "",
    vendor: "Digintra_HQ",
    costRate: "0.018",
    sellingRate: "0.028",
    capacity: "5k/day",
    dlr: "90",
    status: "Testing",
    lastTested: "2026-08-01",
    notes: "Need lower rate to promote further, target 0.025.",
  },
  {
    id: "route_1006",
    destination: "Turkey",
    network: "All",
    routeType: "Direct",
    contentType: "Marketing",
    sid: "",
    vendor: "Pai_Promo",
    costRate: "0.004",
    sellingRate: "0.0065",
    capacity: "40k/day",
    dlr: "94",
    status: "Active",
    lastTested: "2026-08-11",
    notes: "",
  },
  {
    id: "route_1007",
    destination: "Bangladesh",
    network: "All",
    routeType: "Direct",
    contentType: "OTP",
    sid: "",
    vendor: "HindIT_MKT",
    costRate: "0.011",
    sellingRate: "0.015",
    capacity: "10k/day",
    dlr: "96",
    status: "Active",
    lastTested: "2026-07-28",
    notes: "",
  },
  {
    id: "route_1008",
    destination: "Kazakhstan",
    network: "Beeline",
    routeType: "Local Bypass",
    contentType: "Transactional",
    sid: "",
    vendor: "Pai_Local",
    costRate: "0.044",
    sellingRate: "0.05",
    capacity: "8k/day",
    dlr: "89",
    status: "Down",
    lastTested: "2026-07-20",
    notes: "Vendor side issue, waiting on fix.",
  },
  {
    id: "route_1009",
    destination: "Nigeria",
    network: "MTN",
    routeType: "SIM",
    contentType: "WhatsApp",
    sid: "WA-SID-02",
    vendor: "Beenet_SIM",
    costRate: "0.015",
    sellingRate: "0.021",
    capacity: "12k/day",
    dlr: "91",
    status: "Active",
    lastTested: "2026-08-09",
    notes: "",
  },
  {
    id: "route_1010",
    destination: "Colombia",
    network: "All",
    routeType: "Direct",
    contentType: "OTP",
    sid: "",
    vendor: "Pai_Dir",
    costRate: "0.0015",
    sellingRate: "0.0022",
    capacity: "60k/day",
    dlr: "98",
    status: "Active",
    lastTested: "2026-08-12",
    notes: "ITNIO live on this route.",
  },
  {
    id: "route_1011",
    destination: "Malaysia",
    network: "All",
    routeType: "Local Bypass",
    contentType: "Casino",
    sid: "",
    vendor: "Beenet_SIM",
    costRate: "0.006",
    sellingRate: "0.0125",
    capacity: "5k/day",
    dlr: "85",
    status: "Testing",
    lastTested: "2026-08-02",
    notes: "Being tested for a large casino client.",
  },
  {
    id: "route_1012",
    destination: "Egypt",
    network: "Orange",
    routeType: "SIM",
    contentType: "Transactional",
    sid: "",
    vendor: "AirSpider",
    costRate: "0.019",
    sellingRate: "0.026",
    capacity: "7k/day",
    dlr: "93",
    status: "Inactive",
    lastTested: "2026-07-15",
    notes: "Parked - no active demand right now.",
  },
];
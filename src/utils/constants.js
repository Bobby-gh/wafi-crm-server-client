// ================================================================
// WAFI CAPITAL CRM - Constants
// Brand colors, storage keys, and configuration constants
// ================================================================

console.log("[CONSTANTS] Initializing application constants...");

// Brand color palette
export const C = {
  navy950: "#0a1830",
  navy900: "#0e2340",
  navy800: "#16325c",
  navy700: "#20406f",
  gold500: "#c9a227",
  gold400: "#dab94a",
  paper: "#f6f4ee",
  paper2: "#ece7d9",
  ink: "#1c2430",
  inkSoft: "#5b6472",
  line: "#d8d2c0",
  green: "#3b6b4f",
  greenBg: "#e2ede5",
  yellow: "#8a6a12",
  yellowBg: "#f7edcf",
  red: "#9a3b3b",
  redBg: "#f5e2e2",
};

// Storage and configuration
export const STORAGE_PREFIX = "application:";
export const MAX_FILE_BYTES = 3.5 * 1024 * 1024;
export const DEFAULT_PROCESSING_DAYS = 30;

// Status constants (English, matching backend)
export const STATUS = {
  NEW: "New",
  IN_PROGRESS: "In Progress",
  PROCESSED: "Processed",
  REJECTED: "Rejected",
};

// Status labels (French, for UI display)
export const STATUS_LABELS = {
  [STATUS.NEW]: "Nouveau",
  [STATUS.IN_PROGRESS]: "En cours",
  [STATUS.PROCESSED]: "Traité",
  [STATUS.REJECTED]: "Rejeté",
};

// Customer type constants
export const CUSTOMER_TYPE = {
  COMPANY: "Company",
  SOCIETY: "Society",
};

// Customer type labels (French, for UI display)
export const CUSTOMER_TYPE_LABELS = {
  [CUSTOMER_TYPE.COMPANY]: "Société",
  [CUSTOMER_TYPE.SOCIETY]: "Personne physique",
};

// Empty form template (matching backend data model)
export const EMPTY_FORM = {
  typeOfCustomer: CUSTOMER_TYPE.COMPANY,
  companyName: "",
  contactName: "",
  email: "",
  phone: "",
  attachment: "",
  subject: "",
  receivedAt: "",
  processingDays: DEFAULT_PROCESSING_DAYS,
  status: STATUS.NEW,
  closingDate: "",
  notes: "",
};

console.log("[CONSTANTS] Brand colors loaded:", Object.keys(C).length, "colors");

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
export const STORAGE_KEY = "wafi-crm-data";
export const MAX_FILE_BYTES = 3.5 * 1024 * 1024;

// Empty form template
export const EMPTY_FORM = {
  clientType: "Société",
  org: "",
  name: "",
  email: "",
  phone: "",
  attachment: "",
  subject: "",
  receivedAt: "",
  delayDays: 30,
  status: "Nouveau",
  treatedAt: "",
  notes: "",
};

console.log("[CONSTANTS] Brand colors loaded:", Object.keys(C).length, "colors");
console.log("[CONSTANTS] Storage key:", STORAGE_KEY);
console.log("[CONSTANTS] Max file size:", MAX_FILE_BYTES, "bytes");

// ================================================================
// WAFI CAPITAL CRM - Helper Functions
// Utility functions for date handling, formatting, and data processing
// ================================================================

import { STATUS } from "./constants";

console.log("[HELPERS] Initializing helper functions...");

// Date utilities
export function toLocalInputValue(date) {
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return "";
  const offset = value.getTimezoneOffset() * 60000;
  return new Date(value.getTime() - offset).toISOString().slice(0, 16);
}

export function toDateInputValue(date) {
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return "";
  return toLocalInputValue(value).slice(0, 10);
}

export function formatDisplayDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return { date: "-", time: "-" };
  }
  return {
    date: date.toLocaleDateString("fr-FR"),
    time: date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
  };
}

export function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 10) / 10 + " " + sizes[i];
}

// Unique ID generator
export function newId(prefix = "id") {
  return prefix + "_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
}

// Reference generator for applications
export function refFor(app) {
  if (!app) return "—";
  const seq = String(app.seq || 0).padStart(4, "0");
  return `#${seq}`;
}

// Compliance color based on deadline
export function complianceColor(app) {
  if (!app) return "green";

  const now = new Date();
  const deadline = computeDeadline(app);

  if (app.status === STATUS.PROCESSED) {
    const closed = app.closingDate ? new Date(app.closingDate) : null;
    if (closed && closed <= deadline) return "green";
    return "red";
  }

  if (now > deadline) return "red";

  const daysUntilDeadline = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
  if (daysUntilDeadline <= 3) return "yellow";

  return "green";
}

// Compute deadline for application
export function computeDeadline(app) {
  if (!app || !app.receivedAt) return new Date();

  const received = new Date(app.receivedAt);
  const processingDays = Number(app.processingDays) || 30;
  return new Date(received.getTime() + processingDays * 24 * 60 * 60 * 1000);
}

// Organization name normalization
export function normalizeOrganizationName(user, fallback = "") {
  return (
    user?.organizationName ||
    user?.organization?.name ||
    user?.organization?.organizationName ||
    user?.orgName ||
    fallback ||
    ""
  );
}

// User list normalization
export function normalizeUserList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.users)) return data.users;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

// Admin check
export function isAdminUser(user) {
  const role = (user?.role || user?.userRole || "").toString().toLowerCase();
  return Boolean(
    user?.isAdmin ||
    user?.admin ||
    user?.is_admin ||
    user?.isSuperAdmin ||
    role === "admin" ||
    role === "administrator" ||
    role === "superadmin" ||
    role === "super_admin"
  );
}

// User display name
export function userDisplayName(user) {
  return user?.fullName || user?.name || user?.username || user?.email || "Utilisateur";
}

// Role label
export function roleLabel(user) {
  return isAdminUser(user) ? "Administrateur" : (user?.role || "Utilisateur");
}

// Generate a UUID for application keys
export function generateAppId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback UUID v4 generator
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ================================================================
// WAFI CAPITAL CRM - Helper Functions
// Utility functions for date handling, formatting, and data processing
// ================================================================

console.log("[HELPERS] Initializing helper functions...");

// Date utilities
export function toLocalInputValue(date) {
  console.log("[HELPERS] Converting date to local input value:", date);
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) {
    console.warn("[HELPERS] Invalid date provided:", date);
    return "";
  }
  const offset = value.getTimezoneOffset() * 60000;
  return new Date(value.getTime() - offset).toISOString().slice(0, 16);
}

export function toDateInputValue(date) {
  console.log("[HELPERS] Converting date to date input value:", date);
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) {
    console.warn("[HELPERS] Invalid date provided:", date);
    return "";
  }
  return toLocalInputValue(value).slice(0, 10);
}

export function formatDisplayDate(value) {
  console.log("[HELPERS] Formatting display date:", value);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    console.warn("[HELPERS] Invalid date for display formatting:", value);
    return { date: "-", time: "-" };
  }
  return {
    date: date.toLocaleDateString("fr-FR"),
    time: date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
  };
}

export function formatBytes(bytes) {
  console.log("[HELPERS] Formatting bytes:", bytes);
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 10) / 10 + " " + sizes[i];
}

// Unique ID generator
export function newId(prefix = "id") {
  const id = prefix + "_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
  console.log("[HELPERS] Generated new ID:", id);
  return id;
}

// Reference generator for contacts
export function refFor(contact) {
  console.log("[HELPERS] Generating reference for contact:", contact?.id);
  if (!contact) return "—";
  const seq = String(contact.seq || 0).padStart(4, "0");
  return `#${seq}`;
}

// Compliance color based on deadline
export function complianceColor(contact) {
  console.log("[HELPERS] Computing compliance color for contact:", contact?.id);
  if (!contact) return "green";
  
  const now = new Date();
  const deadline = computeDeadline(contact);
  
  if (contact.status === "Traité") {
    const treatedDate = contact.treatedAt ? new Date(contact.treatedAt) : null;
    if (treatedDate && treatedDate <= deadline) {
      console.log("[HELPERS] Contact treated on time - GREEN");
      return "green";
    }
    console.log("[HELPERS] Contact treated late - RED");
    return "red";
  }
  
  if (now > deadline) {
    console.log("[HELPERS] Deadline exceeded - RED");
    return "red";
  }
  
  const daysUntilDeadline = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
  if (daysUntilDeadline <= 3) {
    console.log("[HELPERS] Deadline approaching (", daysUntilDeadline, "days) - YELLOW");
    return "yellow";
  }
  
  console.log("[HELPERS] All good - GREEN");
  return "green";
}

// Compute deadline for contact
export function computeDeadline(contact) {
  console.log("[HELPERS] Computing deadline for contact:", contact?.id);
  if (!contact || !contact.receivedAt) {
    console.warn("[HELPERS] No valid contact or receivedAt date");
    return new Date();
  }
  
  const received = new Date(contact.receivedAt);
  const delayDays = Number(contact.delayDays) || 30;
  const deadline = new Date(received.getTime() + delayDays * 24 * 60 * 60 * 1000);
  
  console.log("[HELPERS] Deadline computed:", deadline, "with delay of", delayDays, "days");
  return deadline;
}

// Organization name normalization
export function normalizeOrganizationName(user, fallback = "") {
  console.log("[HELPERS] Normalizing organization name for user");
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
  console.log("[HELPERS] Normalizing user list:", data);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.users)) return data.users;
  if (Array.isArray(data?.data)) return data.data;
  console.warn("[HELPERS] Could not normalize user list");
  return [];
}

// Admin check
export function isAdminUser(user) {
  console.log("[HELPERS] Checking if user is admin");
  const role = (user?.role || user?.userRole || "").toString().toLowerCase();
  const isAdmin = Boolean(
    user?.isAdmin ||
    user?.admin ||
    user?.is_admin ||
    user?.isSuperAdmin ||
    role === "admin" ||
    role === "administrator" ||
    role === "superadmin" ||
    role === "super_admin"
  );
  console.log("[HELPERS] User admin status:", isAdmin);
  return isAdmin;
}

// User display name
export function userDisplayName(user) {
  const name = user?.fullName || user?.name || user?.username || user?.email || "Utilisateur";
  console.log("[HELPERS] User display name:", name);
  return name;
}

// Role label
export function roleLabel(user) {
  const label = isAdminUser(user) ? "Administrateur" : (user?.role || "Utilisateur");
  console.log("[HELPERS] Role label:", label);
  return label;
}

console.log("[HELPERS] All helper functions loaded successfully");

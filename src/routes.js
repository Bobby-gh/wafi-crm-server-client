// ================================================================
// WAFI CAPITAL CRM - API Routes
// Centralized endpoint paths for all backend API calls
// ================================================================

const ROUTES = {
  // Auth
  AUTH: {
    SIGNUP: "/api/signup",
    LOGIN: "/api/login",
    LOGOUT: "/api/logout",
    ME: "/api/me",
    CHANGE_PASSWORD: "/api/auth/change-password",
  },

  // Storage (individual application records)
  STORAGE: {
    LIST: "/api/storage",
    GET: (key) => `/api/storage/${encodeURIComponent(key)}`,
    SET: (key) => `/api/storage/${encodeURIComponent(key)}`,
    DELETE: (key) => `/api/storage/${encodeURIComponent(key)}`,
  },

  // Users (admin only)
  USERS: {
    LIST: "/api/users",
    CREATE: "/api/users",
  },
};

export default ROUTES;

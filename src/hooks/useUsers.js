// ================================================================
// WAFI CAPITAL CRM - Users Hook
// User management API calls (admin only)
// ================================================================

import api from "../api";
import ROUTES from "../routes";

/**
 * List all users in the current organization.
 * GET /api/users
 * → { users: [{ id, username, email, organizationId, isAdmin, mustChangePassword, ... }] }
 */
export async function listUsers() {
  const { data } = await api.get(ROUTES.USERS.LIST);
  return data;
}

/**
 * Create a new user in the current organization.
 * POST /api/users
 * Body: { username, email? }
 * → 201: { user, temporaryPassword, message }
 *
 * The temporaryPassword is a one-time secret — show it to the admin immediately.
 * There is no email delivery — the admin must share it manually.
 */
export async function createUser({ username, email }) {
  const { data } = await api.post(ROUTES.USERS.CREATE, { username, email });
  return data;
}

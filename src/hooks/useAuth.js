// ================================================================
// WAFI CAPITAL CRM - Auth Hook
// All authentication-related API calls
// ================================================================

import api from "../api";
import ROUTES from "../routes";

/**
 * Sign up — creates a new organization and admin user.
 * POST /api/signup
 * Body: { username, password, email?, organizationName? }
 * → 201: { username, email, token, message }
 */
export async function signup({ username, password, email, organizationName }) {
  const { data } = await api.post(ROUTES.AUTH.SIGNUP, {
    username,
    password,
    email,
    organizationName,
  });
  return data;
}

/**
 * Login — authenticate with username/email and password.
 * POST /api/login
 * Body: { username, password } or { email, password }
 * → 200: { username, token, user, mustChangePassword }
 */
export async function login({ username, password }) {
  const { data } = await api.post(ROUTES.AUTH.LOGIN, { username, password });
  return data;
}

/**
 * Logout — invalidate the current session.
 * POST /api/logout
 * → 200: { ok: true }
 */
export async function logout() {
  const { data } = await api.post(ROUTES.AUTH.LOGOUT);
  return data;
}

/**
 * Get the currently authenticated user.
 * GET /api/me
 * → 200: { username, organizationName, isAdmin, mustChangePassword, ... }
 */
export async function getCurrentUser() {
  const { data } = await api.get(ROUTES.AUTH.ME);
  return data;
}

/**
 * Change password (required when mustChangePassword is true).
 * POST /api/auth/change-password
 * Headers: Authorization: Bearer <token>
 * Body: { currentPassword, newPassword }
 * → 200: { user, message, token? }
 */
export async function changePassword({ currentPassword, newPassword }) {
  const { data } = await api.post(ROUTES.AUTH.CHANGE_PASSWORD, {
    currentPassword,
    newPassword,
  });
  return data;
}

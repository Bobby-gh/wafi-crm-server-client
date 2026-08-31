// ================================================================
// WAFI CAPITAL CRM - Applications Hook
// All application (customer request) CRUD API calls
// ================================================================

import api from "../api";
import ROUTES from "../routes";
import { STORAGE_PREFIX } from "../utils/constants";

function applicationKey(id) {
  return STORAGE_PREFIX + id;
}

/**
 * List all applications for the current organization.
 * GET /api/storage?prefix=application:
 *
 * Admin users receive full records with parsedValue.
 * Non-admin users only receive keys — each is fetched individually.
 *
 * → Array of application objects with `id` added from the key.
 */
export async function listApplications() {
  const { data } = await api.get(ROUTES.STORAGE.LIST, {
    params: { prefix: STORAGE_PREFIX },
  });

  // Normalize: the API may return an array or { keys: [...] }
  const items = Array.isArray(data) ? data : Array.isArray(data?.keys) ? data.keys.map((k) => ({ key: k })) : [];

  const results = await Promise.all(
    items.map(async (item) => {
      const key = item.key || "";
      if (!key.startsWith(STORAGE_PREFIX)) return null;
      const id = key.replace(STORAGE_PREFIX, "");

      // If parsedValue is already present (admin), use it
      if (item.parsedValue) {
        const parsed = typeof item.parsedValue === "string" ? JSON.parse(item.parsedValue) : item.parsedValue;
        return { id, ...parsed };
      }
      // If value is present, parse it
      if (item.value) {
        const parsed = typeof item.value === "string" ? JSON.parse(item.value) : item.value;
        return { id, ...parsed };
      }
      // Otherwise fetch the individual record
      try {
        return await getApplication(id);
      } catch {
        return null;
      }
    }),
  );

  return results.filter(Boolean);
}

/**
 * Fetch a single application by ID.
 * GET /api/storage/application:<uuid>
 * → { id, ...applicationData }
 */
export async function getApplication(id) {
  const key = applicationKey(id);
  const { data } = await api.get(ROUTES.STORAGE.GET(key));
  const parsed = typeof data.value === "string" ? JSON.parse(data.value) : data.parsedValue || data.value;
  return { id, ...parsed };
}

/**
 * Create or update an application (full replace).
 * PUT /api/storage/application:<uuid>
 * Body: { value: JSON.stringify(applicationData) }
 * → { key, value, parsedValue, organizationId, userId, updatedAt }
 */
export async function saveApplication(id, appData) {
  const key = applicationKey(id);
  const value = JSON.stringify(appData);
  const { data } = await api.put(ROUTES.STORAGE.SET(key), { value });
  return data;
}

/**
 * Delete an application.
 * DELETE /api/storage/application:<uuid>
 * → { key, deleted: true }
 */
export async function deleteApplication(id) {
  const key = applicationKey(id);
  const { data } = await api.delete(ROUTES.STORAGE.DELETE(key));
  return data;
}

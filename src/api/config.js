/**
 * Central switch for the data layer.
 *
 * Only auth is backed by a real API so far (see src/auth/AuthContext.jsx, which
 * calls `httpClient` directly against VITE_API_BASE_URL). Every other resource is
 * still served by the in-memory/localStorage mock server in `src/api/mock`. Once a
 * given resource's endpoints go live, no other code needs to change for it - once
 * ALL resources are live, set VITE_USE_MOCK_API=false to cut `apiClient`
 * (src/api/apiClient.js) and every hook built on top of it over to `httpClient` too.
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== "false";

export const AUTH_TOKEN_STORAGE_KEY = "aurelia_admin_auth_token";
export const AUTH_USER_STORAGE_KEY = "aurelia_admin_auth_user";

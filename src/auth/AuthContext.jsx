import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { httpClient, AUTH_UNAUTHORIZED_EVENT } from "../api/httpClient";
import { AUTH_TOKEN_STORAGE_KEY, AUTH_USER_STORAGE_KEY } from "../api/config";
import { queryClient } from "../app/queryClient";
import { ROLE_PERMISSIONS } from "./rolePermissions";
import { decodeJwtPayload } from "../utils/jwt";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(undefined);

function readStoredUser() {
  try {
    const raw = window.localStorage.getItem(AUTH_USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState(null);

  useEffect(() => {
    const token = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    const storedUser = readStoredUser();
    if (token && storedUser) {
      setUser(storedUser);
    }
    setIsInitializing(false);
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    setUser(null);
    queryClient.clear();
  }, []);

  useEffect(() => {
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, logout);
    return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, logout);
  }, [logout]);

  const login = useCallback(async ({ identifier, password, rememberMe }) => {
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const { data: body } = await httpClient.post("/admin/signin", { identifier, password, rememberMe });
      if (!body?.success) {
        throw new Error(body?.message ?? "Unable to sign in. Please try again.");
      }

      // API response envelope: { success, message, data: { accessToken, user } }.
      // `data.user` currently comes back empty, so the admin's id/name/role are
      // read from the access token's claims instead, with `data.user` preferred
      // for any field it does provide.
      const token = body.data?.accessToken;
      if (!token) {
        throw new Error("Unexpected response from the server.");
      }

      const claims = decodeJwtPayload(token) ?? {};
      const serverUser = body.data?.user ?? {};
      const role = serverUser.role ?? claims.role;

      const authenticatedUser = {
        id: serverUser.id ?? serverUser._id ?? claims.sub,
        name: serverUser.name ?? claims.name,
        email: serverUser.email,
        role,
        permissions: ROLE_PERMISSIONS[role] ?? [],
      };

      window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
      window.localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(authenticatedUser));
      setUser(authenticatedUser);
    } catch (error) {
      const message = error?.response?.data?.message ?? error?.message ?? "Unable to sign in. Please try again.";
      setLoginError(message);
      throw error;
    } finally {
      setIsLoggingIn(false);
    }
  }, []);

  const hasPermission = useCallback((permission) => Boolean(user?.permissions.includes(permission)), [user]);

  const hasAnyPermission = useCallback(
    (permissions) => permissions.some((permission) => user?.permissions.includes(permission)),
    [user],
  );

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isInitializing,
      isLoggingIn,
      loginError,
      login,
      logout,
      hasPermission,
      hasAnyPermission,
    }),
    [user, isInitializing, isLoggingIn, loginError, login, logout, hasPermission, hasAnyPermission],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

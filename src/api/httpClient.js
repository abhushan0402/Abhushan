import axios from "axios";
import { API_BASE_URL, AUTH_TOKEN_STORAGE_KEY } from "./config";

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

httpClient.interceptors.request.use((config) => {
  const token = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Dispatched on any 401 so `AuthContext` can force a logout without a circular import. */
export const AUTH_UNAUTHORIZED_EVENT = "aurelia:auth-unauthorized";

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      window.dispatchEvent(new CustomEvent(AUTH_UNAUTHORIZED_EVENT));
    }
    return Promise.reject(error);
  },
);

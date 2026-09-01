import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "../../api/httpClient";

/**
 * Notifications are live on the real API (see swagger: /api/notifications).
 * Note this list/create is scoped to the CURRENT authenticated user (it's
 * "List user notifications" / "Create a notification (for testing/admin use)"
 * in the API docs, not a broadcast-to-all-customers endpoint) - confirmed by
 * creating one live and seeing it come back tagged with our own admin userId.
 */
const keys = {
  all: ["notifications"],
  lists: () => ["notifications", "list"],
  list: (params = {}) => ["notifications", "list", params],
};

function normalizeNotification(row) {
  return row && { ...row, id: row.id ?? row._id };
}

// Confirmed shape: { success, message, data: { notifications: [...], pagination: { currentPage, totalPages, totalCount, limit, unreadCount } } }.
function normalizeList(body) {
  const payload = body?.data ?? {};
  const rows = payload.notifications ?? payload.items ?? (Array.isArray(payload) ? payload : []);
  const total = payload.pagination?.totalCount ?? payload.total ?? rows.length;
  const unreadCount = payload.pagination?.unreadCount ?? rows.filter((row) => !row.isRead).length;
  return { data: rows.map(normalizeNotification), total, unreadCount };
}

function useList(params = {}, options) {
  const { page = 1, pageSize = 20, unreadOnly } = params;
  return useQuery({
    queryKey: keys.list(params),
    queryFn: async ({ signal }) => {
      const { data: body } = await httpClient.get("/notifications/", {
        params: { page, limit: pageSize, unreadOnly },
        signal,
      });
      return normalizeList(body);
    },
    ...options,
  });
}

// Body: { title (1-200 chars), body (1-1000 chars), type: order|promo|system|payment, data? }.
function useCreate(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data: body } = await httpClient.post("/notifications/", payload);
      return normalizeNotification(body?.data);
    },
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: keys.lists() });
      options.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

function useMarkRead(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { data: body } = await httpClient.patch(`/notifications/${id}/read`);
      return body;
    },
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: keys.lists() });
      options.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

function useMarkAllRead(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data: body } = await httpClient.patch("/notifications/read-all");
      return body;
    },
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: keys.lists() });
      options.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

function useRemove(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { data: body } = await httpClient.delete(`/notifications/${id}`);
      return body;
    },
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: keys.lists() });
      options.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export const useNotifications = { keys, useList, useCreate, useMarkRead, useMarkAllRead, useRemove };

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "../../api/httpClient";
import { toFormData, MULTIPART_HEADERS } from "../../utils/formData";

/**
 * Categories are live on the real API (see swagger: /api/admin/categories), so this
 * talks to `httpClient` directly instead of going through the mock-routed `apiClient`
 * used by other resources. Kept shaped like `createResourceHooks` (keys/useList/
 * useCreate/useUpdate/useRemove) so `useServerTable` and `CategoriesPage` don't care.
 */
const keys = {
  all: ["categories"],
  lists: () => ["categories", "list"],
  list: (params = {}) => ["categories", "list", params],
  details: () => ["categories", "detail"],
  detail: (id) => ["categories", "detail", id],
};

// Mongo documents come back as `_id`, but every other feature page (DataGrid
// getRowId, edit/delete targets, ...) is written against a plain `id`.
function normalizeCategory(row) {
  return row && { ...row, id: row.id ?? row._id };
}

// The list endpoint's documented response schema is a generic object (no fixed
// field names), so this accepts the common shapes a "categories + total" payload
// could arrive in. Tighten this once the real payload is confirmed.
function normalizeList(body) {
  const payload = body?.data ?? {};
  const rows = payload.categories ?? payload.items ?? payload.rows ?? (Array.isArray(payload) ? payload : []);
  const total = payload.total ?? payload.totalCount ?? payload.count ?? rows.length;
  return { data: rows.map(normalizeCategory), total };
}

function useList(params = {}, options) {
  // The real API doesn't support sorting, so sortBy/sortDir (added by useServerTable
  // for the generic mock-backed contract) are dropped rather than sent through.
  const { page = 1, pageSize, search, ...filters } = params;
  delete filters.sortBy;
  delete filters.sortDir;

  return useQuery({
    queryKey: keys.list(params),
    queryFn: async ({ signal }) => {
      const { data: body } = await httpClient.get("/admin/categories", {
        params: { page, limit: pageSize, search, ...filters },
        signal,
      });
      return normalizeList(body);
    },
    ...options,
  });
}

function useCreate(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data: body } = await httpClient.post("/admin/categories", toFormData(payload), MULTIPART_HEADERS);
      return normalizeCategory(body?.data);
    },
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: keys.lists() });
      options.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

function useUpdate(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const { data: body } = await httpClient.patch(`/admin/categories/${id}`, toFormData(data), MULTIPART_HEADERS);
      return normalizeCategory(body?.data);
    },
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: keys.lists() });
      queryClient.setQueryData(keys.detail(variables.id), data);
      options.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

function useRemove(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { data: body } = await httpClient.delete(`/admin/categories/${id}`);
      return body;
    },
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: keys.lists() });
      options.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export const useCategories = { keys, useList, useCreate, useUpdate, useRemove };

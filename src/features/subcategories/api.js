import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "../../api/httpClient";
import { toFormData, MULTIPART_HEADERS } from "../../utils/formData";

/**
 * Subcategories are live on the real API (see swagger: /api/admin/subcategories).
 * Same shape/pattern as `src/features/categories/api.js` - see that file for why
 * this bypasses the mock-routed `apiClient`.
 */
const keys = {
  all: ["subcategories"],
  lists: () => ["subcategories", "list"],
  list: (params = {}) => ["subcategories", "list", params],
  details: () => ["subcategories", "detail"],
  detail: (id) => ["subcategories", "detail", id],
};

// Mongo documents come back as `_id`; the UI is written against a plain `id`.
// `categoryId` also comes back as the full embedded category document (not a
// plain id string) on list/detail responses, so it's split into a plain
// `categoryId` string (for the edit form's select) plus `categoryName` (for
// display, without needing a separate categories lookup).
function normalizeSubCategory(row) {
  if (!row) return row;
  const embeddedCategory = row.categoryId && typeof row.categoryId === "object" ? row.categoryId : null;
  return {
    ...row,
    id: row.id ?? row._id,
    categoryId: embeddedCategory ? (embeddedCategory.id ?? embeddedCategory._id) : row.categoryId,
    categoryName: embeddedCategory?.name ?? row.categoryName,
  };
}

// Confirmed shape: { success, message, data: { subCategories: [...], total, ... } }.
function normalizeList(body) {
  const payload = body?.data ?? {};
  const rows = payload.subCategories ?? payload.subcategories ?? payload.items ?? payload.rows ?? (Array.isArray(payload) ? payload : []);
  const total = payload.total ?? payload.totalCount ?? payload.count ?? rows.length;
  return { data: rows.map(normalizeSubCategory), total };
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
      const { data: body } = await httpClient.get("/admin/subcategories", {
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
      const { data: body } = await httpClient.post("/admin/subcategories", toFormData(payload), MULTIPART_HEADERS);
      return { ...normalizeSubCategory(body?.data), message: body?.message };
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
      const { data: body } = await httpClient.patch(`/admin/subcategories/${id}`, toFormData(data), MULTIPART_HEADERS);
      return { ...normalizeSubCategory(body?.data), message: body?.message };
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
      const { data: body } = await httpClient.delete(`/admin/subcategories/${id}`);
      return body;
    },
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: keys.lists() });
      options.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export const useSubCategories = { keys, useList, useCreate, useUpdate, useRemove };

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "../../api/httpClient";
import { toFormData, MULTIPART_HEADERS } from "../../utils/formData";

/**
 * Products are live on the real API (see swagger: /api/admin/products). Same
 * shape/pattern as `src/features/categories/api.js` and `.../subcategories/api.js`
 * - see those for why this bypasses the mock-routed `apiClient`.
 */
const keys = {
  all: ["products"],
  lists: () => ["products", "list"],
  list: (params = {}) => ["products", "list", params],
  details: () => ["products", "detail"],
  detail: (id) => ["products", "detail", id],
};

// categoryId/subCategoryId come back as the full embedded document (confirmed for
// subcategories; products likely follow the same convention), not a plain id
// string, so each is split into a plain id + a *Name field for display.
function normalizeProduct(row) {
  if (!row) return row;
  const category = row.categoryId && typeof row.categoryId === "object" ? row.categoryId : null;
  const subCategory = row.subCategoryId && typeof row.subCategoryId === "object" ? row.subCategoryId : null;
  return {
    ...row,
    id: row.id ?? row._id,
    categoryId: category ? (category.id ?? category._id) : row.categoryId,
    categoryName: category?.name ?? row.categoryName,
    subCategoryId: subCategory ? (subCategory.id ?? subCategory._id) : row.subCategoryId,
    subCategoryName: subCategory?.name ?? row.subCategoryName,
  };
}

// Confirmed shape: { success, message, data: { products: [...], pagination: { total, page, limit, totalPages } } }.
function normalizeList(body) {
  const payload = body?.data ?? {};
  const rows = payload.products ?? payload.items ?? payload.rows ?? (Array.isArray(payload) ? payload : []);
  const total = payload.pagination?.total ?? payload.total ?? payload.totalCount ?? payload.count ?? rows.length;
  return { data: rows.map(normalizeProduct), total };
}

function useList(params = {}, options) {
  const { page = 1, pageSize, search, sortBy, sortDir, ...filters } = params;
  return useQuery({
    queryKey: keys.list(params),
    queryFn: async ({ signal }) => {
      const { data: body } = await httpClient.get("/admin/products", {
        params: { page, limit: pageSize, search, sortBy, sortOrder: sortDir, ...filters },
        signal,
      });
      return normalizeList(body);
    },
    ...options,
  });
}

function useDetail(id, options) {
  return useQuery({
    queryKey: keys.detail(id ?? ""),
    queryFn: async ({ signal }) => {
      const { data: body } = await httpClient.get(`/admin/products/${id}`, { signal });
      return normalizeProduct(body?.data);
    },
    enabled: Boolean(id),
    ...options,
  });
}

function useCreate(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data: body } = await httpClient.post("/admin/products", toFormData(payload), MULTIPART_HEADERS);
      return normalizeProduct(body?.data);
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
      const { data: body } = await httpClient.patch(`/admin/products/${id}`, toFormData(data), MULTIPART_HEADERS);
      return normalizeProduct(body?.data);
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
      const { data: body } = await httpClient.delete(`/admin/products/${id}`);
      return body;
    },
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: keys.lists() });
      options.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export const useProducts = { keys, useList, useDetail, useCreate, useUpdate, useRemove };

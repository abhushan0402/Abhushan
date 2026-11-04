import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "../../api/httpClient";

/**
 * GST is the only thing left on the legacy settings-style endpoint (see swagger:
 * /api/admin/worker-rates) - gold/silver making-charge rates moved to the dynamic
 * product CRUD below. GET's response schema isn't declared, so this reads
 * defensively, assuming it mirrors the PUT body - every other resource on this API
 * follows that convention.
 */
const keys = { detail: ["workerRates", "gst"] };

function useDetail(options) {
  return useQuery({
    queryKey: keys.detail,
    queryFn: async ({ signal }) => {
      const { data: body } = await httpClient.get("/admin/worker-rates", { signal });
      const payload = body?.data ?? {};
      return {
        gstPercentage: payload.gstPercentage ?? payload.gst ?? 3,
        updatedAt: payload.updatedAt,
      };
    },
    ...options,
  });
}

// Body: { gstPercentage }.
function useUpdate(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data: body } = await httpClient.put("/admin/worker-rates", payload);
      return body;
    },
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: keys.detail });
      options.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export const useWorkerRates = { keys, useDetail, useUpdate };

/**
 * Dynamic gold/silver worker-rate products - see handoff contract:
 * GET/POST/PUT/DELETE /api/admin/worker-rates/products.
 */
export const PRODUCT_CATEGORIES = ["GOLD", "SILVER"];

const productKeys = { list: ["workerRateProducts"] };

function normalizeProduct(row) {
  if (!row) return row;
  return {
    id: row.id ?? row._id,
    productName: row.productName,
    category: row.category,
    workerRate: row.workerRate,
    makingCharge: row.makingCharge ?? null,
    isActive: row.isActive ?? true,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function useProductList(options) {
  return useQuery({
    queryKey: productKeys.list,
    queryFn: async ({ signal }) => {
      const { data: body } = await httpClient.get("/admin/worker-rates/products", { signal });
      const rows = body?.data?.products ?? body?.data ?? [];
      return rows.map(normalizeProduct);
    },
    ...options,
  });
}

function useCreateProduct(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data: body } = await httpClient.post("/admin/worker-rates/products", payload);
      return { ...normalizeProduct(body?.data), message: body?.message };
    },
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: productKeys.list });
      options.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

function useUpdateProduct(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const { data: body } = await httpClient.put(`/admin/worker-rates/products/${id}`, data);
      return { ...normalizeProduct(body?.data), message: body?.message };
    },
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: productKeys.list });
      options.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

function useRemoveProduct(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { data: body } = await httpClient.delete(`/admin/worker-rates/products/${id}`);
      return body;
    },
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: productKeys.list });
      options.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export const useWorkerRateProducts = {
  keys: productKeys,
  useList: useProductList,
  useCreate: useCreateProduct,
  useUpdate: useUpdateProduct,
  useRemove: useRemoveProduct,
};

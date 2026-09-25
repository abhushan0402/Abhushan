import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "../../api/httpClient";

// Confirmed order status enum from the API - exact casing matters, it's sent as-is.
export const ORDER_STATUS_OPTIONS = ["Placed", "Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];

const keys = {
  all: ["orders"],
  lists: () => ["orders", "list"],
  list: (params = {}) => ["orders", "list", params],
  details: () => ["orders", "detail"],
  detail: (id) => ["orders", "detail", id],
};

function normalizeOrder(row) {
  if (!row) return row;
  const customer = row.userId && typeof row.userId === "object" ? row.userId : null;
  return {
    ...row,
    id: row.id ?? row._id,
    customerId: customer ? (customer.id ?? customer._id) : row.userId,
    customerName: customer ? `${customer.firstName ?? ""} ${customer.lastName ?? ""}`.trim() : row.customerName,
    customerEmail: customer?.email ?? row.customerEmail,
    customerPhone: customer?.mobile ?? row.customerPhone,
    // Field name isn't declared in swagger (order schema is additionalProperties:
    // true) - reads a few plausible shapes and falls back to the isPaid boolean
    // the payments endpoints imply exists.
    paymentStatus:
      row.paymentStatus ?? row.payment?.status ?? (row.isPaid != null ? (row.isPaid ? "paid" : "unpaid") : undefined),
  };
}

// Confirmed shape: { success, message, data: { orders: [...], pagination: { currentPage, totalPages, totalCount, limit } } }.
function normalizeList(body) {
  const payload = body?.data ?? {};
  const rows = payload.orders ?? payload.items ?? payload.rows ?? (Array.isArray(payload) ? payload : []);
  const total = payload.pagination?.totalCount ?? payload.pagination?.total ?? payload.total ?? rows.length;
  return { data: rows.map(normalizeOrder), total };
}

function useList(params = {}, options) {
  // The real API doesn't support search or sorting, so those (added by
  // useServerTable for the generic mock-backed contract) are dropped.
  const { page = 1, pageSize, ...filters } = params;
  delete filters.search;
  delete filters.sortBy;
  delete filters.sortDir;

  return useQuery({
    queryKey: keys.list(params),
    queryFn: async ({ signal }) => {
      const { data: body } = await httpClient.get("/admin/orders", {
        params: { page, limit: pageSize, ...filters },
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
      const { data: body } = await httpClient.get(`/admin/orders/${id}`, { signal });
      return normalizeOrder(body?.data);
    },
    enabled: Boolean(id),
    ...options,
  });
}

// Body: { orderStatus (required), trackingId?, cancelReason? }.
function useUpdateStatus(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const { data: body } = await httpClient.patch(`/admin/orders/${id}/status`, data);
      return normalizeOrder(body?.data);
    },
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: keys.lists() });
      // Invalidate rather than setQueryData(data) from the PATCH response - if the
      // endpoint ever echoes back a pre-update document, trusting it would cache
      // stale values right after a successful save.
      queryClient.invalidateQueries({ queryKey: keys.detail(variables.id) });
      options.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export const useOrders = { keys, useList, useDetail, useUpdateStatus };

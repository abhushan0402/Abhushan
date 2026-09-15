import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "../../api/httpClient";

/**
 * Customers are live on the real API via /api/admin/users. This endpoint now
 * supports real server-side pagination/search/role filtering (search, role,
 * isActive, page, limit query params) and wraps its list the same way every
 * other resource does - { users: [...], pagination: {...} } under `data` -
 * rather than the flat unpaginated array it used to return.
 */
const keys = {
  all: ["customers"],
  lists: () => ["customers", "list"],
  list: (params = {}) => ["customers", "list", params],
  details: () => ["customers", "detail"],
  detail: (id) => ["customers", "detail", id],
};

function normalizeCustomer(user) {
  return {
    id: user.id ?? user._id,
    name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email,
    email: user.email,
    phone: user.mobile,
    isActive: user.isActive,
    gender: user.gender,
    addressCount: user.addresses?.length ?? 0,
    createdAt: user.createdAt,
  };
}

// sortBy/sortDir aren't in the endpoint's supported param list (search, role,
// isActive, page, limit) - dropped rather than sent, same as orders/api.js does
// for the same reason.
function useList(params = {}, options) {
  const { page = 1, pageSize = 10, search } = params;

  return useQuery({
    queryKey: keys.list(params),
    queryFn: async ({ signal }) => {
      const { data: body } = await httpClient.get("/admin/users", {
        params: { page, limit: pageSize, search, role: "customer" },
        signal,
      });
      const payload = body?.data ?? {};
      const rows = (payload.users ?? payload.items ?? (Array.isArray(payload) ? payload : [])).map(normalizeCustomer);
      const total = payload.pagination?.total ?? payload.pagination?.totalCount ?? payload.total ?? rows.length;
      return { data: rows, total };
    },
    ...options,
  });
}

function pick(obj, ...keys) {
  for (const key of keys) {
    const value = obj?.[key];
    if (value !== undefined && value !== null) return value;
  }
  return undefined;
}

// GET /admin/users/{userId} - "Get user profile, order history, and statistics".
// Not strictly typed server-side (additionalProperties: true), so this reads
// defensively across a few plausible key-naming variants for the order
// history/stats section and normalizes into a stable shape for the detail view.
function normalizeCustomerDetail(body) {
  const data = body?.data ?? {};
  const profile = data.user ?? data.profile ?? data;

  const orders = (pick(data, "orders", "orderHistory", "recentOrders") ?? []).map((order) => ({
    id: order.id ?? order._id,
    orderNumber: order.orderNumber ?? `#${(order.id ?? order._id ?? "").toString().slice(-8).toUpperCase()}`,
    total: order.total ?? order.totalAmount ?? 0,
    status: order.status ?? order.orderStatus,
    createdAt: order.createdAt,
  }));

  const stats = pick(data, "stats", "statistics") ?? {};

  return {
    ...normalizeCustomer(profile),
    dateOfBirth: profile.dateOfBirth,
    profileImage: profile.profileImage,
    addresses: profile.addresses ?? [],
    orders,
    totalOrders: pick(stats, "totalOrders", "orderCount") ?? orders.length,
    totalSpent: pick(stats, "totalSpent", "totalSpend", "lifetimeValue"),
  };
}

function useDetail(id, options) {
  return useQuery({
    queryKey: keys.detail(id ?? ""),
    queryFn: async ({ signal }) => {
      const { data: body } = await httpClient.get(`/admin/users/${id}`, { signal });
      return normalizeCustomerDetail(body);
    },
    enabled: Boolean(id),
    ...options,
  });
}

// Body: { isActive: boolean }.
function useUpdateStatus(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }) => {
      const { data: body } = await httpClient.patch(`/admin/users/${id}/status`, { isActive });
      return body;
    },
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: keys.lists() });
      queryClient.invalidateQueries({ queryKey: keys.detail(variables.id) });
      options.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export const useCustomers = { keys, useList, useDetail, useUpdateStatus };

import { useQuery } from "@tanstack/react-query";
import { httpClient } from "../../api/httpClient";

/**
 * Customers are live on the real API, but via /api/admin/users - a single
 * unpaginated endpoint (no page/limit/search params) that returns every user,
 * admin and customer accounts mixed together. So this fetches the full list once
 * and does the role filter + search/sort/pagination client-side, returning the
 * same { data, total } shape `useServerTable`/`DataGridCard` expect from every
 * other (server-paginated) resource.
 */
const keys = {
  all: ["customers"],
  lists: () => ["customers", "list"],
  list: (params = {}) => ["customers", "list", params],
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

function matchesSearch(customer, term) {
  const needle = term.toLowerCase();
  return [customer.name, customer.email, customer.phone].some((value) =>
    String(value ?? "").toLowerCase().includes(needle),
  );
}

function useList(params = {}, options) {
  const { page = 1, pageSize = 10, search, sortBy, sortDir = "asc" } = params;

  return useQuery({
    queryKey: keys.list(params),
    queryFn: async ({ signal }) => {
      const { data: body } = await httpClient.get("/admin/users", { signal });
      let rows = (body?.data ?? []).filter((user) => user.role === "customer").map(normalizeCustomer);

      if (search) {
        rows = rows.filter((customer) => matchesSearch(customer, search));
      }

      if (sortBy) {
        rows = [...rows].sort((a, b) => {
          const av = a[sortBy];
          const bv = b[sortBy];
          const cmp =
            typeof av === "number" && typeof bv === "number" ? av - bv : String(av ?? "").localeCompare(String(bv ?? ""));
          return sortDir === "desc" ? -cmp : cmp;
        });
      }

      const total = rows.length;
      const start = (page - 1) * pageSize;
      return { data: rows.slice(start, start + pageSize), total };
    },
    ...options,
  });
}

export const useCustomers = { keys, useList };

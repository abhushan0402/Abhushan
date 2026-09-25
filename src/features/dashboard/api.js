import { useQuery } from "@tanstack/react-query";
import { httpClient } from "../../api/httpClient";

/**
 * Real endpoint: GET /api/admin/dashboard (see swagger - "Returns overview stats,
 * orders by status, low stock products, recent orders, and top selling products").
 * The response isn't strictly typed server-side (additionalProperties: true), so
 * this reads defensively across a few plausible key-naming variants (including
 * Mongo aggregation's `_id`-as-group-key shape) and normalizes into what the
 * dashboard cards below expect.
 */
function pick(obj, ...keys) {
  for (const key of keys) {
    const value = obj?.[key];
    if (value !== undefined && value !== null) return value;
  }
  return undefined;
}

function normalizeDashboard(body) {
  const data = body?.data ?? {};
  const overview = data.overview ?? data.stats ?? data;

  const orderStatusBreakdown = (pick(data, "ordersByStatus", "orderStatusBreakdown") ?? []).map((row) => ({
    status: row.status ?? row._id ?? row.orderStatus,
    count: row.count ?? row.total ?? 0,
  }));

  const recentOrders = (pick(data, "recentOrders") ?? []).map((order) => {
    const customer = order.userId && typeof order.userId === "object" ? order.userId : null;
    return {
      id: order.id ?? order._id,
      orderNumber: order.orderNumber ?? `#${(order.id ?? order._id ?? "").toString().slice(-8).toUpperCase()}`,
      customerName: order.customerName ?? (customer ? `${customer.firstName ?? ""} ${customer.lastName ?? ""}`.trim() : ""),
      total: order.total ?? order.totalAmount ?? 0,
      status: order.status ?? order.orderStatus,
      paymentStatus:
        order.paymentStatus ?? order.payment?.status ?? (order.isPaid != null ? (order.isPaid ? "paid" : "unpaid") : undefined),
    };
  });

  const lowStockProducts = (pick(data, "lowStockProducts") ?? []).map((p) => ({
    id: p.id ?? p._id,
    name: p.name,
    stock: p.stock,
    image: Array.isArray(p.images) ? p.images[0] : p.image,
  }));

  const topSellingProducts = (pick(data, "topSellingProducts", "topProducts") ?? []).map((p) => ({
    id: p.id ?? p._id ?? p.productId,
    name: p.name ?? p.productName,
    image: Array.isArray(p.images) ? p.images[0] : p.image,
    unitsSold: p.salesCount ?? p.unitsSold ?? p.quantitySold ?? 0,
    revenue: p.revenue ?? p.totalRevenue ?? 0,
  }));

  return {
    todaysSales: pick(overview, "todaysSales", "todaySales", "todayRevenue", "salesToday") ?? 0,
    monthSales: pick(overview, "monthSales", "thisMonthSales", "monthlyRevenue", "monthRevenue") ?? 0,
    pendingOrders: pick(overview, "pendingOrders", "pendingOrdersCount") ?? 0,
    lowStockSkus: pick(overview, "lowStockSkus", "lowStockCount") ?? lowStockProducts.length,
    orderStatusBreakdown,
    recentOrders,
    lowStockProducts,
    topSellingProducts,
  };
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: async ({ signal }) => {
      const { data: body } = await httpClient.get("/admin/dashboard", { signal });
      return normalizeDashboard(body);
    },
  });
}

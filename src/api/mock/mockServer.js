import { createCrudHandlers, MockApiError } from "./crudHandlers";
import {
  getCategories,
  getCustomers,
  getInventoryMovements,
  getInvoices,
  getNotifications,
  getOffers,
  getOrders,
  getProducts,
  getUsers,
  tableSetters,
} from "./store";
import { MOCK_USERS } from "./authData";

const productHandlers = createCrudHandlers(getProducts, tableSetters.products, ["name", "sku", "categoryName", "material"]);
const categoryHandlers = createCrudHandlers(getCategories, tableSetters.categories, ["name", "slug"]);
const customerHandlers = createCrudHandlers(getCustomers, tableSetters.customers, ["name", "email", "phone"]);
const orderHandlers = createCrudHandlers(getOrders, tableSetters.orders, ["orderNumber", "customerName", "customerEmail"]);
const inventoryHandlers = createCrudHandlers(getInventoryMovements, tableSetters.inventory_movements, ["productName", "sku"]);
const offerHandlers = createCrudHandlers(getOffers, tableSetters.offers, ["code", "title"]);
const userHandlers = createCrudHandlers(getUsers, tableSetters.users, ["name", "email"]);

function buildDashboardSummary() {
  const orders = getOrders();
  const products = getProducts();

  const salesTrendMonths = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];
  const salesTrend = salesTrendMonths.map((month, i) => {
    const base = 320000 + Math.sin(i / 1.6) * 140000 + (i % 3 === 0 ? 60000 : 0);
    return { month, revenue: Math.max(40000, Math.round(base)) };
  });

  const revenueByCategoryMap = new Map();
  orders.forEach((order) => {
    order.items.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      const category = product?.categoryName ?? "Other";
      revenueByCategoryMap.set(category, (revenueByCategoryMap.get(category) ?? 0) + item.unitPrice * item.quantity);
    });
  });
  const revenueByCategory = Array.from(revenueByCategoryMap.entries())
    .map(([category, revenue]) => ({ category, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  const statusOrder = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"];
  const orderStatusBreakdown = statusOrder.map((status) => ({
    status,
    count: orders.filter((o) => o.status === status).length,
  }));

  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const lowStockSkus = products.filter((p) => p.stock <= p.reorderLevel).length;

  return {
    todaysSales: 0,
    todaysSalesChangePct: 0,
    monthSales: 0,
    monthSalesChangePct: 0,
    pendingOrders,
    lowStockSkus,
    salesTrend,
    revenueByCategory,
    orderStatusBreakdown,
    recentOrders: orders.slice(0, 6),
  };
}

const SIMULATED_LATENCY_MS = 350;

function delay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), SIMULATED_LATENCY_MS));
}

export async function mockRequest(method, url, options = {}) {
  const segments = url.replace(/^\/+/, "").split("/").filter(Boolean);
  const [resource, id, action] = segments;
  const { params = {}, data } = options;

  try {
    const result = route(method, resource, id, action, params, data);
    return await delay(result);
  } catch (error) {
    await delay(null);
    throw error;
  }
}

function route(method, resource, id, action, params, data) {
  switch (resource) {
    case "auth":
      return routeAuth(method, id, data);
    case "dashboard":
      return buildDashboardSummary();
    case "products":
      return routeCrud(productHandlers, method, id, params, data, "prod");
    case "categories":
      return routeCrud(categoryHandlers, method, id, params, data, "cat");
    case "customers":
      return routeCrud(customerHandlers, method, id, params, data, "cust");
    case "orders":
      return routeCrud(orderHandlers, method, id, params, data, "ord");
    case "invoices": {
      const invoiceHandlers = createCrudHandlers(getInvoices, tableSetters.invoices, ["invoiceNumber", "customerName"]);
      return routeCrud(invoiceHandlers, method, id, params, data, "inv");
    }
    case "inventory-movements":
      return routeCrud(inventoryHandlers, method, id, params, data, "mov");
    case "offers":
      return routeCrud(offerHandlers, method, id, params, data, "off");
    case "notifications":
      if (method === "post" && id === "mark-all-read") {
        const rows = getNotifications().map((n) => ({ ...n, read: true }));
        tableSetters.notifications(rows);
        return rows;
      }
      return routeCrud(
        createCrudHandlers(getNotifications, tableSetters.notifications, ["title", "message"]),
        method,
        id,
        params,
        data,
        "notif",
      );
    case "users":
      return routeCrud(userHandlers, method, id, params, data, "usr");
    default:
      throw new MockApiError(404, `Unknown mock resource "${resource}"`);
  }
}

function routeCrud(handlers, method, id, params, data, idPrefix) {
  if (!id) {
    if (method === "get") return handlers.list(params);
    if (method === "post") return handlers.create(data, idPrefix);
    throw new MockApiError(405, `Method ${method} not allowed on collection`);
  }
  if (method === "get") return handlers.get(id);
  if (method === "put" || method === "patch") return handlers.update(id, data);
  if (method === "delete") {
    handlers.remove(id);
    return { success: true };
  }
  throw new MockApiError(405, `Method ${method} not allowed`);
}

function routeAuth(method, action, data) {
  if (method === "post" && action === "login") {
    const { email, password } = data ?? {};
    const match = MOCK_USERS.find(
      (u) => u.credential.email.toLowerCase() === String(email).toLowerCase() && u.credential.password === password,
    );
    if (!match) throw new MockApiError(401, "Invalid email or password");
    return { user: match.user, token: `mock-token.${match.user.id}.${Date.now()}` };
  }
  if (method === "get" && action === "me") {
    return null;
  }
  throw new MockApiError(404, "Unknown auth action");
}

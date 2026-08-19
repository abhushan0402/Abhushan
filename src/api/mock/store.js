import { getTable, saveTable } from "./db";
import {
  seedCategories,
  seedCustomers,
  seedInventoryMovements,
  seedInvoices,
  seedNotifications,
  seedOffers,
  seedOrders,
  seedProducts,
  seedUsers,
} from "./seed";

export function getCategories() {
  const categories = getTable("categories", seedCategories);
  const products = getTable("products", () => seedProducts(categories));
  const counts = new Map();
  products.forEach((p) => counts.set(p.categoryId, (counts.get(p.categoryId) ?? 0) + 1));
  return categories.map((c) => ({ ...c, productCount: counts.get(c.id) ?? 0 }));
}

export function getProducts() {
  const categories = getTable("categories", seedCategories);
  return getTable("products", () => seedProducts(categories));
}

export function getCustomers() {
  return getTable("customers", seedCustomers);
}

export function getOrders() {
  const products = getProducts();
  const customers = getCustomers();
  return getTable("orders", () => seedOrders(products, customers));
}

export function getInvoices() {
  const orders = getOrders();
  return getTable("invoices", () => seedInvoices(orders));
}

export function getInventoryMovements() {
  const products = getProducts();
  return getTable("inventory_movements", () => seedInventoryMovements(products));
}

export function getOffers() {
  return getTable("offers", seedOffers);
}

export function getNotifications() {
  return getTable("notifications", seedNotifications);
}

export function getUsers() {
  return getTable("users", seedUsers);
}

export const tableSetters = {
  categories: (rows) => saveTable("categories", rows),
  products: (rows) => saveTable("products", rows),
  customers: (rows) => saveTable("customers", rows),
  orders: (rows) => saveTable("orders", rows),
  invoices: (rows) => saveTable("invoices", rows),
  inventory_movements: (rows) => saveTable("inventory_movements", rows),
  offers: (rows) => saveTable("offers", rows),
  notifications: (rows) => saveTable("notifications", rows),
  users: (rows) => saveTable("users", rows),
};

import { BrowserRouter, Routes, Route } from "react-router";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { StatusPage } from "./components/common/StatusPage";
import LoginPage from "./auth/LoginPage";
import DashboardPage from "./features/dashboard/DashboardPage";
import ProductsPage from "./features/products/ProductsPage";
import ProductFormPage from "./features/products/ProductFormPage";
import CategoriesPage from "./features/categories/CategoriesPage";
import SubCategoriesPage from "./features/subcategories/SubCategoriesPage";
import InventoryPage from "./features/inventory/InventoryPage";
import OrdersPage from "./features/orders/OrdersPage";
import OrderDetailPage from "./features/orders/OrderDetailPage";
import CustomersPage from "./features/customers/CustomersPage";
import BillingPage from "./features/billing/BillingPage";
import OffersPage from "./features/offers/OffersPage";
import NotificationsPage from "./features/notifications/NotificationsPage";
import UsersPage from "./features/users/UsersPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />

            <Route path="products" element={<ProductsPage />} />
            <Route path="products/new" element={<ProductFormPage />} />
            <Route path="products/:id/edit" element={<ProductFormPage />} />

            <Route path="categories" element={<CategoriesPage />} />
            <Route path="subcategories" element={<SubCategoriesPage />} />
            <Route path="inventory" element={<InventoryPage />} />

            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />

            <Route path="customers" element={<CustomersPage />} />
            <Route path="billing" element={<BillingPage />} />
            <Route path="offers" element={<OffersPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="users" element={<UsersPage />} />
          </Route>
        </Route>

        <Route
          path="/403"
          element={<StatusPage code={403} title="Access denied" description="You don't have permission to view this page." />}
        />
        <Route
          path="*"
          element={<StatusPage code={404} title="Page not found" description="The page you're looking for doesn't exist." />}
        />
      </Routes>
    </BrowserRouter>
  );
}

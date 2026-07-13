import { Navigate, Route, Routes } from "react-router-dom";

import AdminLayout from "./layouts/AdminLayout";
import UserLayout from "./layouts/UserLayout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import ProductDetail from "./pages/ProductDetail";
import BlogDetail from "./pages/BlogDetail";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import Dashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";
import AdminCategories from "./pages/AdminCategories";
import AdminBlogs from "./pages/AdminBlogs";
import AdminTestimonials from "./pages/AdminTestimonials";
import AdminBestSellers from "./pages/AdminBestSellers";
import AdminUsers from "./pages/AdminUsers";
import AdminOrders from "./pages/AdminOrders";
import ProtectedRoute from "./components/ProtecttedRoute";

function App() {
  return (
    <Routes>

      <Route path="/" element={<UserLayout />}>
        <Route index element={<Home />} />
        <Route path="product/:id" element={<ProductDetail />} />
        <Route path="blog/:id" element={<BlogDetail />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      > <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="blogs" element={<AdminBlogs />} />
        <Route path="testimonials" element={<AdminTestimonials />} />
        <Route path="best-sellers" element={<AdminBestSellers />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="orders" element={<AdminOrders />} />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/admin-login" element={<AdminLogin />} />

      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}

export default App;

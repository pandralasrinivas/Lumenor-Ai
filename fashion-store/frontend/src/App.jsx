import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import api from "./utils/api";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import StartupLoader from "./components/StartupLoader";
import HomePage from "./pages/HomePage";
import ShopPage from "./pages/ShopPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import ProfilePage from "./pages/ProfilePage";
import AdminGuard from "./admin/components/AdminGuard";
import AdminShell from "./admin/components/AdminShell";
import AdminLoginPage from "./admin/pages/AdminLoginPage";
import AdminDashboardPage from "./admin/pages/AdminDashboardPage";
import AdminProductsPage from "./admin/pages/AdminProductsPage";
import AdminOrdersPage from "./admin/pages/AdminOrdersPage";
import AdminOrderDetailsPage from "./admin/pages/AdminOrderDetailsPage";
import "./styles/index.css";

const authPaths = new Set(["/login", "/register"]);
const STARTUP_MINIMUM_MS = 900;
const HEALTH_CHECK_TIMEOUT_MS = 15000;
const HEALTH_CHECK_RETRY_MS = 2000;

const AppShell = () => {
  const location = useLocation();
  const isAuthPage = authPaths.has(location.pathname);
  const isAdminPage = location.pathname.startsWith("/store/admin");
  const hideStorefrontChrome = isAuthPage || isAdminPage;

  return (
    <div
      className={`flex min-h-screen flex-col text-[#171312] ${
        hideStorefrontChrome
          ? ""
          : "bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.95),transparent_22%),radial-gradient(circle_at_85%_8%,rgba(244,216,199,0.55),transparent_20%),linear-gradient(180deg,#fffdf8_0%,#fffaf4_55%,#fff6ef_100%)]"
      }`}
    >
      {!hideStorefrontChrome && <Navbar />}

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/order/:id" element={<OrderDetailsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/store/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/store/admin"
            element={
              <AdminGuard>
                <AdminShell />
              </AdminGuard>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="orders/:id" element={<AdminOrderDetailsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!hideStorefrontChrome && <Footer />}
    </div>
  );
};

function App() {
  const [startupStage, setStartupStage] = useState("checking");

  useEffect(() => {
    let cancelled = false;
    let retryTimer = null;
    let readyTimer = null;
    const startedAt = Date.now();

    const finishStartup = () => {
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, STARTUP_MINIMUM_MS - elapsed);

      readyTimer = window.setTimeout(() => {
        if (!cancelled) {
          setStartupStage("ready");
        }
      }, remaining);
    };

    const checkBackend = async () => {
      try {
        await api.get("/health", { timeout: HEALTH_CHECK_TIMEOUT_MS });

        if (!cancelled) {
          finishStartup();
        }
      } catch {
        if (cancelled) {
          return;
        }

        setStartupStage("retrying");
        retryTimer = window.setTimeout(checkBackend, HEALTH_CHECK_RETRY_MS);
      }
    };

    checkBackend();

    return () => {
      cancelled = true;

      if (retryTimer !== null) {
        window.clearTimeout(retryTimer);
      }

      if (readyTimer !== null) {
        window.clearTimeout(readyTimer);
      }
    };
  }, []);

  if (startupStage !== "ready") {
    return (
      <StartupLoader
        message={
          startupStage === "retrying"
            ? "The Render server is still waking up. We’re trying again..."
            : "Checking the server before opening the store..."
        }
      />
    );
  }

  return (
    <Router>
      <AppShell />
      <Toaster position="bottom-right" />
    </Router>
  );
}

export default App;

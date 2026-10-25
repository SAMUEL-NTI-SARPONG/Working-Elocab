import { lazy, Suspense, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Link,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppErrorBoundary from "./AppErrorBoundary";
const LandingPage = lazy(() => import("./pages/LandingPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage"));
const CustomerDashboard = lazy(
  () => import("./pages/dashboards/CustomerDashboard"),
);
const DriverDashboard = lazy(
  () => import("./pages/dashboards/DriverDashboard"),
);
const AdminDashboard = lazy(() => import("./pages/dashboards/AdminDashboard"));
function RouteEffects() {
  const { pathname, search, hash } = useLocation();
  useEffect(() => {
    const title = pathname.includes("dashboard")
      ? pathname.split("/")[1] + " workspace"
      : pathname === "/login"
        ? "Sign in"
        : pathname === "/register"
          ? "Create your account"
          : pathname === "/admin/login"
            ? "Admin sign in"
            : "Your journey, our priority";
    document.title = `ELOCAB · ${title.charAt(0).toUpperCase() + title.slice(1)}`;
    if (!hash) window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname, search, hash]);
  return null;
}
function NotFound() {
  return (
    <main className="not-found">
      <span className="eyebrow">A LITTLE OFF ROUTE</span>
      <h1>This road ends here.</h1>
      <p>We couldn't find that page. Let's get you back on your way.</p>
      <Link className="button button-primary" to="/">
        Back to ELOCAB
      </Link>
    </main>
  );
}
export default function App() {
  return (
    <AppErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <SocketProvider>
            <RouteEffects />
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 4000,
                style: {
                  fontSize: "13px",
                  background: "#0f172a",
                  color: "#fff",
                  borderRadius: "12px",
                  padding: "14px 18px",
                },
                success: {
                  iconTheme: { primary: "#f97316", secondary: "#0f172a" },
                },
              }}
            />
            <Suspense
              fallback={
                <div className="page-loading" role="status">
                  <span className="spinner" />
                  Opening ELOCAB…
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route
                  path="/customer/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["customer"]}>
                      <CustomerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/driver/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["driver"]}>
                      <DriverDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </SocketProvider>
        </AuthProvider>
      </BrowserRouter>
    </AppErrorBoundary>
  );
}

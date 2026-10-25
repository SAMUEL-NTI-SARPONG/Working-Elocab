import { Navigate, useLocation } from "react-router-dom";
import { useAuth, homeFor } from "../context/AuthContext";
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading)
    return (
      <div className="page-loading" role="status">
        Getting your account ready…
      </div>
    );
  if (!user)
    return (
      <Navigate
        to={allowedRoles?.includes("admin") ? "/admin/login" : "/login"}
        state={{ from: location.pathname }}
        replace
      />
    );
  if (!allowedRoles?.includes(user.role))
    return <Navigate to={homeFor(user.role)} replace />;
  return children;
}

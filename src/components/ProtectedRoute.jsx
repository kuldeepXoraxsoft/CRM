import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import Spinner from "./ui/Spinner";
import Unauthorized from "../pages/Errors/UnAuthorized";

/**
 * ProtectedRoute
 *
 * <ProtectedRoute>                         -> only needs a logged-in user
 * <ProtectedRoute allowedRoles={["admin"]}> -> also needs one of these roles
 *
 * Works both as a wrapper (children) and as a layout route (<Outlet />).
 */
export default function ProtectedRoute({ allowedRoles, children }) {
  const { currentUser, isLoading } = useAuth();
  const location = useLocation();

  // Session is being restored from the token
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-canvas">
        <Spinner size="lg" className="text-primary-500" />
      </div>
    );
  }

  // Not logged in -> login page
  if (!currentUser) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // Logged in, but role not allowed -> 403 page (URL stays the same)
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Unauthorized />;
  }

  return children ?? <Outlet />;
}
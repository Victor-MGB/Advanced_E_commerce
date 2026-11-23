import { Navigate, useLocation } from "react-router-dom";
import { useStore } from "../lib/store.jsx";

export default function ProtectedRoute({ children, admin = false }) {
  const { isAuthenticated, isAdmin } = useStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location.pathname }} replace />;
  }
  if (admin && !isAdmin) {
    return <Navigate to="/" replace />;
  }
  return children;
}

import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../contexts/AdminAuthContext";
import Loader from "./Loader";

export default function ProtectedRoute({ children }) {
  const { user, adminProfile, loading } = useAdminAuth();
  if (loading) return <Loader full />;
  if (!user || !adminProfile) return <Navigate to="/admin/login" replace />;
  return children;
}

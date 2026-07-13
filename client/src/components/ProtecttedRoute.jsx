import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/auth-context";

export default function ProtectedRoute({ children }) {
  const { isAdminLoading, isAdminLoggedIn } = useContext(AuthContext);
  const location = useLocation();

  if (isAdminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-700 bg-zinc-50">
        Checking session...
      </div>
    );
  }

  if (!isAdminLoggedIn) {
    return <Navigate to="/admin-login" replace state={{ from: location }} />;
  }

  return children;
}

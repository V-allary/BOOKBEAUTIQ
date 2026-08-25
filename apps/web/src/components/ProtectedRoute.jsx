import { Navigate, Outlet, useLocation } from "react-router-dom";

function ProtectedRoute() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const location = useLocation();

  if (!token || !user) {
    return <Navigate to="/signin" replace />;
  }

  if (
    user.role === "business" &&
    user.verificationStatus !== "verified" &&
    location.pathname !== "/verify-account"
  ) {
    return <Navigate to="/verify-account" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;

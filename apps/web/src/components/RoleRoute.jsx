import { Navigate, Outlet } from "react-router-dom";

function RoleRoute({ allowedRoles }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!token || !user) {
    return <Navigate to="/signin" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (user.role === "business" && user.verificationStatus !== "verified") {
    return <Navigate to="/verify-account" replace />;
  }

  return <Outlet />;
}

export default RoleRoute;

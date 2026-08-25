import { Navigate, Outlet } from "react-router-dom";

function VerifiedOwnerRoute() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!token || !user) {
    return <Navigate to="/signin" replace />;
  }

  // Admins bypass this gate entirely
  if (user.role === "admin") {
    return <Outlet />;
  }

  if (user.role !== "business") {
    return <Navigate to="/dashboard" replace />;
  }

  if (user.verificationStatus !== "verified") {
    return <Navigate to="/verify-account" replace />;
  }

  return <Outlet />;
}

export default VerifiedOwnerRoute;

import { Navigate, Outlet } from "react-router-dom";

// Convenience redirect only. The real enforcement is server-side in
// requireEmailVerified, so editing localStorage can't get anyone through.
function EmailVerifiedRoute() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!user) return <Navigate to="/signin" replace />;

  if (user.role === "business" && !user.isEmailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return <Outlet />;
}

export default EmailVerifiedRoute;
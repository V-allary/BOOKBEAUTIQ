import { Navigate } from "react-router-dom";
import ClientDashboard from "./ClientDashboard";
import BusinessDashboard from "./BusinessDashboard";

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!user) return <Navigate to="/signin" replace />;
  if (user.role === "business") return <BusinessDashboard />;
  if (user.role === "admin") return <Navigate to="/admin" replace />;

  return <ClientDashboard />;
}

export default Dashboard;

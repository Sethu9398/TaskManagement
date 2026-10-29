
import { Navigate, Outlet, useOutletContext } from "react-router-dom";

const AdminProtectedRoute = () => {
  const { user } = useOutletContext();

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet context={{ user }} />;
};

export default AdminProtectedRoute;

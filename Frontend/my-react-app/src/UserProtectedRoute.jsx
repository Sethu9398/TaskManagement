
import { Navigate, Outlet, useOutletContext } from "react-router-dom";

const UserProtectedRoute = () => {
  const { user } = useOutletContext();

  if (user.role !== "user") {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet context={{ user }} />;
};

export default UserProtectedRoute;

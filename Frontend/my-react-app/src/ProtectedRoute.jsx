
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import api from "./api";
import {
  saveStoredUser,
  clearStoredUser,
} from "./lib/authStorage";

const ProtectedRoute = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const checkAuth = async () => {
      try {
        const response = await api.get("/user/me");

        if (active) {
          setUser(response.data);
          saveStoredUser(response.data);
        }
      } catch {
        if (active) {
          setUser(null);
          clearStoredUser();
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    checkAuth();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <p>Checking authentication...</p>;
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return <Outlet context={{ user }} />;
};

export default ProtectedRoute;

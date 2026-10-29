import { useState } from "react";
import { data, useNavigate } from "react-router-dom";
import api from "../api";
import { saveStoredUser } from "../lib/authStorage";

const Signin = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSignin = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    const user = {
      email: formData.get("email"),
      password: formData.get("password"),
      role:formData.get("role")
    };

    try {
      setLoading(true);
      setMessage("");

      const response = await api.post("/user/login", user);

      console.log("Signin response:", response.data);

      setMessage("Sign in successful!");

      // The login response carries only email and role, so read the full
      // profile (name, email, role) from the session endpoint before saving it.
      try {
        const profile = await api.get("/user/me");
        saveStoredUser(profile.data);
      } catch {
        saveStoredUser({
          email: response.data.email,
          role: response.data.role,
        });
      }

      // The session cookie is set by the server on this origin, so the
      // protected route can revalidate it after navigation or a refresh.
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Signin error:", error);

      if (error.response) {
        // Server returned an error response
        console.error("Backend response:", error.response.data);
        setMessage(
          error.response.data?.detail ||
            error.response.data?.message ||
            `Login failed with status ${error.response.status}`,
        );
      } else if (error.request) {
        // Request was sent but no response was received
        setMessage(
          "Cannot connect to the backend. Check that FastAPI is running at http://127.0.0.1:8000.",
        );
      } else {
        // Request setup error
        setMessage(error.message || "An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex justify-content-center align-items-center bg-light">
      <div
        className="card shadow-lg border-0 rounded-4 p-4"
        style={{ maxWidth: "420px", width: "100%" }}
      >
        <div className="card-body">
          <h2 className="text-center fw-bold mb-2">Welcome Back!</h2>
          <p className="text-center text-muted mb-4">Sign in to your account</p>

          <form onSubmit={handleSignin}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label fw-semibold">
                Email Address
              </label>
              <input
                type="email"
                className="form-control form-control-lg"
                id="email"
                name="email"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label fw-semibold">
                Password
              </label>
              <input
                type="password"
                className="form-control form-control-lg"
                id="password"
                name="password"
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="remember"
                />
                <label className="form-check-label" htmlFor="remember">
                  Remember me
                </label>
              </div>

              <a href="#" className="text-decoration-none">
                Forgot password?
              </a>
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-100">
              Sign In
            </button>
          </form>

          <div className="text-center mt-4">
            <span className="text-muted">Don't have an account? </span>
            <a href="register" className="text-decoration-none fw-semibold">
              Sign Up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;

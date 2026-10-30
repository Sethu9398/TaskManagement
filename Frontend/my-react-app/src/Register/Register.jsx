import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { saveStoredUser } from "../lib/authStorage";

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    const user = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    };

    try {
      setLoading(true);
      setMessage("");

      const response = await api.post("/user/register", user);

      console.log("Registration response:", response.data);

      // Public registration always creates a normal user; keep the same
      // shape the sign-in flow stores so consumers see one consistent object,
      // including the id assigned by the database.
      saveStoredUser({
        id: response.data.id,
        name: response.data.name ?? user.name,
        email: response.data.email ?? user.email,
        role: response.data.role ?? "user",
      });


      setMessage(response.data.message || "Registration successful!");

      e.target.reset();
      navigate("/signin");
    } catch (error) {
      console.error("Registration error:", error.response?.data);

      setMessage(
        error.response?.data?.detail ||
          "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="container-fluid min-vh-100 d-flex justify-content-center align-items-center bg-light py-4">
      <div
        className="card shadow-lg border-0 rounded-4 p-4"
        style={{ maxWidth: "450px", width: "100%" }}
      >
        <div className="card-body">
          <h2 className="text-center fw-bold mb-2">Create Account</h2>

          <p className="text-center text-muted mb-4">Register to get started</p>

          <form onSubmit={handleRegister}>
            {/* Name */}
            <div className="mb-3">
              <label htmlFor="name" className="form-label fw-semibold">
                Full Name
              </label>
              <input
                type="text"
                className="form-control form-control-lg"
                id="name"
                name="name"
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Email */}
            <div className="mb-3">
              <label htmlFor="email" className="form-label fw-semibold">
                Email ID
              </label>
              <input
                type="email"
                className="form-control form-control-lg"
                id="email"
                name="email"
                placeholder="Enter your email address"
                required
              />
            </div>

            {/* Password */}
            <div className="mb-4">
              <label htmlFor="password" className="form-label fw-semibold">
                Password
              </label>
              <input
                type="password"
                className="form-control form-control-lg"
                id="password"
                name="password"
                placeholder="Create a password"
                required
              />
              <div className="form-text">
                Password must contain at least 8 characters.
              </div>
            </div>

            {/* Register Button */}
            <button type="submit" className="btn btn-primary btn-lg w-100">
              Register
            </button>
          </form>

          <div className="text-center mt-4">
            <span className="text-muted">Already have an account? </span>
            <a href="/signin" className="text-decoration-none fw-semibold">
              Sign In
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

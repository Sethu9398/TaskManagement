import { NavLink, useNavigate } from "react-router-dom";
import avatar from "../../assets/avatar.jpg";
import logo from "../../assets/logo.png";
import { useState } from "react";
import api from "../../api";
import CreateTaskModal from "../User/CreateTaskModal";

const CommonNavbar = ({ role }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const navLinkClass = ({ isActive }) =>
    `nav-link fw-semibold ${
      isActive
        ? "active text-primary "
        : "text-dark text-decoration-none fw-bold"
    }`;

  const handleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogout = async () => {
    try {
      // Call backend logout API
      await api.post("user/logout");

      // Remove logged-in user details
      localStorage.removeItem("user");

      // Close dropdown
      setShowDropdown(false);

      // Navigate to login page
      navigate("/signin");
    } catch (error) {
      console.error("Logout error:", error);

      alert("Unable to logout. Please try again.");
    }
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-light shadow-sm px-4 py-2 fixed-top">
        {/* Left Side - Logo */}
        <a className="navbar-brand d-flex align-items-center" href="/">
          <img src={logo} alt="Logo" height="40" />
        </a>

        {/* Navigation Links */}
        <div className="d-flex align-items-center gap-5 ms-4">
          {/* User Navigation */}
          {role === "user" && (
            <>
              <NavLink to="/" className={navLinkClass}>
                Dashboard
              </NavLink>

              <NavLink to="/user/my-task" className={navLinkClass}>
                My Tasks
              </NavLink>

              {/* Create Task Button */}
              <button
                type="button"
                className="btn btn-primary btn-sm px-3"
                onClick={() => setShowCreateModal(true)}
              >
                <i className="fa fa-plus me-2" aria-hidden="true"></i>
                Create Task
              </button>
            </>
          )}

          {/* Admin Navigation */}
          {role === "admin" && (
            <>
              <NavLink to="/admin" end className={navLinkClass}>
                Dashboard
              </NavLink>

              <NavLink to="task" className={navLinkClass}>
                All Tasks
              </NavLink>

              <NavLink to="user-list" className={navLinkClass}>
                User List
              </NavLink>
            </>
          )}
        </div>

        {/* Right Side - Profile Dropdown */}
        <div className="ms-auto position-relative">
          <img
            src={avatar}
            alt="Profile"
            className="rounded-circle border"
            width="50"
            height="50"
            style={{ cursor: "pointer", objectFit: "cover" }}
          />
          {/* Dropdown Icon Button */}
          <button
            type="button"
            className="btn border-2 bg-transparent p-1 ms-2 border rounded-square shadow-sm "
            onClick={handleDropdown}
            aria-expanded={showDropdown}
          >
            <i
              className={`fa ${
                showDropdown ? "fa-chevron-up" : "fa-chevron-down"
              }`}
            ></i>
          </button>

          {/* Dropdown Content */}
          {showDropdown && (
            <div
              className="dropdown-menu dropdown-menu-end show shadow border-0 p-3 mt-2"
              style={{
                width: "220px",
                position: "absolute",
                right: 0,
                top: "100%",
              }}
            >
              {/* User Details */}
              <div className="text-center mb-3">
                <img
                  src={avatar}
                  alt="Profile"
                  className="rounded-circle border mb-2"
                  width="65"
                  height="65"
                />

                <h6 className="fw-bold mb-1">{user?.name || "User"}</h6>

                <small className="text-muted">
                  {user?.email || "No email"}
                </small>
              </div>

              <hr />

              {/* User Role */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted">Role</span>

                <span className="badge bg-primary text-capitalize">
                  {user?.role || role}
                </span>
              </div>

              <hr />

              {/* Logout Button */}
              <button
                type="button"
                className="btn btn-danger btn-sm w-100"
                onClick={handleLogout}
              >
                <i className="fa fa-sign-out me-2"></i>
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>
      {showCreateModal && (
        <CreateTaskModal onClose={() => setShowCreateModal(false)} />
      )}
    </>
  );
};

export default CommonNavbar;

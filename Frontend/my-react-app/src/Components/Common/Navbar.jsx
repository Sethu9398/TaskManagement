import { NavLink } from "react-router-dom";
import avatar from "../../assets/avatar.jpg";
import logo from "../../assets/logo.png";

const CommonNavbar = ({ role }) => {
  const navLinkClass = ({ isActive }) =>
    `nav-link fw-semibold ${
      isActive
        ? "active text-primary "
        : "text-dark text-decoration-none fw-bold"
    }`;

  return (
    <nav className="navbar navbar-expand-lg bg-light shadow-sm px-4 py-2">
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
            <NavLink
              to="/user/create-task"
              className="btn btn-primary btn-sm px-3"
            >
              <i className="fa fa-plus me-2" aria-hidden="true"></i>
              Create Task
            </NavLink>
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

      {/* Right Side - Name and Avatar */}
      <div className="ms-auto d-flex align-items-center gap-3">
        <span className="fw-semibold text-dark">Sethu Raman</span>

        <img
          src={avatar}
          alt="Profile"
          className="rounded-circle border"
          width="42"
          height="42"
        />
      </div>
    </nav>
  );
};

export default CommonNavbar;

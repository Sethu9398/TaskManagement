
import { useEffect, useState } from "react";
import api from "../../api";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  // Fetch users and all tasks
  useEffect(() => {
    const fetchUsersAndTasks = async () => {
      try {
        setLoading(true);
        setError("");

        const [usersResponse, tasksResponse] = await Promise.all([
          api.get("user/allUsers"),
          api.get("task/admin/allTasks"),
        ]);

        setUsers(usersResponse.data);
        setTasks(tasksResponse.data);

      } catch (err) {
        console.error("User List API Error:", err);

        setError(
          err.response?.data?.detail ||
          "Unable to fetch users and tasks"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsersAndTasks();
  }, []);

  // Get task count for each user
  const getUserTaskCount = (userId) => {
    return tasks.filter(
      (task) => String(task.user_id) === String(userId)
    ).length;
  };

  // Search users by name, email or ID
  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase();

    return (
      user.name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      String(user.id).includes(search)
    );
  });

  // Loading screen
  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary"></div>
        <p className="mt-2">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">

      {/* Page Heading */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">

        <div>
          <h3 className="fw-bold mb-2">
            User Management
          </h3>

          <p className="text-muted mb-0">
            View registered users and their task activity.
          </p>
        </div>

        <div className="mt-3 mt-md-0">
          <span className="badge bg-primary fs-6 px-3 py-2">
            Total Users: {users.length}
          </span>
        </div>

      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* User List Card */}
      <div className="card border-0 shadow-sm">

        {/* Card Header */}
        <div className="card-header bg-white p-3">

          <div className="row g-3 align-items-center">

            {/* Search */}
            <div className="col-md-8">
              <div className="input-group">

                <span className="input-group-text bg-light">
                  <i className="fa-solid fa-search"></i>
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name, email or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

              </div>
            </div>

            {/* Total Tasks */}
            <div className="col-md-4 text-md-end">
              <span className="text-muted">
                Overall Tasks:
              </span>

              <span className="fw-bold text-primary ms-2">
                {tasks.length}
              </span>
            </div>

          </div>

        </div>

        {/* User Table */}
        <div className="card-body p-0">

          {filteredUsers.length === 0 ? (
            <div className="text-center text-muted py-5">

              <i className="fa-solid fa-users fs-1 mb-3"></i>

              <h6 className="fw-semibold">
                No users found
              </h6>

              <p className="mb-0">
                Try another search term.
              </p>

            </div>
          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead className="table-light">
                  <tr>
                    <th className="ps-4">User ID</th>
                    <th>Name</th>
                    <th>Email Address</th>
                    <th className="text-center">Total Tasks</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredUsers.map((user) => {
                    const taskCount = getUserTaskCount(user.id);

                    return (
                      <tr key={user.id}>

                        {/* User ID */}
                        <td className="ps-4 fw-semibold">
                          #{user.id}
                        </td>

                        {/* User Name */}
                        <td>
                          <div className="d-flex align-items-center gap-2">

                            <div
                              className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold"
                              style={{
                                width: "38px",
                                height: "38px",
                                flexShrink: 0,
                              }}
                            >
                              {user.name?.charAt(0)?.toUpperCase() || "U"}
                            </div>

                            <span className="fw-semibold">
                              {user.name || "Unknown"}
                            </span>

                          </div>
                        </td>

                        {/* Email */}
                        <td>
                          {user.email}
                        </td>

                        {/* User Task Count */}
                        <td className="text-center">

                          <span
                            className={`badge fs-6 px-3 py-2 ${
                              taskCount > 0
                                ? "bg-primary"
                                : "bg-secondary"
                            }`}
                          >
                            <i className="fa-solid fa-list-check me-2"></i>
                            {taskCount}
                          </span>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>
          )}

        </div>

        {/* Table Footer */}
        <div className="card-footer bg-white py-3">

          <small className="text-muted">
            Showing {filteredUsers.length} of {users.length} users
          </small>

        </div>

      </div>

    </div>
  );
};

export default UserList;

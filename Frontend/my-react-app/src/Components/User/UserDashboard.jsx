import { useEffect, useState } from "react";
import api from "../../api"; // Change path according to your project

const UserDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  // Fetch logged-in user's tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await api.get("task/myTask");
        setTasks(response.data);
      } catch (err) {
        console.error(err);
        setError("Unable to fetch tasks");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Calculate task counts
  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.status?.toLowerCase() === "completed",
  ).length;

  const inProcessTasks = tasks.filter(
    (task) => task.status?.toLowerCase() === "in-process",
  ).length;

  const completionPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "success";

      case "in-process":
        return "warning";

      case "pending":
        return "secondary";

      default:
        return "primary";
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary"></div>
        <p className="mt-2">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      {/* Dashboard Heading */}
      <h3 className=" fw-semibold mb-4">Welcome to {user.name || "user"}.👋</h3>
      <p className="text-muted mb-4">
        Your central workspace for managing tasks, tracking progress, and
        collaborating seamlessly
      </p>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        {/* Total Tasks */}
        <div className="col-md-4">
          <div className="card shadow-sm border-0 ">
            <div className="card-body p-4">
              <h6 className="text-muted">Total Tasks</h6>

              <h2 className="fw-bold text-primary">{totalTasks}</h2>
            </div>
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="col-md-4 ">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4 ">
              <h6 className="text-muted">Completed Tasks</h6>

              <h2 className="fw-bold text-success">{completedTasks}</h2>
            </div>
          </div>
        </div>

        {/* In-Process Tasks */}
        <div className="col-md-4">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <h6 className="text-muted">In-Process Tasks</h6>

              <h2 className="fw-bold text-warning">{inProcessTasks}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Task Completion Progress */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-4">
          <h5 className="fw-bold mb-3">Task Completion</h5>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="text-muted">Overall progress</span>

            <span className="fw-bold fs-5">{completionPercentage}%</span>
          </div>

          {/* Bootstrap Progress Bar */}
          <div
            className="progress"
            role="progressbar"
            aria-label="Task completion progress"
            aria-valuenow={completionPercentage}
            aria-valuemin="0"
            aria-valuemax="100"
            style={{ height: "12px" }}
          >
            <div
              className="progress-bar bg-success"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>

          <div className="d-flex justify-content-between mt-2">
            <small className="text-muted">
              {completedTasks} of {totalTasks} tasks completed
            </small>

            <small className="text-muted">
              {totalTasks - completedTasks} remaining
            </small>
          </div>
        </div>
      </div>

      {/* Latest Created Task */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 className="fw-bold mb-0">My Recent Task</h5>

          <span className="badge bg-primary">Latest Task</span>
        </div>

        <div className="card-body p-4">
          {tasks.length === 0 ? (
            <div className="text-center text-muted py-4">
              <h6>No tasks found.</h6>
              <p className="mb-0">Create your first task to get started!</p>
            </div>
          ) : (
            (() => {
              const task = tasks[0];

              return (
                <div className="row align-items-center">
                  {/* Task Details */}
                  <div className="col-md-8">
                    <h5 className="fw-bold mb-2">{task.title}</h5>

                    <p className="text-muted mb-3">
                      {task.description || "No description available"}
                    </p>

                    <div className="d-flex flex-wrap gap-3">
                      <small className="text-muted">
                        <strong>Created:</strong>{" "}
                        {task.created_at
                          ? new Date(task.created_at).toLocaleDateString()
                          : "-"}
                      </small>

                      <small className="text-muted">
                        <strong>Updated:</strong>{" "}
                        {task.updated_at
                          ? new Date(task.updated_at).toLocaleDateString()
                          : "-"}
                      </small>
                    </div>
                  </div>

                  {/* Task Status */}
                  <div className="col-md-4 text-md-end mt-3 mt-md-0">
                    <span
                      className={`badge fs-6 px-3 py-2 bg-${getStatusColor(task.status)}`}
                    >
                      {task.status}
                    </span>
                  </div>
                </div>
              );
            })()
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;

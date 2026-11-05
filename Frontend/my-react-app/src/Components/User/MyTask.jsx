import { useEffect, useMemo, useState } from "react";
import api from "../../api";

const MyTask = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Edit states
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Fetch logged-in user's tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/task/myTask");

      setTasks(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    // Listen for task changes
    window.addEventListener("taskUpdated", fetchTasks);

    // Cleanup event listener
    return () => {
      window.removeEventListener("taskUpdated", fetchTasks);
    };
  }, []);

  // Search and filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        task.title.toLowerCase().includes(searchText) ||
        (task.description || "").toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "completed" && task.is_complete) ||
        (statusFilter === "pending" && !task.is_complete);

      return matchesSearch && matchesStatus;
    });
  }, [tasks, search, statusFilter]);

  // Start editing
  const handleEdit = (task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
  };

  // Update task
  const handleUpdate = async (taskId) => {
    if (!editTitle.trim()) {
      alert("Task title is required");
      return;
    }

    try {
      const response = await api.patch(`/task/${taskId}`, {
        title: editTitle.trim(),
        description: editDescription.trim(),
      });

      setTasks((previousTasks) =>
        previousTasks.map((task) =>
          task.id === taskId ? response.data : task,
        ),
      );

      handleCancelEdit();
    } catch (err) {
      alert(err.response?.data?.detail || "Unable to update task");
    }
  };

  // Delete task
  const handleDelete = async (taskId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?",
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/task/${taskId}`);

      setTasks((previousTasks) =>
        previousTasks.filter((task) => task.id !== taskId),
      );
    } catch (err) {
      alert(err.response?.data?.detail || "Unable to delete task");
    }
  };

  // Toggle task completion
  const handleToggleComplete = async (task) => {
    try {
      const response = await api.patch(`/task/${task.id}/complete`, {
        is_complete: !task.is_complete,
      });

      setTasks((previousTasks) =>
        previousTasks.map((item) =>
          item.id === task.id ? response.data : item,
        ),
      );
    } catch (err) {
      alert(err.response?.data?.detail || "Unable to update task status");
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Page Heading */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">My Tasks</h3>
          <p className="text-muted mb-0">Manage and track your tasks</p>
        </div>

        <span className="badge bg-primary fs-6">Total: {tasks.length}</span>
      </div>

      {/* Search and Filter */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-8">
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <i className="fa fa-search"></i>
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Search tasks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="col-md-4">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Tasks</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger">
          {error}
          <button
            className="btn btn-sm btn-outline-danger ms-3"
            onClick={fetchTasks}
          >
            Retry
          </button>
        </div>
      )}

      {/* Tasks Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Task Title</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <div className="spinner-border text-primary"></div>
                      <p className="mt-2 mb-0">Loading tasks...</p>
                    </td>
                  </tr>
                ) : filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      <i className="fa fa-folder-open fa-2x mb-2"></i>
                      <p className="mb-0">No tasks found</p>
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task, index) => (
                    <tr key={task.id}>
                      <td>{index + 1}</td>

                      {/* Title */}
                      <td>
                        {editingId === task.id ? (
                          <input
                            type="text"
                            className="form-control"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                          />
                        ) : (
                          <span className="fw-semibold">{task.title}</span>
                        )}
                      </td>

                      {/* Description */}
                      <td>
                        {editingId === task.id ? (
                          <textarea
                            className="form-control"
                            rows="2"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                          />
                        ) : (
                          task.description || "-"
                        )}
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={`badge ${
                            task.is_complete
                              ? "bg-success"
                              : "bg-warning text-dark"
                          }`}
                        >
                          {task.is_complete ? "Completed" : "Pending"}
                        </span>
                      </td>

                      {/* Created Date */}
                      <td>
                        {task.created_at
                          ? new Date(task.created_at).toLocaleDateString()
                          : "-"}
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          {editingId === task.id ? (
                            <>
                              <button
                                className="btn btn-success btn-sm"
                                title="Save"
                                onClick={() => handleUpdate(task.id)}
                              >
                                <i className="fa fa-check"></i>
                              </button>

                              <button
                                className="btn btn-secondary btn-sm"
                                title="Cancel"
                                onClick={handleCancelEdit}
                              >
                                <i className="fa fa-times"></i>
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="btn btn-outline-primary btn-sm"
                                title="Edit task"
                                onClick={() => handleEdit(task)}
                              >
                                <i className="fa fa-edit"></i>
                              </button>

                              <button
                                className={`btn btn-sm ${
                                  task.is_complete
                                    ? "btn-outline-warning"
                                    : "btn-outline-success"
                                }`}
                                title={
                                  task.is_complete
                                    ? "Mark pending"
                                    : "Mark completed"
                                }
                                onClick={() => handleToggleComplete(task)}
                              >
                                <i className="fa fa-check-circle"></i>
                              </button>

                              <button
                                className="btn btn-outline-danger btn-sm"
                                title="Delete task"
                                onClick={() => handleDelete(task.id)}
                              >
                                <i className="fa fa-trash"></i>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Filter Result Count */}
          {!loading && (
            <div className="text-muted small mt-3">
              Showing {filteredTasks.length} of {tasks.length} tasks
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyTask;


import { useEffect, useMemo, useState } from "react";
import api from "../../api";

const AdminTask = () => {

    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Existing filter states
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [userFilter, setUserFilter] = useState("all");
    const [sortOrder, setSortOrder] = useState("newest");

    // NEW: Single task details states
    const [selectedTask, setSelectedTask] = useState(null);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState("");

    // Fetch all tasks and users
    useEffect(() => {

        const fetchData = async () => {
            try {
                setLoading(true);
                setError("");

                const [taskResponse, userResponse] = await Promise.all([
                    api.get("task/admin/allTasks"),
                    api.get("user/allUsers")
                ]);

                setTasks(taskResponse.data);
                setUsers(userResponse.data);

            } catch (err) {
                console.error(err);

                setError(
                    err.response?.data?.detail ||
                    "Failed to fetch task details"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchData();

    }, []);

    // Find user name using task user_id
    const getUserName = (userId) => {
        const user = users.find(
            (u) => String(u.id) === String(userId)
        );

        return user?.name || user?.username || user?.email || "Unknown User";
    };

    // NEW: Get single task details using admin API
    const getSingleTask = async (taskId) => {

        try {
            setDetailLoading(true);
            setDetailError("");
            setSelectedTask(null);
            setShowTaskModal(true);

            const response = await api.get(
                `task/admin/allTasks/${taskId}`
            );

            setSelectedTask(response.data);

        } 
        catch (err) {
            console.error(err);

            setDetailError(
                err.response?.data?.detail ||
                "Unable to fetch task details"
            );

        } finally {
            setDetailLoading(false);
        }
    };

    // NEW: Close task details modal
    const closeTaskModal = () => {
        setShowTaskModal(false);
        setSelectedTask(null);
        setDetailError("");
    };

    // Filter and sort tasks - EXISTING FUNCTIONALITY
    const filteredTasks = useMemo(() => {

        let result = [...tasks];

        if (search.trim()) {
            const searchValue = search.toLowerCase();

            result = result.filter((task) =>
                (task.title || "").toLowerCase().includes(searchValue) ||
                (task.description || "").toLowerCase().includes(searchValue) ||
                getUserName(task.user_id).toLowerCase().includes(searchValue)
            );
        }

        if (statusFilter !== "all") {
            result = result.filter(
                (task) =>
                    (task.status || "").toLowerCase() === statusFilter
            );
        }

        if (userFilter !== "all") {
            result = result.filter(
                (task) => String(task.user_id) === String(userFilter)
            );
        }

        result.sort((a, b) => {
            const dateA = new Date(a.created_at || 0).getTime();
            const dateB = new Date(b.created_at || 0).getTime();

            return sortOrder === "newest"
                ? dateB - dateA
                : dateA - dateB;
        });

        return result;

    }, [tasks, search, statusFilter, userFilter, sortOrder, users]);

    // Status badge - EXISTING FUNCTIONALITY
    const getStatusBadge = (status) => {

        const value = (status || "pending").toLowerCase();

        if (value === "completed") {
            return "bg-success";
        }

        if (value === "in progress") {
            return "bg-info text-dark";
        }

        return "bg-warning text-dark";
    };

    // Reset all filters - EXISTING FUNCTIONALITY
    const resetFilters = () => {
        setSearch("");
        setStatusFilter("all");
        setUserFilter("all");
        setSortOrder("newest");
    };

    if (loading) {
        return (
            <div className="container-fluid py-5 text-center">
                <div className="spinner-border text-primary"></div>
                <p className="mt-3 text-muted">Loading tasks...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container-fluid p-4">
                <div className="alert alert-danger">
                    <i className="fa fa-exclamation-circle me-2"></i>
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid p-4 bg-light min-vh-100">

            {/* Page Header */}
            <div className="d-flex justify-content-between
                align-items-center flex-wrap mb-4">

                <div>
                    <h3 className="fw-bold mb-1">
                        Task Management
                    </h3>

                    <p className="text-muted mb-0">
                        Manage and monitor all users' tasks
                    </p>
                </div>

                <span className="badge bg-primary p-2">
                    <i className="fa fa-tasks me-2"></i>
                    Admin Panel
                </span>

            </div>

            {/* Task Statistics */}
            <div className="row mb-4">

                <div className="col-md-4 mb-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <div>
                                    <p className="text-muted mb-1">
                                        Total Tasks
                                    </p>
                                    <h3 className="fw-bold mb-0">
                                        {tasks.length}
                                    </h3>
                                </div>

                                <i className="fa fa-tasks text-primary fs-2"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-4 mb-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <div>
                                    <p className="text-muted mb-1">
                                        Completed Tasks
                                    </p>
                                    <h3 className="fw-bold text-success mb-0">
                                        {tasks.filter(
                                            t => t.status?.toLowerCase() === "completed"
                                        ).length}
                                    </h3>
                                </div>

                                <i className="fa fa-check-circle text-success fs-2"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-4 mb-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <div>
                                    <p className="text-muted mb-1">
                                        Pending Tasks
                                    </p>
                                    <h3 className="fw-bold text-warning mb-0">
                                        {tasks.filter(
                                            t => t.status?.toLowerCase() !== "completed"
                                        ).length}
                                    </h3>
                                </div>

                                <i className="fa fa-clock-o text-warning fs-2"></i>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Filter Section */}
            <div className="card border-0 shadow-sm mb-4">

                <div className="card-body p-4">

                    <div className="d-flex justify-content-between
                        align-items-center mb-3">

                        <h5 className="fw-bold mb-0">
                            <i className="fa fa-filter me-2 text-primary"></i>
                            Filter Tasks
                        </h5>

                        <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={resetFilters}
                        >
                            <i className="fa fa-refresh me-1"></i>
                            Reset
                        </button>

                    </div>

                    <div className="row">

                        {/* Search */}
                        <div className="col-lg-3 col-md-6 mb-3">
                            <label className="form-label fw-semibold">
                                Search
                            </label>

                            <div className="input-group">
                                <span className="input-group-text bg-white">
                                    <i className="fa fa-search"></i>
                                </span>

                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search task..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="col-lg-3 col-md-6 mb-3">
                            <label className="form-label fw-semibold">
                                Task Status
                            </label>

                            <select
                                className="form-select"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="in progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>

                        {/* User Filter */}
                        <div className="col-lg-3 col-md-6 mb-3">
                            <label className="form-label fw-semibold">
                                Assigned User
                            </label>

                            <select
                                className="form-select"
                                value={userFilter}
                                onChange={(e) => setUserFilter(e.target.value)}
                            >
                                <option value="all">All Users</option>

                                {users.map((user) => (
                                    <option
                                        key={user.id}
                                        value={user.id}
                                    >
                                        {user.name || user.username || user.email}
                                    </option>
                                ))}

                            </select>
                        </div>

                        {/* Sorting */}
                        <div className="col-lg-3 col-md-6 mb-3">
                            <label className="form-label fw-semibold">
                                Sort By
                            </label>

                            <select
                                className="form-select"
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                            </select>
                        </div>

                    </div>

                </div>
            </div>

            {/* Tasks Table */}
            <div className="card border-0 shadow-sm">

                <div className="card-body p-0">

                    <div className="d-flex justify-content-between
                        align-items-center p-4">

                        <h5 className="fw-bold mb-0">
                            All Tasks
                        </h5>

                        <span className="badge bg-primary">
                            {filteredTasks.length} Tasks Found
                        </span>

                    </div>

                    <div className="table-responsive">

                        <table className="table table-hover align-middle mb-0">

                            <thead className="table-light">
                                <tr>
                                    <th className="ps-4">#</th>
                                    <th>Task Title</th>
                                    <th>Description</th>
                                    <th>Assigned User</th>
                                    <th>Status</th>
                                    <th>Created Date</th>
                                    <th className="text-center">Action</th>
                                </tr>
                            </thead>

                            <tbody>

                                {filteredTasks.length > 0 ? (

                                    filteredTasks.map((task, index) => (

                                        <tr key={task.id}>

                                            <td className="ps-4 fw-semibold">
                                                {index + 1}
                                            </td>

                                            <td>
                                                <span className="fw-semibold">
                                                    {task.title || "Untitled"}
                                                </span>
                                            </td>

                                            <td>
                                                <span
                                                    className="text-muted"
                                                    style={{
                                                        maxWidth: "220px",
                                                        display: "block",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        whiteSpace: "nowrap"
                                                    }}
                                                    title={task.description}
                                                >
                                                    {task.description || "-"}
                                                </span>
                                            </td>

                                            <td>
                                                <i className="fa fa-user-circle
                                                    text-secondary me-2"></i>

                                                {getUserName(task.user_id)}
                                            </td>

                                            <td>
                                                <span className={`badge ${getStatusBadge(task.status)} px-3 py-2`}>
                                                    {task.status || "Pending"}
                                                </span>
                                            </td>

                                            <td>
                                                <small className="text-muted">
                                                    {task.created_at
                                                        ? new Date(task.created_at).toLocaleDateString()
                                                        : "-"}
                                                </small>
                                            </td>

                                            {/* NEW: View Task Button */}
                                            <td className="text-center">
                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    title="View Task Details"
                                                    onClick={() => getSingleTask(task.id)}
                                                >
                                                    <i className="fa fa-eye"></i>
                                                </button>
                                            </td>

                                        </tr>

                                    ))

                                ) : (

                                    <tr>
                                        <td colSpan="7" className="text-center py-5">

                                            <i className="fa fa-folder-open
                                                text-muted fs-1"></i>

                                            <p className="text-muted mt-3 mb-0">
                                                No tasks found
                                            </p>

                                        </td>
                                    </tr>

                                )}

                            </tbody>

                        </table>

                    </div>

                    <div className="p-3 border-top">
                        <small className="text-muted">
                            Showing {filteredTasks.length} of {tasks.length} tasks
                        </small>
                    </div>

                </div>
            </div>

            {/* NEW: Single Task Details Modal */}
            {showTaskModal && (
                <div
                    className="modal d-block"
                    tabIndex="-1"
                    role="dialog"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow">

                            <div className="modal-header bg-primary text-white">

                                <h5 className="modal-title">
                                    <i className="fa fa-file-text me-2"></i>
                                    Task Details
                                </h5>

                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={closeTaskModal}
                                ></button>

                            </div>

                            <div className="modal-body p-4">

                                {detailLoading && (
                                    <div className="text-center py-4">
                                        <div className="spinner-border text-primary"></div>
                                        <p className="text-muted mt-2 mb-0">
                                            Loading task details...
                                        </p>
                                    </div>
                                )}

                                {detailError && (
                                    <div className="alert alert-danger mb-0">
                                        {detailError}
                                    </div>
                                )}

                                {selectedTask && !detailLoading && (
                                    <>
                                        <div className="mb-3">
                                            <label className="text-muted small">
                                                Task ID
                                            </label>
                                            <h6 className="fw-bold">
                                                #{selectedTask.id}
                                            </h6>
                                        </div>

                                        <div className="mb-3">
                                            <label className="text-muted small">
                                                Task Title
                                            </label>
                                            <h5 className="fw-bold">
                                                {selectedTask.title}
                                            </h5>
                                        </div>

                                        <div className="mb-3">
                                            <label className="text-muted small">
                                                Description
                                            </label>
                                            <p className="mb-0">
                                                {selectedTask.description || "No description available"}
                                            </p>
                                        </div>

                                        <div className="mb-3">
                                            <label className="text-muted small">
                                                Assigned User
                                            </label>
                                            <p className="fw-semibold mb-0">
                                                <i className="fa fa-user-circle me-2 text-primary"></i>
                                                {getUserName(selectedTask.user_id)}
                                            </p>
                                        </div>

                                        <div className="mb-3">
                                            <label className="text-muted small">
                                                Completion Status
                                            </label>
                                            <div>
                                                {(() => {
                                                    const completed =
                                                        selectedTask.is_complete === true ||
                                                        selectedTask.status?.toLowerCase() === "completed";

                                                    return (
                                                        <span className={`badge px-3 py-2 ${
                                                            completed
                                                                ? "bg-success"
                                                                : "bg-warning text-dark"
                                                        }`}>
                                                            {completed ? "Completed" : "Incomplete"}
                                                        </span>
                                                    );
                                                })()}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-muted small">
                                                Created Date
                                            </label>
                                            <p className="mb-0">
                                                {selectedTask.created_at
                                                    ? new Date(selectedTask.created_at).toLocaleString()
                                                    : "-"}
                                            </p>
                                        </div>
                                    </>
                                )}

                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={closeTaskModal}
                                >
                                    Close
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminTask;


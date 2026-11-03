
import { useEffect, useState } from "react";
import api from "../../api";

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch users and tasks from backend
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError("");

                const [usersResponse, tasksResponse] = await Promise.all([
                    api.get("/user/allUsers"),
                    api.get("/task/admin/allTasks"),
                ]);

                setUsers(usersResponse.data);
                setTasks(tasksResponse.data);

            } catch (err) {
                console.error("Dashboard API Error:", err);

                setError(
                    err.response?.data?.detail ||
                    "Unable to fetch dashboard data"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Calculate dashboard statistics
    const totalUsers = users.length;
    const totalTasks = tasks.length;

    // Change "completed" according to your backend Task model
    const completedTasks = tasks.filter(
        (task) => task.status?.toLowerCase() === "completed"
    ).length;

    const incompleteTasks = totalTasks - completedTasks;

    const completionPercentage = totalTasks > 0
        ? Math.round((completedTasks / totalTasks) * 100)
        : 0;

    // Dashboard card component
    const StatCard = ({ title, count, icon, color, description }) => (
        <div className="col-lg-3 col-md-6 mb-4">
            <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">

                        <div>
                            <p className="text-muted mb-2">{title}</p>

                            <h2 className="fw-bold mb-2">
                                {count}
                            </h2>

                            <small className="text-muted">
                                {description}
                            </small>
                        </div>

                        <div
                            className={`rounded-3 bg-${color} bg-opacity-10
                            text-${color} d-flex align-items-center
                            justify-content-center`}
                            style={{
                                width: "55px",
                                height: "55px",
                                fontSize: "24px",
                            }}
                        >
                            <i className={`fa ${icon}`}></i>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="container-fluid py-5 text-center">
                <div className="spinner-border text-primary"></div>
                <p className="mt-3 text-muted">
                    Loading dashboard...
                </p>
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

            {/* Dashboard Heading */}
            <div className="d-flex justify-content-between
                align-items-center mb-4">

                <div>
                    <h3 className="fw-bold mb-1">
                        Admin Dashboard
                    </h3>

                    <p className="text-muted mb-0">
                        Overview of users and task activities
                    </p>
                </div>

                <span className="badge bg-primary p-2">
                    <i className="fa fa-dashboard me-1"></i>
                    Admin Panel
                </span>

            </div>

            {/* Statistics Cards */}
            <div className="row">

                <StatCard
                    title="Total Users"
                    count={totalUsers}
                    icon="fa-users"
                    color="primary"
                    description="Registered users"
                />

                <StatCard
                    title="Total Tasks"
                    count={totalTasks}
                    icon="fa-tasks"
                    color="info"
                    description="All assigned tasks"
                />

                <StatCard
                    title="Completed Tasks"
                    count={completedTasks}
                    icon="fa-check-circle"
                    color="success"
                    description="Successfully completed"
                />

                <StatCard
                    title="Incomplete Tasks"
                    count={incompleteTasks}
                    icon="fa-clock-o"
                    color="warning"
                    description="Tasks pending completion"
                />

            </div>

            {/* Task Progress Section */}
            <div className="row">

                
                    <div className="card border-0 shadow-sm h-100">

                        <div className="card-body p-4">

                            <h5 className="fw-bold mb-1">
                                Task Completion Overview
                            </h5>

                            <p className="text-muted mb-4">
                                Overall task completion progress
                            </p>

                            <div className="d-flex justify-content-between
                                align-items-center mb-2">

                                <span className="fw-semibold">
                                    Completed Tasks
                                </span>

                                <span className="fw-bold text-success">
                                    {completionPercentage}%
                                </span>

                            </div>

                            <div
                                className="progress mb-3"
                                style={{ height: "14px" }}
                            >
                                <div
                                    className="progress-bar bg-success"
                                    role="progressbar"
                                    style={{
                                        width: `${completionPercentage}%`,
                                    }}
                                    aria-valuenow={completionPercentage}
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                ></div>
                            </div>

                            <div className="d-flex justify-content-between">
                                <small className="text-muted">
                                    {completedTasks} Completed
                                </small>

                                <small className="text-muted">
                                    {incompleteTasks} Incomplete
                                </small>
                            </div>

                        </div>
                    </div>
            </div>

        </div>
    );
};

export default AdminDashboard;

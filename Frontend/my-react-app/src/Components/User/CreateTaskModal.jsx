import { useState } from "react";
import api from "../../api";

const CreateTaskModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Close modal
  const handleClose = () => {
    onClose();
  };

  // Submit task
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      // Change endpoint if your backend uses a different URL
      await api.post("task/create", formData);

       // Notify all listening pages that tasks have changed
    window.dispatchEvent(new Event("taskUpdated"));

      alert("Task created successfully!");

      setFormData({
        title: "",
        description: "",
      });

      onClose();
    } catch (err) {
      console.error(err);

      setError(err.response?.data?.detail || "Unable to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Modal Backdrop */}
      <div className="modal-backdrop fade show" onClick={handleClose}></div>

      {/* Bootstrap Modal */}
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow">
            {/* Modal Header */}
            <div className="modal-header">
              <h5 className="modal-title fw-bold">Create New Task</h5>

              {/* Close X Button */}
              <button
                type="button"
                className="btn-close"
                onClick={handleClose}
                aria-label="Close"
              ></button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit}>
              <div className="modal-body p-4">
                {error && <div className="alert alert-danger">{error}</div>}

                {/* Task Title */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Task Title</label>

                  <input
                    type="text"
                    name="title"
                    className="form-control"
                    placeholder="Enter task title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Task Description */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Task Description
                  </label>

                  <textarea
                    name="description"
                    className="form-control"
                    rows="4"
                    placeholder="Enter task description"
                    value={formData.description}
                    onChange={handleChange}
                  ></textarea>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="modal-footer">
                {/* Cancel Button */}
                <button
                  type="button"
                  className="btn btn-danger px-4"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancel
                </button>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn btn-success px-4"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Submitting...
                    </>
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateTaskModal;

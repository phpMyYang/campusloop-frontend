import React from "react";

const SettingsFormModal = ({
  formData,
  handleInputChange,
  handleFormSubmit,
}) => {
  return (
    <div
      className="modal fade"
      id="setSettingsModal"
      tabIndex="-1"
      aria-hidden="true"
      data-bs-backdrop="static"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div
            className="modal-header border-bottom pb-3"
            style={{ backgroundColor: "var(--accent-color)" }}
          >
            <h5
              className="modal-title fw-bold"
              style={{ color: "var(--primary-color)" }}
            >
              <i className="bi bi-gear-fill me-2"></i> Configure School Settings
            </h5>
            <button
              type="button"
              className="btn-close shadow-none"
              data-bs-dismiss="modal"
            ></button>
          </div>
          <form onSubmit={handleFormSubmit}>
            <div className="modal-body p-4 bg-white">
              <div className="mb-4">
                <label className="form-label small fw-bold text-dark">
                  School Year (Format: YYYY-YYYY)
                </label>
                <input
                  type="text"
                  className="form-control bg-light toolbar-input text-center fs-5 fw-bold"
                  name="school_year"
                  value={formData.school_year}
                  onChange={handleInputChange}
                  pattern="\d{4}-\d{4}"
                  title="Must be in YYYY-YYYY format (e.g., 2025-2026)"
                  required
                  autoFocus
                  placeholder="e.g., 2025-2026"
                />
                <small
                  className="text-muted d-block mt-2 text-center"
                  style={{ fontSize: "0.75rem" }}
                >
                  Ensure the format is exact to avoid data issues.
                </small>
              </div>
              <div className="mb-2">
                <label className="form-label small fw-bold text-dark">
                  Semester
                </label>
                <select
                  className="form-select bg-light toolbar-input fw-bold"
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- Select Semester --</option>
                  <option value="1st">1st Semester</option>
                  <option value="2nd">2nd Semester</option>
                </select>
              </div>
            </div>
            <div className="modal-footer border-top bg-light p-3 d-flex gap-2">
              <button
                type="button"
                className="btn btn-light border px-4 fw-medium rounded-3"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-campusloop px-4 fw-bold rounded-3"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsFormModal;

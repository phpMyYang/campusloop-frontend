import React from "react";

const FormSetupModal = ({
  modalMode,
  formData,
  handleInputChange,
  handleFormSubmit,
}) => {
  return (
    <div
      className="modal fade"
      id="formSetupModal"
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
              {modalMode === "create" ? (
                <>
                  <i className="bi bi-plus-square-fill me-2"></i> Form Setup
                </>
              ) : (
                <>
                  <i className="bi bi-pencil-square me-2"></i> Form Settings
                </>
              )}
            </h5>
            <button
              type="button"
              className="btn-close shadow-none"
              data-bs-dismiss="modal"
            ></button>
          </div>
          <form onSubmit={handleFormSubmit}>
            <div className="modal-body p-4 bg-white">
              <div className="mb-3">
                <label className="form-label small fw-bold text-dark">
                  <i className="bi bi-ui-radios me-1 text-muted"></i> Form Name
                </label>
                <input
                  type="text"
                  className="form-control bg-light toolbar-input"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  autoFocus
                  placeholder="e.g. Midterm Examination"
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-dark">
                  <i className="bi bi-info-circle me-1 text-muted"></i>{" "}
                  Instructions
                </label>
                <textarea
                  className="form-control bg-light toolbar-input custom-scrollbar"
                  name="instruction"
                  value={formData.instruction}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  placeholder="Read carefully..."
                ></textarea>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-bold text-dark">
                  <i className="bi bi-hourglass-split me-1 text-muted"></i> Time
                  Limit (Minutes)
                </label>
                <input
                  type="number"
                  className="form-control bg-light toolbar-input"
                  name="timer"
                  value={formData.timer}
                  onChange={handleInputChange}
                  min="1"
                  placeholder="Leave blank if no time limit"
                />
              </div>

              <div className="card bg-light border-0 rounded-4 p-3 mb-2">
                <h6
                  className="small fw-bold text-muted mb-3"
                  style={{ letterSpacing: "1px" }}
                >
                  ADVANCED FEATURES
                </h6>

                <div className="form-check form-switch mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="shuffleCheck"
                    name="is_shuffle_questions"
                    checked={formData.is_shuffle_questions}
                    onChange={handleInputChange}
                    style={{ cursor: "pointer" }}
                  />
                  <label
                    className="form-check-label small fw-bold text-dark ms-1"
                    htmlFor="shuffleCheck"
                    style={{ cursor: "pointer" }}
                  >
                    Shuffle Questions
                    <span
                      className="d-block text-muted fw-normal mt-1"
                      style={{ fontSize: "0.7rem" }}
                    >
                      Randomize the order of questions for each student.
                    </span>
                  </label>
                </div>

                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="focusCheck"
                    name="is_focus_mode"
                    checked={formData.is_focus_mode}
                    onChange={handleInputChange}
                    style={{ cursor: "pointer" }}
                  />
                  <label
                    className="form-check-label small fw-bold text-danger ms-1"
                    htmlFor="focusCheck"
                    style={{ cursor: "pointer" }}
                  >
                    Enable Focus Mode (Anti-Cheat)
                    <span
                      className="d-block text-muted fw-normal mt-1"
                      style={{ fontSize: "0.7rem" }}
                    >
                      Auto-submits if student switches tabs. Disables copy,
                      paste, and right-click.
                    </span>
                  </label>
                </div>
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
                {modalMode === "create" ? "Proceed to Builder" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FormSetupModal;

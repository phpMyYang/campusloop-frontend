import React from "react";

const UserDrawer = ({
  drawerMode,
  formData,
  handleInputChange,
  handleSubmit,
  calculateAge,
  strandsList,
}) => {
  return (
    <div
      className="offcanvas offcanvas-end shadow-lg border-0"
      tabIndex="-1"
      id="userDrawer"
      style={{ width: "450px" }}
    >
      <div
        className="offcanvas-header border-bottom py-3"
        style={{ backgroundColor: "var(--accent-color)" }}
      >
        <h5
          className="offcanvas-title fw-bold d-flex align-items-center"
          style={{ color: "var(--primary-color)" }}
        >
          {drawerMode === "create" ? (
            <>
              <i className="bi bi-person-plus-fill me-2 fs-4"></i> Create New
              User
            </>
          ) : drawerMode === "update" ? (
            <>
              <i className="bi bi-pencil-square me-2 fs-4"></i> Update User
            </>
          ) : (
            <>
              <i className="bi bi-person-badge-fill me-2 fs-4"></i> User Details
            </>
          )}
        </h5>
        <button
          type="button"
          className="btn-close shadow-none"
          data-bs-dismiss="offcanvas"
        ></button>
      </div>

      <div className="offcanvas-body custom-scrollbar p-4 bg-white">
        <form onSubmit={handleSubmit}>
          <div className="row g-4">
            {/* Personal Information Section */}
            <div className="col-12">
              <h6
                className="fw-bold text-muted mb-0 border-bottom pb-2"
                style={{ fontSize: "0.85rem", letterSpacing: "1px" }}
              >
                PERSONAL INFORMATION
              </h6>
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-bold text-dark">
                <i className="bi bi-person me-1 text-muted"></i> First Name
              </label>
              <input
                type="text"
                className="form-control bg-light toolbar-input"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                disabled={drawerMode === "view"}
                required
                autoFocus
                placeholder="e.g. Juan"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-bold text-dark">
                Last Name
              </label>
              <input
                type="text"
                className="form-control bg-light toolbar-input"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                disabled={drawerMode === "view"}
                required
                placeholder="e.g. Dela Cruz"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-bold text-dark">
                <i className="bi bi-gender-ambiguous me-1 text-muted"></i>{" "}
                Gender
              </label>
              <select
                className="form-select bg-light toolbar-input"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                disabled={drawerMode === "view"}
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-bold text-dark">
                <i className="bi bi-calendar-date me-1 text-muted"></i> Birthday
                & Age
              </label>
              <div className="input-group">
                <input
                  type="date"
                  className="form-control bg-light toolbar-input border-end-0"
                  name="birthday"
                  value={formData.birthday}
                  onChange={handleInputChange}
                  disabled={drawerMode === "view"}
                  required
                />

                <div className="input-group-text bg-white border-top border-bottom border-0 px-1">
                  <div
                    className="vr text-muted"
                    style={{ width: "2px", height: "20px" }}
                  ></div>
                </div>

                <span
                  className="input-group-text bg-white toolbar-input border-start-0 text-primary fw-bold px-2"
                  style={{ minWidth: "55px", justifyContent: "center" }}
                >
                  {calculateAge(formData.birthday) || "-"}
                </span>
              </div>
            </div>

            {/* Account Settings Section */}
            <div className="col-12 mt-4">
              <h6
                className="fw-bold text-muted mb-0 border-bottom pb-2"
                style={{ fontSize: "0.85rem", letterSpacing: "1px" }}
              >
                ACCOUNT SETTINGS
              </h6>
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-bold text-dark">
                <i className="bi bi-shield-lock me-1 text-muted"></i> Role
              </label>
              <select
                className="form-select bg-light toolbar-input"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                disabled={drawerMode === "view"}
                required
              >
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-bold text-dark">
                <i className="bi bi-toggle-on me-1 text-muted"></i> Status
              </label>
              <select
                className="form-select bg-light toolbar-input"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                disabled={drawerMode === "view"}
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="col-12">
              <label className="form-label small fw-bold text-dark">
                <i className="bi bi-envelope-at me-1 text-muted"></i> Email
                Address
              </label>
              <input
                type="email"
                className="form-control bg-light toolbar-input"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={drawerMode === "view"}
                required
                placeholder="e.g. jdelacruz@holyface.edu.ph"
              />
            </div>

            {drawerMode !== "view" && (
              <div className="col-12">
                <label className="form-label small fw-bold text-dark">
                  <i className="bi bi-key me-1 text-muted"></i> Password
                </label>
                <input
                  type="text"
                  className="form-control bg-light toolbar-input"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={
                    drawerMode === "create"
                      ? "Leave blank to auto-generate"
                      : "Leave blank to keep current"
                  }
                  pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}"
                  title="Must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters."
                />
                <small className="text-muted" style={{ fontSize: "0.70rem" }}>
                  Min. 8 chars, 1 uppercase, 1 lowercase, 1 number, and 1
                  special symbol.
                </small>
              </div>
            )}

            {/* Academic Details (Student Only) */}
            {formData.role === "student" && (
              <>
                <div className="col-12 mt-4">
                  <h6
                    className="fw-bold text-muted mb-0 border-bottom pb-2"
                    style={{ fontSize: "0.85rem", letterSpacing: "1px" }}
                  >
                    ACADEMIC DETAILS
                  </h6>
                </div>
                <div className="col-md-6">
                  <label
                    className="form-label small fw-bold"
                    style={{ color: "var(--primary-color)" }}
                  >
                    <i className="bi bi-123 me-1"></i> LRN
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="\d{12}"
                    maxLength="12"
                    minLength="12"
                    title="LRN must be exactly 12 digits."
                    className="form-control bg-light toolbar-input"
                    name="lrn"
                    value={formData.lrn}
                    onChange={(e) => {
                      e.target.value = e.target.value.replace(/[^0-9]/g, "");
                      handleInputChange(e);
                    }}
                    disabled={drawerMode === "view"}
                    required
                    placeholder="e.g. 109876543210"
                  />
                </div>
                <div className="col-md-6">
                  <label
                    className="form-label small fw-bold"
                    style={{ color: "var(--primary-color)" }}
                  >
                    <i className="bi bi-journal-text me-1"></i> Strand
                  </label>
                  <select
                    className="form-select bg-light toolbar-input"
                    name="strand_id"
                    value={formData.strand_id}
                    onChange={handleInputChange}
                    disabled={drawerMode === "view"}
                    required
                  >
                    <option value="">Select Strand</option>
                    {strandsList && strandsList.length > 0 ? (
                      strandsList.map((strand) => (
                        <option key={strand.id} value={strand.id}>
                          {strand.name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        No strands available
                      </option>
                    )}
                  </select>
                </div>
              </>
            )}
          </div>

          <div className="mt-5 pt-3 border-top">
            {drawerMode === "view" ? (
              <button
                type="button"
                className="btn btn-campusloop w-100 rounded-3 shadow-sm"
                data-bs-dismiss="offcanvas"
              >
                <i className="bi bi-x-circle me-2"></i> Close Details
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-campusloop w-100 rounded-3 shadow-sm"
              >
                {drawerMode === "create" ? (
                  <>
                    <i className="bi bi-person-check-fill me-2"></i> Create
                    Account
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle-fill me-2"></i> Save
                    Changes
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserDrawer;

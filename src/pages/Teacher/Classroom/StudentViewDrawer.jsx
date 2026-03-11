import React from "react";

const StudentViewDrawer = ({ student }) => {
  if (!student) return null;

  const calculateAge = (birthday) => {
    if (!birthday) return "-";
    const ageDifMs = Date.now() - new Date(birthday).getTime();
    return Math.abs(new Date(ageDifMs).getUTCFullYear() - 1970);
  };

  return (
    <div
      className="offcanvas offcanvas-end shadow-lg border-0"
      tabIndex="-1"
      id="studentViewDrawer"
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
          <i className="bi bi-person-badge-fill me-2 fs-4"></i> Student Details
        </h5>
        <button
          type="button"
          className="btn-close shadow-none"
          data-bs-dismiss="offcanvas"
        ></button>
      </div>

      <div className="offcanvas-body custom-scrollbar p-4 bg-white">
        <div className="row g-4">
          <div className="col-12 text-center mb-2">
            <div
              className="rounded-circle d-flex justify-content-center align-items-center fw-bold text-white shadow-sm mx-auto mb-3"
              style={{
                width: "80px",
                height: "80px",
                backgroundColor: "var(--primary-color)",
                fontSize: "2.5rem",
              }}
            >
              {student.first_name
                ? student.first_name.charAt(0).toUpperCase()
                : "S"}
            </div>
            <h5 className="fw-bold text-dark mb-0">
              {student.first_name} {student.last_name}
            </h5>
            <span className="badge bg-secondary bg-opacity-10 text-dark mt-2 border">
              Student Account
            </span>
          </div>

          <div className="col-12 mt-2">
            <h6
              className="fw-bold text-muted mb-0 border-bottom pb-2"
              style={{ fontSize: "0.85rem", letterSpacing: "1px" }}
            >
              PERSONAL INFORMATION
            </h6>
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-bold text-muted mb-0">
              First Name
            </label>
            <p className="text-dark fw-medium mb-0">{student.first_name}</p>
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-bold text-muted mb-0">
              Last Name
            </label>
            <p className="text-dark fw-medium mb-0">{student.last_name}</p>
          </div>

          <div className="col-md-4">
            <label className="form-label small fw-bold text-muted mb-0">
              Gender
            </label>
            <p className="text-dark fw-medium mb-0">
              {student.gender || "N/A"}
            </p>
          </div>
          <div className="col-md-5">
            <label className="form-label small fw-bold text-muted mb-0">
              Birthday
            </label>
            <p className="text-dark fw-medium mb-0">
              {student.birthday
                ? new Date(student.birthday).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
          <div className="col-md-3">
            <label className="form-label small fw-bold text-muted mb-0">
              Age
            </label>
            <p className="text-dark fw-medium mb-0">
              {calculateAge(student.birthday)}
            </p>
          </div>

          <div className="col-12 mt-4">
            <h6
              className="fw-bold text-muted mb-0 border-bottom pb-2"
              style={{ fontSize: "0.85rem", letterSpacing: "1px" }}
            >
              ACADEMIC & ACCOUNT DETAILS
            </h6>
          </div>

          <div className="col-12">
            <label className="form-label small fw-bold text-muted mb-0">
              <i className="bi bi-envelope-at me-1"></i> Email Address
            </label>
            <p className="text-dark fw-medium mb-0">{student.email}</p>
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-bold text-muted mb-0">
              <i className="bi bi-123 me-1"></i> LRN
            </label>
            <p className="text-dark fw-medium mb-0 tracking-wide font-monospace fs-6">
              {student.lrn || "N/A"}
            </p>
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-bold text-muted mb-0">
              <i className="bi bi-journal-text me-1"></i> Strand
            </label>
            <p className="text-dark fw-medium mb-0">
              {student.strand ? student.strand.name : "N/A"}
            </p>
          </div>
        </div>

        <div className="mt-5 pt-3 border-top">
          <button
            type="button"
            className="btn btn-campusloop w-100 rounded-3 shadow-sm py-2 fw-bold"
            data-bs-dismiss="offcanvas"
          >
            <i className="bi bi-check-circle me-2"></i> Okay, Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentViewDrawer;

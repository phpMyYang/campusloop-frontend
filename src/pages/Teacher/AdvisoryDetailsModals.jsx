import React, { useState } from "react";
import { Modal } from "bootstrap";

const AdvisoryDetailsModals = ({
  searchAvailable,
  setSearchAvailable,
  filteredAvailable = [],
  selectedStudentIds = [],
  toggleStudentSelection,
  confirmAddStudents,
  executeAddStudents,
  studentToRemove,
  executeRemoveStudent,
  activeStudent,
  isEditingGrade,
  setIsEditingGrade,
  handleGradeSubmit,
  executeSaveGrade,
  subjects = [],
  studentGrades = [],
  gradeForm = {},
  setGradeForm,
  viewingFeedback,
  setViewingFeedback,
}) => {
  const handleEditClick = (record) => {
    setIsEditingGrade(true);
    setViewingFeedback(null);
    setGradeForm({
      id: record.id,
      subject_id: record.subject_id || "",
      semester: record.semester || "",
      grade: record.grade || "",
    });
  };

  const handleViewFeedback = (feedback) => {
    setViewingFeedback(feedback);
    setIsEditingGrade(false);
  };

  const resetForm = () => {
    setIsEditingGrade(false);
    setViewingFeedback(null);
    setGradeForm({ id: null, subject_id: "", semester: "", grade: "" });
  };

  const availableSubjectsForEncoding = subjects.filter((subj) => {
    const isAlreadyGraded = studentGrades.some(
      (gradeRecord) => String(gradeRecord.subject_id) === String(subj.id),
    );
    if (isEditingGrade && String(gradeForm?.subject_id) === String(subj.id)) {
      return true; // Palaging ipakita ang subject kung ito ay ine-edit ngayon
    }
    return !isAlreadyGraded; // Itago ang subject kung na-encode na
  });

  return (
    <>
      <div
        className="modal fade"
        id="addStudentsModal"
        tabIndex="-1"
        aria-hidden="true"
        data-bs-backdrop="static"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div
              className="modal-header border-bottom pb-3"
              style={{ backgroundColor: "var(--accent-color)" }}
            >
              <h5
                className="modal-title fw-bold"
                style={{ color: "var(--primary-color)" }}
              >
                <i className="bi bi-person-plus-fill me-2"></i> Add Students to
                Advisory
              </h5>
              <button
                type="button"
                className="btn-close shadow-none"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body p-4 bg-white">
              <div className="mb-3">
                <label className="form-label small fw-bold text-dark">
                  <i className="bi bi-search me-1 text-muted"></i> Search
                  Student
                </label>
                <input
                  type="text"
                  className="form-control bg-light toolbar-input"
                  placeholder="Search available students by Name or LRN..."
                  value={searchAvailable || ""}
                  onChange={(e) => setSearchAvailable(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="mb-2">
                <label className="form-label small fw-bold text-dark">
                  <i className="bi bi-list-check me-1 text-muted"></i> Available
                  Students
                </label>
                <div className="border rounded-3 overflow-hidden shadow-sm">
                  <div
                    className="custom-scrollbar bg-white"
                    style={{ maxHeight: "350px", overflowY: "auto" }}
                  >
                    <table className="table table-hover align-middle mb-0 custom-table">
                      <tbody>
                        {filteredAvailable && filteredAvailable.length > 0 ? (
                          filteredAvailable.map((student) => (
                            <tr
                              key={student.id}
                              style={{ cursor: "pointer" }}
                              onClick={() => toggleStudentSelection(student.id)}
                              className={
                                selectedStudentIds.includes(student.id)
                                  ? "table-success bg-opacity-25"
                                  : ""
                              }
                            >
                              <td
                                className="px-4 text-center"
                                style={{ width: "5%" }}
                              >
                                <input
                                  type="checkbox"
                                  className="form-check-input border-secondary shadow-none"
                                  style={{ cursor: "pointer" }}
                                  checked={selectedStudentIds.includes(
                                    student.id,
                                  )}
                                  readOnly
                                />
                              </td>
                              <td className="py-3">
                                <div className="d-flex align-items-center gap-3">
                                  <div
                                    className="rounded-circle bg-light border text-secondary d-flex justify-content-center align-items-center fw-bold"
                                    style={{ width: "35px", height: "35px" }}
                                  >
                                    {student.first_name?.charAt(0) || "?"}
                                  </div>
                                  <div>
                                    <span className="d-block fw-bold text-dark">
                                      {student.first_name} {student.last_name}
                                    </span>
                                    <span className="d-block small text-muted">
                                      LRN: {student.lrn || "N/A"}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="text-end px-4">
                                <span className="badge bg-light border text-dark px-2 py-1 rounded-3">
                                  {student.strand?.name || "No Strand"}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="3"
                              className="text-center py-5 text-muted"
                            >
                              <i className="bi bi-search fs-1 opacity-25 d-block mb-3"></i>
                              No unassigned students found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer border-top bg-light p-3 d-flex gap-2 justify-content-end">
              <button
                type="button"
                className="btn btn-light border px-4 fw-medium rounded-3"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-campusloop px-4 fw-bold rounded-3"
                disabled={selectedStudentIds.length === 0}
                onClick={confirmAddStudents}
              >
                Add Selected
              </button>
            </div>
          </div>
        </div>
      </div>
      <div
        className="modal fade"
        id="gradesModal"
        tabIndex="-1"
        aria-hidden="true"
        data-bs-backdrop="static"
      >
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div
              className="modal-header border-bottom pb-3"
              style={{ backgroundColor: "var(--accent-color)" }}
            >
              <h5
                className="modal-title fw-bold"
                style={{ color: "var(--primary-color)" }}
              >
                <i className="bi bi-journal-bookmark-fill me-2"></i> Grades
                Record: {activeStudent?.first_name} {activeStudent?.last_name}
              </h5>
              <button
                type="button"
                className="btn-close shadow-none"
                data-bs-dismiss="modal"
                onClick={resetForm}
              ></button>
            </div>

            <div className="modal-body p-4 bg-white">
              <div className="mb-4">
                {viewingFeedback ? (
                  <div className="alert alert-danger border-danger border-opacity-25 rounded-4 shadow-sm p-4 mb-0 bg-opacity-10">
                    <div className="d-flex align-items-center mb-3">
                      <div
                        className="rounded-circle bg-danger text-white d-flex justify-content-center align-items-center me-2 shadow-sm"
                        style={{ width: "32px", height: "32px" }}
                      >
                        <i className="bi bi-exclamation-triangle-fill small"></i>
                      </div>
                      <h6 className="fw-bold text-danger mb-0">
                        Admin Feedback
                      </h6>
                    </div>
                    <div
                      className="bg-white p-3 rounded-3 border border-danger border-opacity-25 text-dark mb-3 custom-scrollbar"
                      style={{
                        fontSize: "0.95rem",
                        lineHeight: "1.6",
                        maxHeight: "150px",
                        overflowY: "auto",
                      }}
                    >
                      {viewingFeedback}
                    </div>
                    <div className="text-end">
                      <button
                        type="button"
                        className="btn btn-sm btn-light px-4 rounded-3 shadow-sm"
                        onClick={resetForm}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <form onSubmit={handleGradeSubmit}>
                      <div className="row g-3 align-items-end">
                        <div className="col-md-4">
                          <label className="form-label small fw-bold text-dark">
                            <i className="bi bi-book me-1 text-muted"></i>{" "}
                            Subject
                          </label>
                          <select
                            className="form-select bg-light toolbar-input"
                            required
                            value={gradeForm?.subject_id || ""}
                            onChange={(e) => {
                              const selectedVal = e.target.value;
                              const selectedSubject = subjects.find(
                                (s) => String(s.id) === String(selectedVal),
                              );
                              setGradeForm({
                                ...gradeForm,
                                subject_id: selectedVal,
                                semester: selectedSubject
                                  ? selectedSubject.semester
                                  : gradeForm?.semester || "",
                              });
                            }}
                          >
                            <option value="">Select Subject</option>
                            {/* GAGAMITIN ANG FILTERED SUBJECTS */}
                            {availableSubjectsForEncoding.length > 0 ? (
                              availableSubjectsForEncoding.map((subj) => (
                                <option key={subj.id} value={subj.id}>
                                  {subj.code}: {subj.description}
                                </option>
                              ))
                            ) : (
                              <option value="" disabled>
                                All subjects encoded
                              </option>
                            )}
                          </select>
                        </div>

                        <div className="col-md-3">
                          <label className="form-label small fw-bold text-dark">
                            <i className="bi bi-calendar-range me-1 text-muted"></i>{" "}
                            Semester
                          </label>
                          <input
                            type="text"
                            className="form-control bg-light toolbar-input text-muted"
                            value={gradeForm?.semester || "Auto-filled"}
                            readOnly
                            disabled
                          />
                        </div>

                        <div className="col-md-2">
                          <label className="form-label small fw-bold text-dark">
                            <i className="bi bi-award me-1 text-muted"></i>{" "}
                            Final Grade
                          </label>
                          <div className="input-group shadow-none">
                            <input
                              type="number"
                              step="0.01"
                              min="1"
                              max="100"
                              className="form-control bg-light toolbar-input text-center fw-bold border-end-0 px-1"
                              placeholder="00.00"
                              required
                              value={gradeForm?.grade || ""}
                              onChange={(e) =>
                                setGradeForm({
                                  ...gradeForm,
                                  grade: e.target.value,
                                })
                              }
                            />
                            <span className="input-group-text bg-light text-muted border-start-0 fw-bold px-2">
                              %
                            </span>
                          </div>
                        </div>

                        <div className="col-md-3 d-flex gap-2">
                          <button
                            type="submit"
                            className={`btn w-100 fw-bold rounded-3 shadow-sm ${isEditingGrade ? "btn-campusloop" : "btn-campusloop"}`}
                          >
                            {isEditingGrade ? "Save Changes" : "Submit"}
                          </button>
                          {isEditingGrade && (
                            <button
                              type="button"
                              className="btn btn-light border fw-medium rounded-3 px-3 text-nowrap shadow-sm"
                              onClick={resetForm}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </form>
                  </>
                )}
              </div>

              <hr className="opacity-10 my-4" />

              <div className="mb-2">
                <span className="small text-muted mb-2 d-block">
                  Academic Records
                </span>
                <div className="border rounded-3 overflow-hidden shadow-sm">
                  <div
                    className="table-responsive custom-scrollbar bg-white"
                    style={{ maxHeight: "300px" }}
                  >
                    <table className="table table-hover align-middle mb-0 custom-table">
                      <thead className="bg-light sticky-top">
                        <tr>
                          <th className="small fw-bold text-muted px-4 py-3 text-uppercase">
                            Subject Code
                          </th>
                          <th className="small fw-bold text-muted py-3 text-uppercase">
                            Subject Description
                          </th>
                          <th className="small fw-bold text-muted py-3 text-center text-uppercase">
                            Semester
                          </th>
                          <th className="small fw-bold text-muted py-3 text-center text-uppercase">
                            Final Grade
                          </th>
                          <th className="small fw-bold text-muted py-3 text-center text-uppercase">
                            Status
                          </th>
                          <th className="small fw-bold text-muted py-3 text-center pe-4 text-uppercase">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="border-top-0">
                        {studentGrades && studentGrades.length > 0 ? (
                          studentGrades.map((record) => (
                            <tr key={record.id}>
                              <td className="px-4 fw-bold text-dark small font-monospace">
                                {record.subject_code}
                              </td>
                              <td className="text-dark">
                                {record.subject_description}
                              </td>
                              <td className="small text-muted text-center fw-medium">
                                {record.semester} Semester
                              </td>
                              <td
                                className={`text-center fw-bolder fs-6 ${record.grade < 75 ? "text-danger" : "text-success"}`}
                              >
                                {record.grade}
                              </td>
                              <td className="text-center">
                                {record.status === "pending" && (
                                  <span className="badge bg-warning bg-opacity-25 text-dark border border-warning px-2 py-1 rounded-3">
                                    Pending
                                  </span>
                                )}
                                {record.status === "approved" && (
                                  <span className="badge bg-success bg-opacity-10 text-success border border-success px-2 py-1 rounded-3">
                                    Approved
                                  </span>
                                )}
                                {record.status === "declined" && (
                                  <div className="d-flex flex-column align-items-center">
                                    <span className="badge bg-danger bg-opacity-10 text-danger border border-danger px-2 py-1 rounded-3 mb-1">
                                      Declined
                                    </span>
                                    <span
                                      className="small text-danger fw-bold hover-primary"
                                      style={{
                                        fontSize: "0.65rem",
                                        cursor: "pointer",
                                      }}
                                      onClick={() =>
                                        handleViewFeedback(
                                          record.admin_feedback ||
                                            "No feedback provided.",
                                        )
                                      }
                                    >
                                      View Note
                                    </span>
                                  </div>
                                )}
                              </td>
                              <td className="text-center pe-4">
                                {record.status !== "approved" ? (
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-light border-0 shadow-sm rounded-circle d-inline-flex justify-content-center align-items-center transition-all hover-primary"
                                    style={{ width: "32px", height: "32px" }}
                                    onClick={() => handleEditClick(record)}
                                  >
                                    <i className="bi bi-pencil-fill text-dark"></i>
                                  </button>
                                ) : (
                                  <i className="bi bi-lock-fill text-muted opacity-50"></i>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="6"
                              className="text-center py-5 text-muted"
                            >
                              <i className="bi bi-inbox fs-2 d-block mb-2 opacity-50"></i>
                              No grades encoded yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer border-top bg-light p-3 d-flex gap-2 justify-content-end">
              <button
                type="button"
                className="btn btn-light border px-4 fw-medium rounded-3"
                data-bs-dismiss="modal"
                onClick={resetForm}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="confirmGradeModal"
        tabIndex="-1"
        aria-hidden="true"
        data-bs-backdrop="static"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="modal-header border-0 pb-0 justify-content-center mt-4">
              <div
                className="rounded-circle d-flex justify-content-center align-items-center"
                style={{
                  width: "80px",
                  height: "80px",
                  backgroundColor: "rgba(98, 111, 71, 0.1)",
                }}
              >
                <i
                  className="bi bi-check-circle-fill"
                  style={{ fontSize: "2.5rem", color: "var(--primary-color)" }}
                ></i>
              </div>
            </div>
            <div className="modal-body text-center p-4">
              <h4 className="fw-bold text-dark mt-2">
                {isEditingGrade ? "Save Updates" : "Submit Grade"}
              </h4>
              <p className="text-muted mb-0">
                Are you sure you want to submit this grade for Admin Approval?
              </p>
            </div>
            <div className="modal-footer border-0 d-flex justify-content-center pb-4 pt-0 gap-2">
              <button
                type="button"
                className="btn btn-light px-4 fw-medium shadow-sm rounded-3 border"
                data-bs-dismiss="modal"
                onClick={() =>
                  new Modal(document.getElementById("gradesModal")).show()
                }
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-campusloop px-4 fw-bold shadow-sm rounded-3"
                data-bs-dismiss="modal"
                onClick={executeSaveGrade}
              >
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="confirmAddStudentsModal"
        tabIndex="-1"
        aria-hidden="true"
        data-bs-backdrop="static"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="modal-header border-0 pb-0 justify-content-center mt-4">
              <div
                className="rounded-circle d-flex justify-content-center align-items-center"
                style={{
                  width: "80px",
                  height: "80px",
                  backgroundColor: "rgba(98, 111, 71, 0.1)",
                }}
              >
                <i
                  className="bi bi-person-check-fill"
                  style={{ fontSize: "2.5rem", color: "var(--primary-color)" }}
                ></i>
              </div>
            </div>
            <div className="modal-body text-center p-4">
              <h4 className="fw-bold text-dark mt-2">Confirm Enrollment</h4>
              <p className="text-muted mb-0">
                Are you sure you want to add the selected{" "}
                <b>{selectedStudentIds.length}</b> student(s)?
              </p>
            </div>
            <div className="modal-footer border-0 d-flex justify-content-center pb-4 pt-0 gap-2">
              <button
                type="button"
                className="btn btn-light px-4 fw-medium shadow-sm rounded-3 border"
                data-bs-dismiss="modal"
                onClick={() =>
                  new Modal(document.getElementById("addStudentsModal")).show()
                }
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-campusloop px-4 fw-bold shadow-sm rounded-3"
                data-bs-dismiss="modal"
                onClick={executeAddStudents}
              >
                Yes, Enroll
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="removeStudentModal"
        tabIndex="-1"
        aria-hidden="true"
        data-bs-backdrop="static"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="modal-header border-0 pb-0 justify-content-center mt-4">
              <div
                className="rounded-circle bg-danger bg-opacity-10 d-flex justify-content-center align-items-center"
                style={{ width: "80px", height: "80px" }}
              >
                <i
                  className="bi bi-exclamation-triangle-fill text-danger"
                  style={{ fontSize: "2.5rem" }}
                ></i>
              </div>
            </div>
            <div className="modal-body text-center p-4">
              <h4 className="fw-bold text-dark mt-2">Remove Student</h4>
              <p className="text-muted mb-0">
                Are you sure you want to remove{" "}
                <b>
                  {studentToRemove?.first_name} {studentToRemove?.last_name}
                </b>{" "}
                from this class?
              </p>
            </div>
            <div className="modal-footer border-0 d-flex justify-content-center pb-4 pt-0 gap-2">
              <button
                type="button"
                className="btn btn-light px-4 fw-medium shadow-sm rounded-3 border"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger px-4 fw-bold shadow-sm rounded-3"
                data-bs-dismiss="modal"
                onClick={executeRemoveStudent}
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdvisoryDetailsModals;

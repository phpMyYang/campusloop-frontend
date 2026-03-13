import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { sileo } from "sileo";
import { Modal } from "bootstrap";
import GlobalSpinner from "../../components/Shared/GlobalSpinner";
import AdvisoryDetailsModals from "./AdvisoryDetailsModals";

const darkToast = {
  fill: "#242424",
  styles: { title: "sileo-toast-title", description: "sileo-toast-desc" },
};

const TeacherAdvisoryDetails = () => {
  const { id } = useParams();
  const [advisoryClass, setAdvisoryClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Loading Class Details...");

  const [searchAvailable, setSearchAvailable] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [studentToRemove, setStudentToRemove] = useState(null);

  const [activeStudent, setActiveStudent] = useState(null);
  const [studentGrades, setStudentGrades] = useState([]);
  const [isEditingGrade, setIsEditingGrade] = useState(false);
  const [viewingFeedback, setViewingFeedback] = useState(null);
  const [gradeForm, setGradeForm] = useState({
    id: null,
    subject_id: "",
    semester: "1st",
    grade: "",
  });

  const [searchEnrolled, setSearchEnrolled] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchAdvisoryDetails();
    fetchSubjects();
  }, [id]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchEnrolled, entriesPerPage]);

  const fetchAdvisoryDetails = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/advisory-classes/${id}`,
      );
      setAdvisoryClass(res.data.advisory);
      setStudents(res.data.students);
    } catch (error) {
      sileo.error({
        title: "Error",
        description: "Class not found.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableStudents = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/advisory-classes/${id}/available-students`,
      );
      setAvailableStudents(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/subjects`,
      );
      setSubjects(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchStudentGrades = async (studentId) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/advisory-classes/${id}/students/${studentId}/grades`,
      );
      setStudentGrades(res.data);
    } catch (error) {
      sileo.error({
        title: "Fetch Error",
        description: error.response?.data?.message || "Server error.",
        ...darkToast,
      });
    }
  };

  const openAddStudentModal = () => {
    fetchAvailableStudents();
    setSelectedStudentIds([]);
    setSearchAvailable("");
    const modal = new Modal(document.getElementById("addStudentsModal"));
    modal.show();
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((i) => i !== studentId)
        : [...prev, studentId],
    );
  };

  const confirmAddStudents = () => {
    if (selectedStudentIds.length === 0) return;
    Modal.getInstance(document.getElementById("addStudentsModal"))?.hide();
    setTimeout(() => {
      new Modal(document.getElementById("confirmAddStudentsModal")).show();
    }, 400);
  };

  const executeAddStudents = async () => {
    setIsLoading(true);
    setLoadingText("Adding students...");
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/advisory-classes/${id}/add-students`,
        { student_ids: selectedStudentIds },
      );
      sileo.success({
        title: "Success",
        description: "Students added.",
        ...darkToast,
      });
      fetchAdvisoryDetails();
    } catch (error) {
      // Dito natin ipapakita yung capacity error galing sa backend
      sileo.error({
        title: "Failed",
        description: error.response?.data?.message || "Could not add.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const triggerRemoveStudent = (student) => {
    setStudentToRemove(student);
    const modal = new Modal(document.getElementById("removeStudentModal"));
    modal.show();
  };

  const executeRemoveStudent = async () => {
    setIsLoading(true);
    setLoadingText("Removing student...");
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/advisory-classes/${id}/students/${studentToRemove.id}`,
      );
      sileo.success({
        title: "Removed",
        description: "Student removed.",
        ...darkToast,
      });
      fetchAdvisoryDetails();
    } catch (error) {
      sileo.error({
        title: "Error",
        description: "Failed to remove student.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openGradesModal = (student) => {
    setActiveStudent(student);
    setIsEditingGrade(false);
    setViewingFeedback(null);
    setGradeForm({ id: null, subject_id: "", semester: "1st", grade: "" });
    fetchStudentGrades(student.id);
    const modal = new Modal(document.getElementById("gradesModal"));
    modal.show();
  };

  const handleGradeSubmit = (e) => {
    e.preventDefault();
    if (document.activeElement) document.activeElement.blur();
    Modal.getInstance(document.getElementById("gradesModal"))?.hide();
    setTimeout(() => {
      new Modal(document.getElementById("confirmGradeModal")).show();
    }, 400);
  };

  const executeSaveGrade = async () => {
    setIsLoading(true);
    setLoadingText("Saving Grade...");
    try {
      if (isEditingGrade && gradeForm.id) {
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/advisory-classes/${id}/students/${activeStudent.id}/grades/${gradeForm.id}`,
          gradeForm,
        );
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/advisory-classes/${id}/students/${activeStudent.id}/grades`,
          gradeForm,
        );
      }
      sileo.success({
        title: "Grade Saved",
        description: "Grade submitted.",
        ...darkToast,
      });
      fetchStudentGrades(activeStudent.id);
      setIsEditingGrade(false);
      setGradeForm({ id: null, subject_id: "", semester: "1st", grade: "" });
    } catch (error) {
      sileo.error({
        title: "Failed",
        description: error.response?.data?.message || "Invalid input.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        new Modal(document.getElementById("gradesModal")).show();
      }, 400);
    }
  };

  const filteredEnrolled = students.filter((s) =>
    `${s.first_name} ${s.last_name} ${s.lrn} ${s.email}`
      .toLowerCase()
      .includes(searchEnrolled.toLowerCase()),
  );
  const filteredAvailable = availableStudents.filter((s) =>
    `${s.first_name} ${s.last_name} ${s.lrn}`
      .toLowerCase()
      .includes(searchAvailable.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredEnrolled.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentData = filteredEnrolled.slice(
    startIndex,
    startIndex + entriesPerPage,
  );

  const currentEnrolledCount = students.length;
  const classCapacity = advisoryClass?.capacity || 0;
  const isClassFull = currentEnrolledCount >= classCapacity;
  const remainingCapacity = Math.max(0, classCapacity - currentEnrolledCount);

  return (
    <>
      <GlobalSpinner isLoading={isLoading} text={loadingText} />
      <nav aria-label="breadcrumb" className="mb-3 ps-1">
        <ol className="breadcrumb mb-0">
          <li className="breadcrumb-item">
            <Link
              to="/teacher/advisory"
              className="text-decoration-none text-muted fw-medium d-flex align-items-center"
            >
              Advisory Classes
            </Link>
          </li>
          <li
            className="breadcrumb-item active fw-bold text-dark"
            aria-current="page"
          >
            {advisoryClass?.section || "Loading..."}
          </li>
        </ol>
      </nav>

      <div className="card bg-white border-0 shadow-sm rounded-4 mb-4 overflow-hidden position-relative">
        <div className="card-body p-4 p-md-5">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-4">
            <div className="flex-grow-1" style={{ maxWidth: "800px" }}>
              <div className="d-flex align-items-center gap-3 mb-2">
                <div
                  className="rounded-circle text-white d-flex justify-content-center align-items-center shadow-sm flex-shrink-0"
                  style={{
                    width: "50px",
                    height: "50px",
                    backgroundColor: "var(--primary-color)",
                  }}
                >
                  <i className="bi bi-people-fill fs-4"></i>
                </div>
                <h2
                  className="fw-bolder text-dark mb-0"
                  style={{ letterSpacing: "-0.5px" }}
                >
                  {advisoryClass?.section}
                </h2>
              </div>
              <p
                className="text-muted mt-3 mb-0"
                style={{
                  fontSize: "0.95rem",
                  lineHeight: "1.6",
                  whiteSpace: "pre-wrap",
                }}
              >
                Manage your homeroom students, monitor class records, and input
                final grades for admin review.
              </p>
            </div>

            <button
              onClick={openAddStudentModal}
              disabled={isClassFull}
              className={`btn ${isClassFull ? "btn-secondary opacity-75" : "btn-campusloop shadow-sm"} px-4 py-2 rounded-3 d-flex align-items-center gap-2 fw-bold flex-shrink-0 transition-all`}
            >
              {isClassFull ? (
                <>
                  <i className="bi bi-lock-fill"></i> Class Full
                </>
              ) : (
                <>
                  <i className="bi bi-person-plus-fill"></i> Add Students
                </>
              )}
            </button>
          </div>
          <hr className="opacity-10 my-4" />
          <div className="d-flex flex-wrap justify-content-center gap-4 gap-md-4 align-items-center bg-light p-3 rounded-4 border border-light-subtle">
            <div className="d-flex align-items-center gap-3 pe-md-4 border-end-md">
              <div
                className="rounded-circle bg-white shadow-sm d-flex justify-content-center align-items-center flex-shrink-0"
                style={{ width: "40px", height: "40px" }}
              >
                <i className="bi bi-calendar-event text-primary fs-5"></i>
              </div>
              <div>
                <span
                  className="d-block small text-muted fw-bold mb-0"
                  style={{
                    fontSize: "0.65rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  School Year
                </span>
                <span className="d-block text-dark small fw-bolder">
                  {advisoryClass?.school_year || "..."}
                </span>
              </div>
            </div>
            <div className="d-flex align-items-center gap-3 pe-md-4">
              <div
                className="rounded-circle bg-white shadow-sm d-flex justify-content-center align-items-center flex-shrink-0"
                style={{ width: "40px", height: "40px" }}
              >
                <i
                  className={`bi bi-person-bounding-box ${isClassFull ? "text-danger" : "text-success"} fs-5`}
                ></i>
              </div>
              <div>
                <span
                  className="d-block small text-muted fw-bold mb-0"
                  style={{
                    fontSize: "0.65rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Capacity
                </span>
                <span
                  className={`badge ${isClassFull ? "bg-danger text-danger border-danger" : "bg-success text-success border-success"} bg-opacity-10 border border-opacity-25 mt-1 px-2 py-1`}
                >
                  {currentEnrolledCount} / {classCapacity} Enrolled
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONTROLS CARD */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white overflow-hidden">
        <div className="card-body p-3">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 pb-1">
            <div className="d-flex align-items-center flex-shrink-0 text-muted small fw-medium">
              Show
              <select
                className="form-select form-select-sm mx-2 toolbar-input rounded-3"
                style={{ width: "70px" }}
                value={entriesPerPage}
                onChange={(e) => setEntriesPerPage(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              entries
            </div>
            <div className="input-group" style={{ width: "300px" }}>
              <span className="input-group-text bg-white border-end-0 text-muted ps-3 rounded-start-3">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-1 toolbar-input py-2 rounded-end-3"
                placeholder="Search Name, Email, or LRN..."
                value={searchEnrolled}
                onChange={(e) => setSearchEnrolled(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
        <div className="table-responsive custom-scrollbar">
          <table
            className="table table-summer align-middle mb-0"
            style={{ minWidth: "1000px" }}
          >
            <thead style={{ backgroundColor: "#F5ECD5" }}>
              <tr>
                <th className="ps-4" style={{ width: "60px" }}>
                  #
                </th>
                <th>STUDENT DETAILS</th>
                <th>LRN</th>
                <th>STRAND</th>
                <th>GENDER</th>
                <th className="text-center pe-4">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length > 0 ? (
                currentData.map((student, index) => (
                  <tr key={student.id}>
                    <td className="ps-4 fw-bold text-muted">
                      {startIndex + index + 1}
                    </td>
                    <td>
                      <div className="d-flex align-items-center py-1">
                        <div
                          className="rounded-circle text-white d-flex justify-content-center align-items-center fw-bold me-3 shadow-sm flex-shrink-0"
                          style={{
                            width: "40px",
                            height: "40px",
                            backgroundColor: "var(--secondary-color)",
                          }}
                        >
                          {student.first_name.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                          <span
                            className="fw-bold text-dark text-truncate d-block"
                            style={{ maxWidth: "180px" }}
                          >
                            {student.first_name} {student.last_name}
                          </span>
                          <p
                            className="mb-0 text-muted text-truncate"
                            style={{ fontSize: "0.80rem", maxWidth: "200px" }}
                          >
                            {student.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className="d-block fw-bold font-monospace text-dark tracking-wide"
                        style={{ fontSize: "0.90rem" }}
                      >
                        {student.lrn || "N/A"}
                      </span>
                    </td>
                    <td>
                      <span
                        className="badge border text-dark text-uppercase rounded-3 px-2 py-1"
                        style={{ backgroundColor: "var(--accent-color)" }}
                      >
                        {student.strand?.name || "N/A"}
                      </span>
                    </td>
                    <td className="text-muted small text-capitalize fw-bold">
                      {student.gender}
                    </td>
                    <td className="text-center pe-4">
                      <button
                        onClick={() => openGradesModal(student)}
                        className="btn btn-sm btn-light border-0 shadow-sm me-2 rounded-circle"
                        style={{ width: "35px", height: "35px" }}
                        title="Manage Grades"
                      >
                        <i
                          className="bi bi-journal-check"
                          style={{ color: "var(--primary-color)" }}
                        ></i>
                      </button>
                      <button
                        onClick={() => triggerRemoveStudent(student)}
                        className="btn btn-sm btn-light border-0 shadow-sm rounded-circle"
                        style={{ width: "35px", height: "35px" }}
                        title="Remove Student"
                      >
                        <i className="bi bi-trash-fill text-danger"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    {students.length === 0 ? (
                      <>
                        <i className="bi bi-inbox fs-1 d-block mb-2 opacity-50"></i>
                        No students enrolled yet.
                      </>
                    ) : (
                      <>
                        <i className="bi bi-search fs-1 d-block mb-2 opacity-50"></i>
                        No matching records found.
                      </>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filteredEnrolled.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-2 mb-4 px-1">
          <span className="text-muted small">
            Showing {startIndex + 1} to{" "}
            {Math.min(startIndex + entriesPerPage, filteredEnrolled.length)} of{" "}
            {filteredEnrolled.length} entries
          </span>
          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link page-link-summer"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                >
                  Previous
                </button>
              </li>
              {[...Array(totalPages)].map((_, i) => (
                <li
                  key={i}
                  className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                >
                  <button
                    className="page-link page-link-summer"
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                </li>
              ))}
              <li
                className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
              >
                <button
                  className="page-link page-link-summer"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      <AdvisoryDetailsModals
        searchAvailable={searchAvailable}
        setSearchAvailable={setSearchAvailable}
        filteredAvailable={filteredAvailable}
        selectedStudentIds={selectedStudentIds}
        toggleStudentSelection={toggleStudentSelection}
        confirmAddStudents={confirmAddStudents}
        executeAddStudents={executeAddStudents}
        studentToRemove={studentToRemove}
        executeRemoveStudent={executeRemoveStudent}
        activeStudent={activeStudent}
        isEditingGrade={isEditingGrade}
        setIsEditingGrade={setIsEditingGrade}
        handleGradeSubmit={handleGradeSubmit}
        executeSaveGrade={executeSaveGrade}
        subjects={subjects}
        studentGrades={studentGrades}
        gradeForm={gradeForm}
        setGradeForm={setGradeForm}
        viewingFeedback={viewingFeedback}
        setViewingFeedback={setViewingFeedback}
        remainingCapacity={remainingCapacity}
      />
    </>
  );
};

export default TeacherAdvisoryDetails;

import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import axios from "axios";
import { sileo } from "sileo";
import { Offcanvas, Modal } from "bootstrap";
import GlobalSpinner from "../../../components/Shared/GlobalSpinner";
import StudentViewDrawer from "./StudentViewDrawer";

const darkToast = {
  fill: "#242424",
  styles: { title: "sileo-toast-title", description: "sileo-toast-desc" },
};

const TabPeople = () => {
  const { classroom } = useOutletContext();
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading...");

  // FILTERS & SEARCH
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGender, setFilterGender] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // PAGINATION STATES
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [actionType, setActionType] = useState(""); // 'approve', 'decline', 'remove'

  useEffect(() => {
    if (classroom) fetchStudents();
  }, [classroom]);

  // RESET PAGE TO 1 PAG MAY GINAGALAW NA FILTER O ENTRIES PER PAGE
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterGender, filterStatus, entriesPerPage]);

  const fetchStudents = async () => {
    setIsLoading(true);
    setLoadingText("Fetching students...");
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/classrooms/${classroom.id}/students`,
      );
      setStudents(res.data);
      setSelectedIds([]); // Reset selection
    } catch (error) {
      console.error("Error fetching students", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openViewDrawer = (student) => {
    setSelectedStudent(student);
    const bsOffcanvas = new Offcanvas(
      document.getElementById("studentViewDrawer"),
    );
    bsOffcanvas.show();
  };

  const confirmAction = (action) => {
    setActionType(action);
    const modal = new Modal(document.getElementById("actionConfirmModal"));
    modal.show();
  };

  const executeAction = async () => {
    setIsLoading(true);
    setLoadingText("Processing request...");
    try {
      if (actionType === "approve") {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/classrooms/${classroom.id}/students/approve`,
          { student_ids: selectedIds },
        );
        sileo.success({
          title: "Enrolled",
          description: "Students successfully approved.",
          ...darkToast,
        });
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/classrooms/${classroom.id}/students/remove`,
          { student_ids: selectedIds },
        );
        sileo.success({
          title: "Success",
          description: `Selected students ${actionType === "decline" ? "declined" : "removed"}.`,
          ...darkToast,
        });
      }
      fetchStudents();
    } catch (error) {
      sileo.error({
        title: "Failed",
        description: "Action could not be completed.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // LOGIC PARA SA FILTERS
  const filteredStudents = students.filter((s) => {
    const matchesSearch = `${s.first_name} ${s.last_name} ${s.email} ${s.lrn}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesGender = filterGender === "all" || s.gender === filterGender;
    const matchesStatus =
      filterStatus === "all" || s.pivot.status === filterStatus;
    return matchesSearch && matchesGender && matchesStatus;
  });

  // LOGIC PARA SA PAGINATION
  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentItems = filteredStudents.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredStudents.length / entriesPerPage);

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(currentItems.map((s) => s.id));
    else setSelectedIds([]);
  };

  // CHECKERS PARA SA BUTTONS (Disabled kung walang tamang selected)
  const hasPendingSelected = selectedIds.some(
    (id) => students.find((s) => s.id === id)?.pivot?.status === "pending",
  );
  const hasApprovedSelected = selectedIds.some(
    (id) => students.find((s) => s.id === id)?.pivot?.status === "approved",
  );

  return (
    <>
      <GlobalSpinner isLoading={isLoading} text={loadingText} />

      <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white overflow-hidden">
        <div className="card-body p-3">
          <div className="d-flex flex-nowrap align-items-center gap-3 overflow-x-auto custom-scrollbar pb-1">
            {/* ENTRIES PER PAGE DROPDOWN */}
            <div className="d-flex align-items-center flex-shrink-0 text-muted small">
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
                <option value={100}>100</option>
              </select>
              entries
            </div>

            <div
              className="input-group flex-grow-1"
              style={{ minWidth: "200px" }}
            >
              <span className="input-group-text bg-white border-end-0 text-muted ps-3 rounded-start-3">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-1 toolbar-input py-2 rounded-end-3"
                placeholder="Search Name, Email, or LRN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="input-group" style={{ minWidth: "150px" }}>
              <span className="input-group-text bg-white border-end-0 text-muted rounded-start-3">
                <i className="bi bi-gender-ambiguous"></i>
              </span>
              <select
                className="form-select border-start-0 ps-2 toolbar-input py-2 rounded-end-3"
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
              >
                <option value="all">All Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className="input-group" style={{ minWidth: "150px" }}>
              <span className="input-group-text bg-white border-end-0 text-muted rounded-start-3">
                <i className="bi bi-funnel"></i>
              </span>
              <select
                className="form-select border-start-0 ps-2 toolbar-input py-2 rounded-end-3"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="approved">Enrolled</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            {/* ACTION BUTTONS */}
            <div className="d-flex gap-2 flex-shrink-0">
              <button
                className="btn btn-success text-dark  d-flex align-items-center justify-content-center gap-2 py-2 px-3 rounded-3 shadow-sm"
                disabled={!hasPendingSelected}
                onClick={() => confirmAction("approve")}
              >
                <i className="bi bi-person-check-fill"></i> Enroll
              </button>

              <button
                className="btn btn-warning text-dark d-flex align-items-center justify-content-center gap-2 py-2 px-3 rounded-3 shadow-sm"
                disabled={!hasPendingSelected}
                onClick={() => confirmAction("decline")}
              >
                <i className="bi bi-person-x-fill"></i> Decline
              </button>

              <button
                className="btn btn-danger d-flex align-items-center justify-content-center gap-2 py-2 px-3 rounded-3 shadow-sm"
                disabled={!hasApprovedSelected}
                onClick={() => confirmAction("remove")}
              >
                <i className="bi bi-trash3-fill"></i> Remove
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
        <div className="table-responsive custom-scrollbar">
          <table
            className="table table-hover align-middle mb-0"
            style={{ minWidth: "1000px" }}
          >
            <thead className="bg-light">
              <tr>
                <th className="ps-4 py-3" style={{ width: "50px" }}>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    onChange={handleSelectAll}
                    checked={
                      selectedIds.length === currentItems.length &&
                      currentItems.length > 0
                    }
                  />
                </th>
                <th
                  className="text-muted small fw-bold text-uppercase py-3"
                  style={{ width: "60px" }}
                >
                  #
                </th>
                <th className="text-muted small fw-bold text-uppercase py-3">
                  Student Details
                </th>
                <th className="text-muted small fw-bold text-uppercase py-3">
                  LRN
                </th>
                <th className="text-muted small fw-bold text-uppercase py-3">
                  Strand
                </th>
                <th className="text-muted small fw-bold text-uppercase py-3">
                  Gender
                </th>
                <th className="text-muted small fw-bold text-uppercase py-3">
                  Status
                </th>
                <th className="text-muted small fw-bold text-uppercase text-center pe-4 py-3">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((student, index) => (
                <tr
                  key={student.id}
                  className={
                    selectedIds.includes(student.id) ? "table-active-row" : ""
                  }
                >
                  <td className="ps-4 py-2">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={selectedIds.includes(student.id)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSelectedIds((prev) =>
                          checked
                            ? [...prev, student.id]
                            : prev.filter((id) => id !== student.id),
                        );
                      }}
                    />
                  </td>
                  <td className="fw-medium text-dark py-2">
                    {indexOfFirstItem + index + 1}
                  </td>

                  <td className="py-2">
                    <div className="d-flex align-items-center">
                      <div
                        className="rounded-circle text-white d-flex justify-content-center align-items-center fw-bold me-3 shadow-sm flex-shrink-0"
                        style={{
                          width: "40px",
                          height: "40px",
                          backgroundColor: "var(--primary-color)",
                        }}
                      >
                        {student.first_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <span
                          className="fw-bold text-dark d-block text-truncate"
                          style={{ maxWidth: "200px" }}
                        >
                          {student.first_name} {student.last_name}
                        </span>
                        <span
                          className="text-muted small d-block text-truncate"
                          style={{ fontSize: "0.75rem", maxWidth: "200px" }}
                        >
                          {student.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-2">
                    <span
                      className="fw-bold font-monospace tracking-wide text-dark"
                      style={{ fontSize: "0.90rem" }}
                    >
                      {student.lrn || "N/A"}
                    </span>
                  </td>

                  {/* HINIWALAY NA ANG STRAND AT GENDER COLUMN */}
                  <td className="py-2">
                    <span
                      className="badge bg-light text-dark border px-2 py-1 fw-medium shadow-sm text-wrap text-start"
                      style={{ maxWidth: "150px" }}
                    >
                      {student.strand?.name || "N/A"}
                    </span>
                  </td>

                  <td className="py-2">
                    <span className="text-muted small fw-bold">
                      {student.gender || "N/A"}
                    </span>
                  </td>

                  <td className="py-2">
                    {student.pivot.status === "approved" ? (
                      <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-3 py-2 fw-medium">
                        <i className="bi bi-check-circle-fill me-1"></i>{" "}
                        Enrolled
                      </span>
                    ) : (
                      <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 rounded-pill px-3 py-2 fw-medium">
                        <i className="bi bi-hourglass-split me-1 text-warning"></i>{" "}
                        Pending
                      </span>
                    )}
                  </td>

                  <td className="text-center pe-4 py-2">
                    <button
                      onClick={() => openViewDrawer(student)}
                      className="btn btn-sm btn-light border shadow-sm rounded-circle d-inline-flex justify-content-center align-items-center"
                      style={{ width: "35px", height: "35px" }}
                      title="View Profile"
                    >
                      <i
                        className="bi bi-eye-fill"
                        style={{
                          color: "var(--primary-color)",
                          fontSize: "0.9rem",
                        }}
                      ></i>
                    </button>
                  </td>
                </tr>
              ))}

              {currentItems.length === 0 && !isLoading && (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    <i className="bi bi-people fs-1 d-block mb-2 opacity-50"></i>
                    <span className="fw-medium">No students found.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION FOOTER */}
      {filteredStudents.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-2 mb-4">
          <p className="text-muted small mb-0">
            Showing {indexOfFirstItem + 1} to{" "}
            {Math.min(indexOfLastItem, filteredStudents.length)} of{" "}
            {filteredStudents.length} entries
          </p>
          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link text-dark"
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
                    className="page-link"
                    style={
                      currentPage === i + 1
                        ? {
                            backgroundColor: "var(--primary-color)",
                            borderColor: "var(--primary-color)",
                            color: "white",
                          }
                        : { color: "var(--primary-color)" }
                    }
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
                  className="page-link text-dark"
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

      <StudentViewDrawer student={selectedStudent} />

      {/* CONFIRMATION MODAL */}
      <div
        className="modal fade"
        id="actionConfirmModal"
        tabIndex="-1"
        aria-hidden="true"
        data-bs-backdrop="static"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="modal-body text-center p-4">
              <div
                className={`rounded-circle d-flex justify-content-center align-items-center mx-auto mb-3 ${actionType === "approve" ? "bg-success" : "bg-danger"} bg-opacity-10`}
                style={{ width: "80px", height: "80px" }}
              >
                <i
                  className={`bi ${actionType === "approve" ? "bi-person-check-fill text-success" : actionType === "decline" ? "bi-person-x-fill text-warning" : "bi-trash3-fill text-danger"}`}
                  style={{ fontSize: "2.5rem" }}
                ></i>
              </div>
              <h4 className="fw-bold text-dark mt-3 text-capitalize">
                {actionType} Students
              </h4>
              <p className="text-muted mb-4">
                Are you sure you want to {actionType} the{" "}
                <b>{selectedIds.length} selected student(s)</b>?
              </p>
              <div className="d-flex justify-content-center gap-2">
                <button
                  type="button"
                  className="btn btn-light px-4 fw-medium shadow-sm rounded-3 border"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={`btn ${actionType === "approve" ? "btn-campusloop" : "btn-danger"} px-4 fw-medium shadow-sm rounded-3`}
                  data-bs-dismiss="modal"
                  onClick={executeAction}
                >
                  Yes, Proceed
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TabPeople;

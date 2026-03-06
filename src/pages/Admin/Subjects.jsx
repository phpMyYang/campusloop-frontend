import React, { useState, useEffect } from "react";
import axios from "axios";
import { sileo } from "sileo";
import GlobalSpinner from "../../components/Shared/GlobalSpinner";
import SubjectFormModal from "./SubjectFormModal";
import { Modal } from "bootstrap";

const darkToast = {
  fill: "#242424",
  styles: { title: "sileo-toast-title", description: "sileo-toast-desc" },
};

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [strandsList, setStrandsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading...");

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStrand, setFilterStrand] = useState("all");
  const [filterGrade, setFilterGrade] = useState("all");
  const [filterSemester, setFilterSemester] = useState("all");

  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  // Modal & Form States
  const [modalMode, setModalMode] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    strand_id: "",
    grade_level: "",
    semester: "",
  });

  useEffect(() => {
    fetchStrands();
    fetchSubjects();
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset page kapag nag-filter
  }, [searchQuery, filterStrand, filterGrade, filterSemester, entriesPerPage]);

  const fetchStrands = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/strands`,
      );
      setStrandsList(response.data);
    } catch (error) {
      console.error("Failed to load strands", error);
    }
  };

  const fetchSubjects = async () => {
    setIsLoading(true);
    setLoadingText("Fetching subjects...");
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/subjects`,
      );
      setSubjects(response.data);
    } catch (error) {
      sileo.error({
        title: "Error",
        description: "Failed to fetch subjects.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // CONFIRM UPDATE MUNA BAGO FORM
  const handleConfirmUpdateClick = (subject) => {
    setSelectedSubject(subject);
    const modalElement = document.getElementById("updateConfirmModal");
    const modal = Modal.getInstance(modalElement) || new Modal(modalElement);
    modal.show();
  };

  // KAPAG YES SA CONFIRMATION, LALABAS ANG FORM
  const proceedToUpdateForm = () => {
    setTimeout(() => {
      document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";

      if (selectedSubject) {
        setModalMode("update");
        setFormData({
          code: selectedSubject.code,
          description: selectedSubject.description,
          strand_id: selectedSubject.strand_id,
          grade_level: selectedSubject.grade_level,
          semester: selectedSubject.semester,
        });
        const formModalElement = document.getElementById("subjectFormModal");
        const formModal =
          Modal.getInstance(formModalElement) || new Modal(formModalElement);
        formModal.show();
      }
    }, 400);
  };

  const openFormModalForCreate = () => {
    setModalMode("create");
    setSelectedSubject(null);
    setFormData({
      code: "",
      description: "",
      strand_id: "",
      grade_level: "",
      semester: "",
    });
    const modalElement = document.getElementById("subjectFormModal");
    const modal = Modal.getInstance(modalElement) || new Modal(modalElement);
    modal.show();
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const modalElement = document.getElementById("subjectFormModal");
    const modal = Modal.getInstance(modalElement);
    if (modal) modal.hide();

    setTimeout(() => executeSubmit(), 400);
  };

  const executeSubmit = async () => {
    document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
    document.body.classList.remove("modal-open");
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";

    setIsLoading(true);
    setLoadingText(
      modalMode === "create" ? "Creating Subject..." : "Saving Changes...",
    );

    try {
      if (modalMode === "create") {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/subjects`,
          formData,
        );
        sileo.success({
          title: "Success",
          description: "New subject added successfully.",
          ...darkToast,
        });
      } else {
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/subjects/${selectedSubject.id}`,
          formData,
        );
        sileo.success({
          title: "Updated",
          description: "Subject information updated.",
          ...darkToast,
        });
      }
      fetchSubjects();
      setSelectedIds([]); // Clear selection incase they edited something that is selected
    } catch (error) {
      sileo.error({
        title: "Failed",
        description:
          error.response?.data?.message || "Please check your inputs.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = (subject = null) => {
    setSelectedSubject(subject); // If null, it means bulk delete
    const modal = new Modal(document.getElementById("deleteConfirmModal"));
    modal.show();
  };

  const executeDelete = () => {
    setTimeout(async () => {
      document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";

      setIsLoading(true);
      setLoadingText(
        selectedSubject ? "Deleting Subject..." : "Deleting Selection...",
      );

      try {
        if (selectedSubject) {
          await axios.delete(
            `${import.meta.env.VITE_API_BASE_URL}/subjects/${selectedSubject.id}`,
          );
        } else {
          await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/subjects/bulk-delete`,
            { ids: selectedIds },
          );
          setSelectedIds([]);
        }
        sileo.success({
          title: "Deleted",
          description: "Moved to recycle bin.",
          ...darkToast,
        });
        fetchSubjects();
      } catch (error) {
        sileo.error({
          title: "Failed",
          description: "Could not delete.",
          ...darkToast,
        });
      } finally {
        setIsLoading(false);
      }
    }, 400);
  };

  // FILTERING LOGIC
  const filteredSubjects = subjects.filter((s) => {
    const matchesSearch =
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStrand =
      filterStrand === "all" || s.strand_id === filterStrand;
    const matchesGrade = filterGrade === "all" || s.grade_level === filterGrade;
    const matchesSemester =
      filterSemester === "all" || s.semester === filterSemester;

    return matchesSearch && matchesStrand && matchesGrade && matchesSemester;
  });

  // PAGINATION LOGIC
  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentItems = filteredSubjects.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredSubjects.length / entriesPerPage);

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(currentItems.map((s) => s.id));
    else setSelectedIds([]);
  };

  return (
    <>
      <GlobalSpinner isLoading={isLoading} text={loadingText} />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3
            className="fw-bold mb-1"
            style={{ color: "var(--primary-color)" }}
          >
            Subject Management
          </h3>
          <p className="text-muted small mb-0">
            Manage and assign subjects to specific strands and semesters.
          </p>
        </div>
        <button
          onClick={openFormModalForCreate}
          className="btn btn-campusloop shadow-sm px-4 rounded-3 d-flex align-items-center gap-2"
        >
          <i className="bi bi-plus-lg fs-5"></i> New Subject
        </button>
      </div>

      {/* FILTER TOOLBAR */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white overflow-hidden">
        <div className="card-body p-3">
          <div className="d-flex flex-nowrap align-items-center gap-3 overflow-x-auto custom-scrollbar pb-1">
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
              style={{ minWidth: "220px" }}
            >
              <span className="input-group-text bg-white border-end-0 text-muted ps-3 rounded-start-3">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-1 toolbar-input py-2 rounded-end-3"
                placeholder="Search Subject Code or Description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="input-group" style={{ minWidth: "160px" }}>
              <span className="input-group-text bg-white border-end-0 text-muted rounded-start-3">
                <i className="bi bi-journal-text"></i>
              </span>
              <select
                className="form-select border-start-0 ps-2 toolbar-input py-2 rounded-end-3"
                value={filterStrand}
                onChange={(e) => setFilterStrand(e.target.value)}
              >
                <option value="all">All Strands</option>
                {strandsList.map((strand) => (
                  <option key={strand.id} value={strand.id}>
                    {strand.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group" style={{ minWidth: "140px" }}>
              <span className="input-group-text bg-white border-end-0 text-muted rounded-start-3">
                <i className="bi bi-bar-chart-steps"></i>
              </span>
              <select
                className="form-select border-start-0 ps-2 toolbar-input py-2 rounded-end-3"
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value)}
              >
                <option value="all">All Grades</option>
                <option value="11">Grade 11</option>
                <option value="12">Grade 12</option>
              </select>
            </div>

            <div className="input-group" style={{ minWidth: "150px" }}>
              <span className="input-group-text bg-white border-end-0 text-muted rounded-start-3">
                <i className="bi bi-clock-history"></i>
              </span>
              <select
                className="form-select border-start-0 ps-2 toolbar-input py-2 rounded-end-3"
                value={filterSemester}
                onChange={(e) => setFilterSemester(e.target.value)}
              >
                <option value="all">All Semesters</option>
                <option value="1st">1st Semester</option>
                <option value="2nd">2nd Semester</option>
              </select>
            </div>

            <button
              className="btn btn-danger d-flex align-items-center justify-content-center gap-2 py-2 px-4 flex-shrink-0 rounded-3 shadow-sm"
              disabled={selectedIds.length === 0}
              onClick={() => confirmDelete(null)}
            >
              <i className="bi bi-trash3-fill"></i> Delete{" "}
              {selectedIds.length > 0 && `(${selectedIds.length})`}
            </button>
          </div>
        </div>
      </div>

      {/* DATATABLE */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
        <div className="table-responsive custom-scrollbar">
          <table
            className="table table-summer align-middle mb-0"
            style={{ minWidth: "900px" }}
          >
            <thead>
              <tr>
                <th className="ps-4" style={{ width: "50px" }}>
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
                <th style={{ width: "60px" }}>#</th>
                <th>Subject Code</th>
                <th>Description</th>
                <th>Strand</th>
                <th>Grade Level / Semester</th>
                <th className="text-center pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((subject, index) => (
                <tr key={subject.id}>
                  <td className="ps-4">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={selectedIds.includes(subject.id)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSelectedIds((prev) =>
                          checked
                            ? [...prev, subject.id]
                            : prev.filter((id) => id !== subject.id),
                        );
                      }}
                    />
                  </td>
                  <td className="fw-bold text-muted">
                    {indexOfFirstItem + index + 1}
                  </td>
                  <td>
                    <span className="badge bg-light text-dark border px-2 py-1 fs-6 shadow-sm">
                      {subject.code}
                    </span>
                  </td>
                  <td>
                    <span
                      className="fw-bold text-dark text-truncate d-inline-block"
                      style={{ maxWidth: "250px" }}
                    >
                      {subject.description}
                    </span>
                  </td>
                  <td>
                    <span
                      className="badge rounded-pill text-dark px-3 py-2"
                      style={{ backgroundColor: "var(--accent-color)" }}
                    >
                      {subject.strand?.name || "N/A"}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <span className="fw-bold text-muted small">
                        <i
                          className="bi bi-mortarboard-fill me-1"
                          style={{ color: "var(--primary-color)" }}
                        ></i>{" "}
                        Grade {subject.grade_level}
                      </span>
                      <div className="vr"></div>
                      <span className="fw-bold text-muted small">
                        <i className="bi bi-clock me-1 text-secondary"></i>{" "}
                        {subject.semester} Sem
                      </span>
                    </div>
                  </td>
                  <td className="text-center pe-4">
                    <button
                      onClick={() => handleConfirmUpdateClick(subject)}
                      className="btn btn-sm btn-light border-0 shadow-sm me-2 rounded-circle"
                      style={{ width: "35px", height: "35px" }}
                      title="Edit Subject"
                    >
                      <i
                        className="bi bi-pencil-fill"
                        style={{ color: "var(--primary-color)" }}
                      ></i>
                    </button>
                    <button
                      onClick={() => confirmDelete(subject)}
                      className="btn btn-sm btn-light border-0 shadow-sm rounded-circle"
                      style={{ width: "35px", height: "35px" }}
                      title="Delete Subject"
                    >
                      <i className="bi bi-trash-fill text-danger"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {currentItems.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    <i className="bi bi-inbox fs-1 d-block mb-2 opacity-50"></i>{" "}
                    No subjects found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION CONTROLS */}
      {filteredSubjects.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-2 mb-4">
          <p className="text-muted small mb-0">
            Showing {indexOfFirstItem + 1} to{" "}
            {Math.min(indexOfLastItem, filteredSubjects.length)} of{" "}
            {filteredSubjects.length} entries
          </p>
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

      <SubjectFormModal
        modalMode={modalMode}
        formData={formData}
        handleInputChange={handleInputChange}
        handleFormSubmit={handleFormSubmit}
        strandsList={strandsList}
      />

      {/* UPDATE CONFIRMATION MODAL */}
      <div
        className="modal fade"
        id="updateConfirmModal"
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
                  className="bi bi-pencil-square"
                  style={{ fontSize: "2.5rem", color: "var(--primary-color)" }}
                ></i>
              </div>
            </div>
            <div className="modal-body text-center p-4">
              <h4 className="fw-bold text-dark">Edit Subject Details</h4>
              <p className="text-muted mb-0">
                You are about to edit the information for{" "}
                <b>{selectedSubject?.code}</b>. Do you want to proceed to the
                update form?
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
                className="btn btn-campusloop px-4 fw-medium shadow-sm rounded-3"
                data-bs-dismiss="modal"
                onClick={proceedToUpdateForm}
              >
                Yes, Proceed
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL (Single & Bulk) [cite: 245] */}
      <div
        className="modal fade"
        id="deleteConfirmModal"
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
              <h4 className="fw-bold text-dark">Confirm Deletion</h4>
              <p className="text-muted mb-0">
                Are you sure you want to move{" "}
                {selectedSubject ? (
                  <b>{selectedSubject.code}</b>
                ) : (
                  <b>{selectedIds.length} selected subjects</b>
                )}{" "}
                to the Recycle Bin? This action can be undone later.
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
                className="btn btn-danger px-4 fw-medium shadow-sm rounded-3"
                data-bs-dismiss="modal"
                onClick={executeDelete}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Subjects;

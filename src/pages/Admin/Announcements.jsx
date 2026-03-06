import React, { useState, useEffect } from "react";
import axios from "axios";
import { sileo } from "sileo";
import GlobalSpinner from "../../components/Shared/GlobalSpinner";
import AnnouncementFormModal from "./AnnouncementFormModal";
import { Modal } from "bootstrap";

const darkToast = {
  fill: "#242424",
  styles: { title: "sileo-toast-title", description: "sileo-toast-desc" },
};

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading...");

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [sortDate, setSortDate] = useState("newest");
  const [filterAttachment, setFilterAttachment] = useState("all");

  // Selection state for Bulk Delete
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  // Modal & Form States
  const [modalMode, setModalMode] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    link: "",
  });

  // States for dynamic file UI
  const [includeLink, setIncludeLink] = useState(false);
  const [includeFiles, setIncludeFiles] = useState(false);
  const [newFiles, setNewFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [deletedFileIds, setDeletedFileIds] = useState([]);

  useEffect(() => {
    fetchAnnouncements();
  }, []);
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortDate, filterAttachment, entriesPerPage]);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    setLoadingText("Fetching announcements...");
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/announcements`,
      );
      setAnnouncements(response.data);
    } catch (error) {
      sileo.error({
        title: "Error",
        description: "Failed to load records.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // ================== MODAL FLOW LOGIC ==================

  const resetFormStates = () => {
    setFormData({ title: "", content: "", link: "" });
    setNewFiles([]);
    setExistingFiles([]);
    setDeletedFileIds([]);
    setIncludeLink(false);
    setIncludeFiles(false);
  };

  // ACTION: View
  const openViewModal = (item) => {
    resetFormStates();
    setModalMode("view");
    setSelectedItem(item);
    setFormData({
      title: item.title,
      content: item.content,
      link: item.link || "",
    });
    setIncludeLink(!!item.link);
    if (item.files && item.files.length > 0) {
      setIncludeFiles(true);
      setExistingFiles(item.files);
    }
    const modal = new Modal(document.getElementById("announcementFormModal"));
    modal.show();
  };

  // ACTION: Create
  const openCreateModal = () => {
    resetFormStates();
    setModalMode("create");
    setSelectedItem(null);
    const modal = new Modal(document.getElementById("announcementFormModal"));
    modal.show();
  };

  // ACTION: Update (Trigger Pre-Confirm)
  const promptUpdateConfirm = (item) => {
    setSelectedItem(item);
    const modal = new Modal(document.getElementById("updatePreConfirmModal"));
    modal.show();
  };

  // Yes to Update -> Opens Form
  const proceedToUpdateForm = () => {
    setTimeout(() => {
      document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
      resetFormStates();
      setModalMode("update");
      setFormData({
        title: selectedItem.title,
        content: selectedItem.content,
        link: selectedItem.link || "",
      });

      setIncludeLink(!!selectedItem.link);
      if (selectedItem.files && selectedItem.files.length > 0) {
        setIncludeFiles(true);
        setExistingFiles(selectedItem.files);
      }

      const formModal = new Modal(
        document.getElementById("announcementFormModal"),
      );
      formModal.show();
    }, 400);
  };

  // Triggered inside Form -> Opens Save/Submit Confirm Modal
  const triggerSaveConfirmation = () => {
    // Form Validation logic
    if (!formData.title || !formData.content) {
      sileo.error({
        title: "Incomplete",
        description: "Title and Content are required.",
        ...darkToast,
      });
      return;
    }
    if (includeLink && !formData.link) {
      sileo.error({
        title: "Incomplete",
        description: "Please provide a valid URL.",
        ...darkToast,
      });
      return;
    }

    const formModal = Modal.getInstance(
      document.getElementById("announcementFormModal"),
    );
    if (formModal) formModal.hide();

    setTimeout(() => {
      document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
      const confirmModalId =
        modalMode === "create" ? "createConfirmModal" : "saveConfirmModal";
      const confirmModal = new Modal(document.getElementById(confirmModalId));
      confirmModal.show();
    }, 400);
  };

  // FINAL EXECUTION API CALL
  const executeSubmit = async () => {
    document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
    document.body.classList.remove("modal-open");
    document.body.style.overflow = "";

    setIsLoading(true);
    setLoadingText(modalMode === "create" ? "Posting..." : "Saving Changes...");

    const data = new FormData();
    data.append("title", formData.title);
    data.append("content", formData.content);

    // Auto-remove logic: Kung in-uncheck sa UI ang link/file, wag ipasa o i-delete sa backend
    if (includeLink && formData.link) data.append("link", formData.link);
    else data.append("link", ""); // Send empty to tell backend to nullify

    if (includeFiles) {
      newFiles.forEach((file) => data.append("files[]", file));
      deletedFileIds.forEach((id) => data.append("deleted_file_ids[]", id));
    } else {
      // Kung inuncheck yung files checkbox, mark all existing as deleted
      existingFiles.forEach((f) => data.append("deleted_file_ids[]", f.id));
    }

    try {
      if (modalMode === "create") {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/announcements`,
          data,
          { headers: { "Content-Type": "multipart/form-data" } },
        );
        sileo.success({
          title: "Posted",
          description: "Announcement is now live.",
          ...darkToast,
        });
      } else {
        data.append("_method", "PUT"); // Required by Laravel for file uploads on update
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/announcements/${selectedItem.id}`,
          data,
          { headers: { "Content-Type": "multipart/form-data" } },
        );
        sileo.success({
          title: "Updated",
          description: "Changes have been saved.",
          ...darkToast,
        });
      }
      fetchAnnouncements();
      setSelectedIds([]);
    } catch (error) {
      sileo.error({
        title: "Failed",
        description: error.response?.data?.message || "Check inputs.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ================== DELETE LOGIC ==================

  const confirmDelete = (item = null) => {
    setSelectedItem(item); // If null, bulk delete
    const modal = new Modal(document.getElementById("deleteConfirmModal"));
    modal.show();
  };

  const executeDelete = () => {
    setTimeout(async () => {
      document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
      setIsLoading(true);
      setLoadingText(
        selectedItem ? "Moving to Recycle Bin..." : "Deleting Selection...",
      );
      try {
        if (selectedItem) {
          await axios.delete(
            `${import.meta.env.VITE_API_BASE_URL}/announcements/${selectedItem.id}`,
          );
        } else {
          await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/announcements/bulk-delete`,
            { ids: selectedIds },
          );
          setSelectedIds([]);
        }
        sileo.success({
          title: "Deleted",
          description: "Moved to recycle bin.",
          ...darkToast,
        });
        fetchAnnouncements();
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

  const formatDateTime = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  // ================== FILTER, SORT & SELECTION ==================

  let processedData = announcements.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.content.toLowerCase().includes(searchQuery.toLowerCase());
    let matchesAttachment = true;
    if (filterAttachment === "files")
      matchesAttachment = a.files && a.files.length > 0;
    if (filterAttachment === "links") matchesAttachment = !!a.link;
    if (filterAttachment === "both")
      matchesAttachment = a.files && a.files.length > 0 && !!a.link;
    if (filterAttachment === "none")
      matchesAttachment = (!a.files || a.files.length === 0) && !a.link;
    return matchesSearch && matchesAttachment;
  });

  processedData.sort((a, b) => {
    if (sortDate === "newest")
      return new Date(b.created_at) - new Date(a.created_at);
    if (sortDate === "oldest")
      return new Date(a.created_at) - new Date(b.created_at);
    return 0;
  });

  const totalPages = Math.ceil(processedData.length / entriesPerPage);
  const currentItems = processedData.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage,
  );

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(currentItems.map((a) => a.id));
    else setSelectedIds([]);
  };
  const handleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
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
            Announcement Management
          </h3>
          <p className="text-muted small mb-0">
            Create and manage global announcements for students and teachers.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn btn-campusloop shadow-sm px-4 rounded-3 d-flex align-items-center gap-2"
        >
          <i className="bi bi-megaphone-fill fs-5"></i> New Announcement
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
              style={{ minWidth: "200px" }}
            >
              <span className="input-group-text bg-white border-end-0 text-muted ps-3 rounded-start-3">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-1 toolbar-input py-2 rounded-end-3"
                placeholder="Search Announcements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="input-group" style={{ minWidth: "150px" }}>
              <span className="input-group-text bg-white border-end-0 text-muted rounded-start-3">
                <i className="bi bi-calendar-event"></i>
              </span>
              <select
                className="form-select border-start-0 ps-2 toolbar-input py-2 rounded-end-3"
                value={sortDate}
                onChange={(e) => setSortDate(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

            <div className="input-group" style={{ minWidth: "160px" }}>
              <span className="input-group-text bg-white border-end-0 text-muted rounded-start-3">
                <i className="bi bi-paperclip"></i>
              </span>
              <select
                className="form-select border-start-0 ps-2 toolbar-input py-2 rounded-end-3"
                value={filterAttachment}
                onChange={(e) => setFilterAttachment(e.target.value)}
              >
                <option value="all">All Attachments</option>
                <option value="files">With Files</option>
                <option value="links">With Links</option>
                <option value="both">Files & Links</option>
                <option value="none">Text Only</option>
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
            style={{ minWidth: "1000px" }}
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
                <th style={{ width: "250px" }}>Title</th>
                <th>Content Preview</th>
                <th>Attachments</th>
                <th>Status</th>
                <th>Created At</th>
                <th className="text-center pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item, index) => (
                <tr key={item.id}>
                  <td className="ps-4">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => handleSelect(item.id)}
                    />
                  </td>
                  <td className="fw-bold text-muted">
                    {(currentPage - 1) * entriesPerPage + index + 1}
                  </td>
                  <td>
                    <span
                      className="fw-bold text-dark text-wrap d-inline-block"
                      style={{ maxWidth: "230px" }}
                    >
                      {item.title}
                    </span>
                  </td>
                  <td>
                    <span
                      className="text-muted d-inline-block text-truncate"
                      style={{ maxWidth: "250px", fontSize: "0.85rem" }}
                    >
                      {item.content}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex flex-wrap gap-2">
                      {item.link && (
                        <span className="badge bg-primary bg-opacity-10 text-primary border rounded-pill">
                          <i className="bi bi-link-45deg"></i> Link
                        </span>
                      )}
                      {item.files && item.files.length > 0 && (
                        <span className="badge bg-secondary bg-opacity-10 text-secondary border rounded-pill">
                          <i className="bi bi-file-earmark-fill"></i>{" "}
                          {item.files.length} Files
                        </span>
                      )}
                      {!item.link &&
                        (!item.files || item.files.length === 0) && (
                          <span className="text-muted small">None</span>
                        )}
                    </div>
                  </td>
                  <td>
                    <span className="badge bg-success text-white rounded-pill px-3 py-2 shadow-sm">
                      {item.status}
                    </span>
                  </td>
                  <td className="text-muted small fw-medium">
                    {formatDateTime(item.created_at)}
                  </td>
                  <td className="text-center pe-4">
                    <button
                      onClick={() => openViewModal(item)}
                      className="btn btn-sm btn-light border-0 shadow-sm me-2 rounded-circle"
                      style={{ width: "35px", height: "35px" }}
                      title="View"
                    >
                      <i
                        className="bi bi-eye-fill"
                        style={{ color: "var(--primary-color)" }}
                      ></i>
                    </button>
                    <button
                      onClick={() => promptUpdateConfirm(item)}
                      className="btn btn-sm btn-light border-0 shadow-sm me-2 rounded-circle"
                      style={{ width: "35px", height: "35px" }}
                      title="Update"
                    >
                      <i className="bi bi-pencil-fill text-dark"></i>
                    </button>
                    <button
                      onClick={() => confirmDelete(item)}
                      className="btn btn-sm btn-light border-0 shadow-sm rounded-circle"
                      style={{ width: "35px", height: "35px" }}
                      title="Delete"
                    >
                      <i className="bi bi-trash-fill text-danger"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {currentItems.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    <i className="bi bi-megaphone fs-1 d-block mb-2 opacity-50"></i>{" "}
                    No announcements found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {processedData.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-2 mb-4">
          <p className="text-muted small mb-0">
            Showing {(currentPage - 1) * entriesPerPage + 1} to{" "}
            {Math.min(currentPage * entriesPerPage, processedData.length)} of{" "}
            {processedData.length} entries
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

      {/* FORM MODAL COMPONENT */}
      <AnnouncementFormModal
        modalMode={modalMode}
        formData={formData}
        handleInputChange={handleInputChange}
        includeLink={includeLink}
        setIncludeLink={setIncludeLink}
        includeFiles={includeFiles}
        setIncludeFiles={setIncludeFiles}
        newFiles={newFiles}
        setNewFiles={setNewFiles}
        existingFiles={existingFiles}
        setExistingFiles={setExistingFiles}
        setDeletedFileIds={setDeletedFileIds}
        triggerSaveConfirmation={triggerSaveConfirmation}
      />

      {/* CREATE CONFIRMATION */}
      <div
        className="modal fade"
        id="createConfirmModal"
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
                  className="bi bi-send-check-fill"
                  style={{ fontSize: "2.5rem", color: "var(--primary-color)" }}
                ></i>
              </div>
            </div>
            <div className="modal-body text-center p-4">
              <h4 className="fw-bold text-dark">Post Announcement</h4>
              <p className="text-muted mb-0">
                Are you sure you want to publish this to the global feed?
              </p>
            </div>
            <div className="modal-footer border-0 d-flex justify-content-center pb-4 pt-0 gap-2">
              <button
                type="button"
                className="btn btn-light px-4 fw-medium shadow-sm rounded-3 border"
                data-bs-dismiss="modal"
                onClick={() => {
                  const m = new Modal(
                    document.getElementById("announcementFormModal"),
                  );
                  m.show();
                }}
              >
                Go Back
              </button>
              <button
                type="button"
                className="btn btn-campusloop px-4 fw-medium shadow-sm rounded-3"
                data-bs-dismiss="modal"
                onClick={executeSubmit}
              >
                Yes, Publish
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* UPDATE PRE-CONFIRMATION */}
      <div
        className="modal fade"
        id="updatePreConfirmModal"
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
              <h4 className="fw-bold text-dark">Edit Announcement</h4>
              <p className="text-muted mb-0">
                Proceed to edit <b>{selectedItem?.title}</b>?
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

      {/* SAVE UPDATES CONFIRMATION */}
      <div
        className="modal fade"
        id="saveConfirmModal"
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
                  className="bi bi-cloud-arrow-up-fill"
                  style={{ fontSize: "2.5rem", color: "var(--primary-color)" }}
                ></i>
              </div>
            </div>
            <div className="modal-body text-center p-4">
              <h4 className="fw-bold text-dark">Save Changes</h4>
              <p className="text-muted mb-0">
                Apply these updates to the global feed?
              </p>
            </div>
            <div className="modal-footer border-0 d-flex justify-content-center pb-4 pt-0 gap-2">
              <button
                type="button"
                className="btn btn-light px-4 fw-medium shadow-sm rounded-3 border"
                data-bs-dismiss="modal"
                onClick={() => {
                  const m = new Modal(
                    document.getElementById("announcementFormModal"),
                  );
                  m.show();
                }}
              >
                Go Back
              </button>
              <button
                type="button"
                className="btn btn-campusloop px-4 fw-medium shadow-sm rounded-3"
                data-bs-dismiss="modal"
                onClick={executeSubmit}
              >
                Yes, Update
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DELETE CONFIRMATION */}
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
                {selectedItem ? (
                  <b>"{selectedItem.title}"</b>
                ) : (
                  <b>{selectedIds.length} selected announcements</b>
                )}{" "}
                to the Recycle Bin?
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

export default Announcements;

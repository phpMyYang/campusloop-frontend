import React, { useState, useEffect } from "react";
import axios from "axios";
import { sileo } from "sileo";
import { Modal } from "bootstrap";
import GlobalSpinner from "../../components/Shared/GlobalSpinner";
import ELibraryModal from "./ELibraryModal";

const darkToast = {
  fill: "#242424",
  styles: { title: "sileo-toast-title", description: "sileo-toast-desc" },
};

const TeacherELibrary = () => {
  const [libraries, setLibraries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Loading E-Library...");
  const [searchQuery, setSearchQuery] = useState("");

  const [modalMode, setModalMode] = useState("create");
  const [selectedLib, setSelectedLib] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // Bagong state para sa Open Content Modal
  const [viewingItem, setViewingItem] = useState(null);

  const currentUser = JSON.parse(
    localStorage.getItem("campusloop_user") ||
      sessionStorage.getItem("campusloop_user") ||
      "{}",
  );

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    files: [],
  });

  const [existingFiles, setExistingFiles] = useState([]);
  const [deletedFileIds, setDeletedFileIds] = useState([]);

  useEffect(() => {
    fetchLibraries();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".elibrary-card-dropdown")) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchLibraries = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/e-libraries`,
      );
      setLibraries(res.data);
    } catch (error) {
      console.error("Error fetching libraries", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter((file) => {
      if (file.type !== "application/pdf") {
        sileo.error({
          title: "Invalid Format",
          description: `${file.name} is not a PDF.`,
          ...darkToast,
        });
        return false;
      }
      if (file.size > 15 * 1024 * 1024) {
        sileo.error({
          title: "File too large",
          description: `${file.name} exceeds 15MB limit.`,
          ...darkToast,
        });
        return false;
      }
      return true;
    });

    setFormData((prev) => ({
      ...prev,
      files: [...prev.files, ...validFiles],
    }));

    if (e.target) e.target.value = null;
  };

  const removeFile = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleConfirmUpdateClick = (item) => {
    setOpenDropdownId(null);
    setSelectedLib(item);
    const modal = new Modal(document.getElementById("editConfirmModal"));
    modal.show();
  };

  const proceedToUpdateForm = () => {
    const modalElement = document.getElementById("editConfirmModal");
    const modal = Modal.getInstance(modalElement);
    if (modal) modal.hide();

    setTimeout(() => {
      openFormModal("update", selectedLib);
    }, 400);
  };

  const openFormModal = (mode, item = null) => {
    setModalMode(mode);
    setOpenDropdownId(null);
    if (item) {
      setSelectedLib(item);
      setFormData({
        title: item.title,
        description: item.description,
        files: [],
      });
      setExistingFiles(item.files || []);
      setDeletedFileIds([]);
    } else {
      setSelectedLib(null);
      setFormData({ title: "", description: "", files: [] });
      setExistingFiles([]);
      setDeletedFileIds([]);
    }
    const modal = new Modal(document.getElementById("elibraryModal"));
    modal.show();
  };

  const handleInitialSubmit = (e) => {
    e.preventDefault();

    if (modalMode === "create" && formData.files.length === 0) {
      return sileo.error({
        title: "Missing File",
        description: "Please attach at least one PDF file.",
        ...darkToast,
      });
    }
    if (
      modalMode === "update" &&
      formData.files.length === 0 &&
      existingFiles.length === 0
    ) {
      return sileo.error({
        title: "Missing File",
        description: "A resource must contain at least one file.",
        ...darkToast,
      });
    }

    if (document.activeElement) document.activeElement.blur();

    const modalElement = document.getElementById("elibraryModal");
    const modal = Modal.getInstance(modalElement);
    if (modal) modal.hide();

    if (modalMode === "update") {
      setTimeout(() => {
        const confirmModal = new Modal(
          document.getElementById("updateConfirmModal"),
        );
        confirmModal.show();
      }, 400);
    } else {
      executeSubmit();
    }
  };

  const executeSubmit = async () => {
    setIsLoading(true);
    setLoadingText(
      modalMode === "create" ? "Uploading..." : "Saving Changes...",
    );

    const payload = new FormData();
    payload.append("title", formData.title);
    payload.append("description", formData.description);

    if (formData.files.length > 0) {
      formData.files.forEach((file) => {
        payload.append("files[]", file);
      });
    }

    if (modalMode === "update") {
      payload.append("_method", "PUT");
      if (deletedFileIds.length > 0) {
        deletedFileIds.forEach((id) => {
          payload.append("deleted_file_ids[]", id);
        });
      }
    }

    try {
      if (modalMode === "create") {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/e-libraries`,
          payload,
          { headers: { "Content-Type": "multipart/form-data" } },
        );
        sileo.success({
          title: "Uploaded",
          description: "Pending Admin Approval.",
          ...darkToast,
        });
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/e-libraries/${selectedLib.id}`,
          payload,
          { headers: { "Content-Type": "multipart/form-data" } },
        );
        sileo.success({
          title: "Updated",
          description: "Changes saved.",
          ...darkToast,
        });
      }
      fetchLibraries();
    } catch (error) {
      sileo.error({
        title: "Upload Failed",
        description: "Could not process request.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = (item) => {
    setOpenDropdownId(null);
    setSelectedLib(item);
    const modal = new Modal(document.getElementById("deleteConfirmModal"));
    modal.show();
  };

  const executeDelete = async () => {
    setIsLoading(true);
    setLoadingText("Moving to Recycle Bin...");
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/e-libraries/${selectedLib.id}`,
      );
      sileo.success({
        title: "Deleted",
        description: "Item removed.",
        ...darkToast,
      });
      fetchLibraries();
    } catch (error) {
      sileo.error({
        title: "Failed",
        description: "Could not delete.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openFiles = (item) => {
    setViewingItem(item);
    const modal = new Modal(document.getElementById("viewFilesModal"));
    modal.show();
  };

  const handleViewDocument = (filePath) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL.replace("/api", "");
    window.open(`${baseUrl}/storage/${filePath}`, "_blank");
  };

  const formatBytes = (bytes) => {
    if (bytes === 0 || !bytes) return "Unknown Size";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const filteredLibraries = libraries.filter((lib) =>
    `${lib.title} ${lib.description}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  return (
    <>
      <GlobalSpinner isLoading={isLoading} text={loadingText} />

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start mb-3 gap-3">
        <div className="flex-grow-1">
          <h3
            className="fw-bold mb-1"
            style={{ color: "var(--primary-color)" }}
          >
            E-Library <i className="bi bi-book-half"></i>
          </h3>
          <p className="text-muted small mb-0">
            Browse approved resources or upload materials to the global library.
          </p>
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={() => openFormModal("create")}
            className="btn btn-campusloop shadow-sm px-4 py-2 rounded-3 d-flex align-items-center gap-2 w-100 justify-content-center"
          >
            <i className="bi bi-cloud-arrow-up-fill fs-5"></i> Upload Resource
          </button>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-12 col-md-6 col-xl-4">
          <div className="input-group shadow-sm rounded-3 overflow-hidden">
            <span className="input-group-text bg-white border-end-0 text-muted px-3">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0 ps-0 toolbar-input"
              placeholder="Search Title or Description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {filteredLibraries.length > 0 ? (
          filteredLibraries.map((item) => (
            <div className="col-md-6 col-xl-4" key={item.id}>
              <div className="card h-100 border-0 shadow-sm rounded-4 hover-shadow transition-all bg-white premium-hover-card">
                <div
                  className="p-4 position-relative d-flex flex-column justify-content-end"
                  style={{
                    backgroundColor: "var(--primary-color)",
                    minHeight: "110px",
                    borderTopLeftRadius: "1rem",
                    borderTopRightRadius: "1rem",
                  }}
                >
                  {item.creator_id === currentUser.id && (
                    <div
                      className="dropdown elibrary-card-dropdown position-absolute top-0 end-0 mt-3 me-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="btn btn-sm text-white rounded-circle shadow-none d-flex justify-content-center align-items-center p-0"
                        type="button"
                        onClick={() =>
                          setOpenDropdownId(
                            openDropdownId === item.id ? null : item.id,
                          )
                        }
                        style={{
                          backgroundColor: "rgba(0,0,0,0.2)",
                          width: "32px",
                          height: "32px",
                        }}
                      >
                        <i className="bi bi-three-dots-vertical"></i>
                      </button>
                      <ul
                        className={`dropdown-menu dropdown-menu-end shadow-sm border-0 rounded-3 mt-1 ${openDropdownId === item.id ? "show" : ""}`}
                        style={{
                          position: "absolute",
                          top: "100%",
                          right: "0",
                          zIndex: 1050,
                        }}
                      >
                        <li>
                          <button
                            className="dropdown-item py-2 fw-medium text-dark"
                            onClick={() => handleConfirmUpdateClick(item)}
                          >
                            <i
                              className="bi bi-pencil-square me-2"
                              style={{ color: "var(--primary-color)" }}
                            ></i>{" "}
                            Update
                          </button>
                        </li>
                        <li>
                          <hr className="dropdown-divider" />
                        </li>
                        <li>
                          <button
                            className="dropdown-item py-2 fw-bold text-danger"
                            onClick={() => confirmDelete(item)}
                          >
                            <i className="bi bi-trash3-fill me-2"></i> Delete
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}

                  <div className="pe-4 position-relative z-1">
                    <h4
                      className="fw-bold text-white mb-1 text-truncate"
                      title={item.title}
                    >
                      {item.title}
                    </h4>
                    <span className="badge bg-white text-dark bg-opacity-25 px-2 py-1 fw-semibold shadow-sm">
                      <i className="bi bi-book-half me-1"></i> Library Resource
                    </span>
                  </div>
                </div>

                <div className="card-body p-4 d-flex flex-column position-relative">
                  <div
                    className="position-absolute shadow-sm rounded-circle d-flex justify-content-center align-items-center fw-bold text-white"
                    style={{
                      width: "45px",
                      height: "45px",
                      top: "-22px",
                      right: "24px",
                      backgroundColor: "var(--secondary-color)",
                      border: "3px solid white",
                      fontSize: "1.2rem",
                    }}
                  >
                    <i className="bi bi-journal-text"></i>
                  </div>

                  <div className="mb-3 mt-1 flex-grow-1">
                    <span
                      className="d-block text-muted mb-1 text-uppercase"
                      style={{
                        fontSize: "0.65rem",
                        letterSpacing: "1px",
                        fontWeight: "700",
                      }}
                    >
                      Description
                    </span>
                    <p
                      className="text-dark small fw-medium mb-0 text-clamp-3"
                      style={{ lineHeight: "1.6" }}
                    >
                      {item.description}
                    </p>
                  </div>

                  {item.status === "declined" &&
                    item.creator_id === currentUser.id &&
                    item.admin_feedback && (
                      <div className="alert alert-danger py-2 px-3 mb-3 rounded-3 border-0 bg-opacity-10 shadow-none">
                        <span className="d-block fw-bold small text-danger mb-1">
                          <i className="bi bi-x-circle-fill me-1"></i> Admin
                          Feedback
                        </span>
                        <span
                          className="d-block text-danger small"
                          style={{ fontSize: "0.75rem" }}
                        >
                          {item.admin_feedback}
                        </span>
                      </div>
                    )}

                  <div className="bg-light rounded-4 p-3 mb-3 border border-light-subtle d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center overflow-hidden pe-2">
                      <div
                        className="rounded-circle text-white shadow-sm d-flex justify-content-center align-items-center me-2 flex-shrink-0 fw-bold"
                        style={{
                          width: "35px",
                          height: "35px",
                          backgroundColor: "var(--primary-color)",
                        }}
                      >
                        {item.creator?.first_name?.charAt(0)}
                      </div>
                      <div className="overflow-hidden">
                        <span
                          className="d-block text-muted fw-bold mb-0 text-uppercase"
                          style={{
                            fontSize: "0.60rem",
                            letterSpacing: "0.5px",
                          }}
                        >
                          Uploaded By
                        </span>
                        <span
                          className="d-block text-dark fw-bold text-truncate"
                          style={{ fontSize: "0.80rem" }}
                        >
                          {item.creator
                            ? `${item.creator.first_name} ${item.creator.last_name}`
                            : "Unknown"}
                        </span>
                      </div>
                    </div>
                    <div className="text-end flex-shrink-0">
                      {item.creator_id === currentUser.id ? (
                        <>
                          {item.status === "pending" && (
                            <span
                              className="badge bg-warning bg-opacity-25 text-dark border border-warning px-2 py-1 shadow-sm"
                              style={{ fontSize: "0.65rem" }}
                            >
                              Pending
                            </span>
                          )}
                          {item.status === "approved" && (
                            <span
                              className="badge bg-success bg-opacity-10 text-success border border-success px-2 py-1 shadow-sm"
                              style={{ fontSize: "0.65rem" }}
                            >
                              Approved
                            </span>
                          )}
                          {item.status === "declined" && (
                            <span
                              className="badge bg-danger bg-opacity-10 text-danger border border-danger px-2 py-1 shadow-sm"
                              style={{ fontSize: "0.65rem" }}
                            >
                              Declined
                            </span>
                          )}
                        </>
                      ) : (
                        <span
                          className="badge bg-success bg-opacity-10 text-success border border-success px-2 py-1 shadow-sm"
                          style={{ fontSize: "0.65rem" }}
                        >
                          Public
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-auto d-flex gap-2">
                    <button
                      className="btn btn-campusloop fw-bold w-100 rounded-3 shadow-sm"
                      onClick={() => openFiles(item)}
                    >
                      <i className="bi bi-folder2-open me-2"></i> Open Content
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="p-5 bg-white rounded-4 shadow-sm text-center border">
              <i
                className="bi bi-inbox text-muted d-block mb-3"
                style={{ fontSize: "3rem", opacity: 0.5 }}
              ></i>
              <h5 className="fw-bold text-dark">No records found.</h5>
              <p className="text-muted small mb-0">
                {searchQuery
                  ? "No matching resources for your search."
                  : "Click the 'Upload Resource' button to get started."}
              </p>
            </div>
          </div>
        )}
      </div>

      <ELibraryModal
        modalMode={modalMode}
        formData={formData}
        handleInputChange={handleInputChange}
        handleFileChange={handleFileChange}
        removeFile={removeFile}
        existingFiles={existingFiles}
        setExistingFiles={setExistingFiles}
        setDeletedFileIds={setDeletedFileIds}
        handleInitialSubmit={handleInitialSubmit}
      />

      {/* VIEW FILES MODAL */}
      <div
        className="modal fade"
        id="viewFilesModal"
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
                <i className="bi bi-folder2-open me-2"></i> Resource Content
              </h5>
              <button
                type="button"
                className="btn-close shadow-none"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body p-4 p-md-5 bg-white">
              {viewingItem && (
                <>
                  <div className="mb-4">
                    <span className="badge bg-light text-dark border shadow-sm mb-2 px-2 py-1">
                      <i className="bi bi-info-circle-fill text-primary me-1"></i>{" "}
                      Resource Info
                    </span>
                    <h4 className="fw-bolder text-dark mb-2">
                      {viewingItem.title}
                    </h4>
                    <p
                      className="text-muted small mb-0"
                      style={{ lineHeight: "1.6" }}
                    >
                      {viewingItem.description}
                    </p>
                  </div>

                  <span
                    className="small text-muted fw-bold mb-3 d-block text-uppercase"
                    style={{ letterSpacing: "1px" }}
                  >
                    <i className="bi bi-paperclip me-1"></i> Attached Documents
                  </span>

                  <div
                    className="d-flex flex-column gap-3 custom-scrollbar"
                    style={{
                      maxHeight: "300px",
                      overflowY: "auto",
                      paddingRight: "5px",
                    }}
                  >
                    {viewingItem.files && viewingItem.files.length > 0 ? (
                      viewingItem.files.map((file) => (
                        <div
                          key={file.id}
                          className="d-flex align-items-center justify-content-between p-3 bg-white border rounded-4 shadow-sm transition-all hover-shadow"
                        >
                          <div className="d-flex align-items-center overflow-hidden pe-3">
                            <div
                              className="rounded-3 d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                              style={{
                                width: "45px",
                                height: "45px",
                                backgroundColor: "#f8d7da",
                                color: "#dc3545",
                              }}
                            >
                              <i className="bi bi-file-earmark-pdf-fill fs-4"></i>
                            </div>
                            <div className="overflow-hidden">
                              <p
                                className="mb-0 fw-bold text-dark text-truncate"
                                style={{ fontSize: "0.95rem" }}
                                title={file.name}
                              >
                                {file.name}
                              </p>
                              <p
                                className="mb-0 text-muted"
                                style={{ fontSize: "0.75rem" }}
                              >
                                {formatBytes(file.file_size)}
                              </p>
                            </div>
                          </div>
                          <button
                            className="btn btn-campusloop btn-sm fw-bold px-3 rounded-3 shadow-sm text-nowrap flex-shrink-0"
                            onClick={() => handleViewDocument(file.path)}
                          >
                            View{" "}
                            <i
                              className="bi bi-box-arrow-up-right ms-1"
                              style={{ fontSize: "0.7rem" }}
                            ></i>
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center p-4 bg-light rounded-4 border border-dashed">
                        <i className="bi bi-folder-x fs-1 text-muted opacity-50 mb-2 d-block"></i>
                        <p className="text-muted mb-0 small fw-medium">
                          No files attached to this resource.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer border-top bg-light p-3">
              <button
                type="button"
                className="btn btn-light border px-4 fw-medium rounded-3"
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PRE-EDIT CONFIRMATION MODAL */}
      <div
        className="modal fade"
        id="editConfirmModal"
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
              <h4 className="fw-bold text-dark mt-2">Edit Resource</h4>
              <p className="text-muted mb-0">
                You are about to edit the files and details of{" "}
                <b>{selectedLib?.title}</b>. Do you want to proceed to the
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
                onClick={proceedToUpdateForm}
              >
                Yes, Proceed
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SAVE CHANGES CONFIRMATION MODAL */}
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
                  className="bi bi-check-circle-fill"
                  style={{ fontSize: "2.5rem", color: "var(--primary-color)" }}
                ></i>
              </div>
            </div>
            <div className="modal-body text-center p-4">
              <h4 className="fw-bold text-dark mt-2">Save Changes</h4>
              <p className="text-muted mb-0">
                Are you sure you want to save the new updates for this resource?
              </p>
            </div>
            <div className="modal-footer border-0 d-flex justify-content-center pb-4 pt-0 gap-2">
              <button
                type="button"
                className="btn btn-light px-4 fw-medium shadow-sm rounded-3 border"
                data-bs-dismiss="modal"
                onClick={() =>
                  new Modal(document.getElementById("elibraryModal")).show()
                }
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-campusloop px-4 fw-medium shadow-sm rounded-3"
                data-bs-dismiss="modal"
                onClick={executeSubmit}
              >
                Yes, Save
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
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
              <h4 className="fw-bold text-dark mt-2">Delete File</h4>
              <p className="text-muted mb-0">
                Are you sure you want to remove <b>{selectedLib?.title}</b>?
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

export default TeacherELibrary;

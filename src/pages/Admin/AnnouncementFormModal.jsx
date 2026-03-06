import React, { useRef } from "react";
import { sileo } from "sileo";

const AnnouncementFormModal = ({
  modalMode,
  formData,
  handleInputChange,
  includeLink,
  setIncludeLink,
  includeFiles,
  setIncludeFiles,
  newFiles,
  setNewFiles,
  existingFiles,
  setExistingFiles,
  setDeletedFileIds,
  triggerSaveConfirmation,
}) => {
  const fileInputRef = useRef(null);

  // File size formatter (e.g., 978 kb, 2.1 MB)
  const formatSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Icon generator base sa extension
  const getFileIcon = (extension) => {
    const ext = extension?.toLowerCase();
    if (["pdf"].includes(ext))
      return {
        icon: "bi-file-earmark-pdf-fill",
        color: "#dc3545",
        bg: "#f8d7da",
      }; // Red
    if (["doc", "docx"].includes(ext))
      return {
        icon: "bi-file-earmark-word-fill",
        color: "#0d6efd",
        bg: "#cfe2ff",
      }; // Blue
    if (["xls", "xlsx"].includes(ext))
      return {
        icon: "bi-file-earmark-excel-fill",
        color: "#198754",
        bg: "#d1e7dd",
      }; // Green
    if (["png", "jpg", "jpeg", "gif"].includes(ext))
      return {
        icon: "bi-file-earmark-image-fill",
        color: "#6f42c1",
        bg: "#e0cffc",
      }; // Purple
    if (["mp4", "avi", "mov"].includes(ext))
      return {
        icon: "bi-file-earmark-play-fill",
        color: "#fd7e14",
        bg: "#ffe5d0",
      }; // Orange
    return { icon: "bi-file-earmark-fill", color: "#6c757d", bg: "#e2e3e5" }; // Default Gray
  };

  // Drag and Drop Handlers
  const onDragOver = (e) => e.preventDefault();
  const onDrop = (e) => {
    e.preventDefault();
    if (modalMode === "view") return;
    validateAndAddFiles(Array.from(e.dataTransfer.files));
  };
  const onFileInputChange = (e) => {
    validateAndAddFiles(Array.from(e.target.files));
  };

  // Validation Logic (Max 20MB, Allowed Types)
  const validateAndAddFiles = (files) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "image/png",
      "image/jpeg",
      "image/gif",
      "video/mp4",
      "video/avi",
      "video/quicktime",
    ];
    const maxSizeBytes = 20 * 1024 * 1024; // 20MB

    const validFiles = files.filter((f) => {
      if (
        !allowedTypes.includes(f.type) &&
        !f.name.match(
          /\.(pdf|doc|docx|xls|xlsx|png|jpg|jpeg|gif|mp4|avi|mov)$/i,
        )
      ) {
        sileo.error({
          title: "Invalid File",
          description: `${f.name} is not a supported file type.`,
        });
        return false;
      }
      if (f.size > maxSizeBytes) {
        sileo.error({
          title: "File too large",
          description: `${f.name} exceeds the 20MB limit.`,
        });
        return false;
      }
      return true;
    });

    setNewFiles((prev) => [...prev, ...validFiles]);
  };

  const removeNewFile = (index) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingFile = (file) => {
    setExistingFiles((prev) => prev.filter((f) => f.id !== file.id));
    setDeletedFileIds((prev) => [...prev, file.id]); // Mark for backend deletion
  };

  return (
    <div
      className="modal fade"
      id="announcementFormModal"
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
              {modalMode === "create" && (
                <>
                  <i className="bi bi-megaphone-fill me-2"></i> Create New
                  Announcement
                </>
              )}
              {modalMode === "update" && (
                <>
                  <i className="bi bi-pencil-square me-2"></i> Update
                  Announcement
                </>
              )}
              {modalMode === "view" && (
                <>
                  <i className="bi bi-eye-fill me-2"></i> View Announcement
                </>
              )}
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
                <i className="bi bi-card-heading me-1 text-muted"></i>{" "}
                Announcement Title
              </label>
              <input
                type="text"
                className="form-control bg-light toolbar-input"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                disabled={modalMode === "view"}
                required
                autoFocus
                placeholder="e.g. No Classes Tomorrow"
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold text-dark">
                <i className="bi bi-body-text me-1 text-muted"></i> Content
              </label>
              <textarea
                className="form-control bg-light toolbar-input custom-scrollbar"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                disabled={modalMode === "view"}
                required
                rows="5"
                placeholder="Enter full details here..."
              ></textarea>
            </div>

            {/* CHECKBOXES */}
            <div className="mb-4">
              <label className="form-label small fw-bold text-dark">
                <i className="bi bi-paperclip me-1 text-muted"></i> Attachment
                Options
              </label>
              <div
                className="d-flex gap-4 mb-4 p-3 rounded-3"
                style={{ backgroundColor: "var(--accent-color)" }}
              >
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="checkLink"
                    disabled={modalMode === "view"}
                    checked={includeLink}
                    onChange={(e) => setIncludeLink(e.target.checked)}
                  />
                  <label
                    className="form-check-label small fw-bold text-dark"
                    htmlFor="checkLink"
                  >
                    Include a Link
                  </label>
                </div>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="checkFiles"
                    disabled={modalMode === "view"}
                    checked={includeFiles}
                    onChange={(e) => setIncludeFiles(e.target.checked)}
                  />
                  <label
                    className="form-check-label small fw-bold text-dark"
                    htmlFor="checkFiles"
                  >
                    Attach Files
                  </label>
                </div>
              </div>
            </div>

            {/* CONDITIONAL LINK INPUT */}
            {includeLink && (
              <div className="mb-4">
                <label className="form-label small fw-bold text-dark">
                  <i className="bi bi-link-45deg me-1"></i> URL Link
                </label>
                <input
                  type="url"
                  className="form-control bg-light toolbar-input"
                  name="link"
                  value={formData.link}
                  onChange={handleInputChange}
                  disabled={modalMode === "view"}
                  required
                  placeholder="https://example.com"
                />
              </div>
            )}

            {/* CONDITIONAL FILE UPLOAD UI (Based on partner's attached image) */}
            {includeFiles && (
              <div className="mb-3">
                <label
                  className="form-label small fw-bold text-muted mb-3 text-uppercase text-center w-100"
                  style={{ letterSpacing: "1px" }}
                >
                  <i className="bi bi-file-earmark-arrow-up me-1"></i> Upload
                  Files
                </label>

                {/* Drag and Drop Zone (Hidden if View mode) */}
                {modalMode !== "view" && (
                  <div
                    className="p-5 text-center mb-4 rounded-4"
                    style={{
                      border: "2px dashed #A4B465",
                      backgroundColor: "#f8f9fc",
                      cursor: "pointer",
                      transition: "0.3s",
                    }}
                    onDragOver={onDragOver}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current.click()}
                  >
                    <i
                      className="bi bi-cloud-arrow-up-fill mb-2 d-block"
                      style={{ fontSize: "3rem", color: "#626F47" }}
                    ></i>
                    <p
                      className="text-muted mb-3"
                      style={{ fontSize: "0.75rem" }}
                    >
                      Accepted formats: PDF, DOCX, XLS, XLSX, PNG, JPG, JPEG,
                      GIF, MP4, AVI, MOV <br />
                      Max file size: 20MB
                    </p>
                    <p className="fw-medium text-muted mb-1">
                      Drag & Drop your files here
                    </p>
                    <p className="small text-muted mb-3">OR</p>
                    <button
                      type="button"
                      className="btn text-white rounded-3 px-4 shadow-sm"
                      style={{ backgroundColor: "#626F47" }}
                    >
                      Browse Files
                    </button>
                    <input
                      type="file"
                      className="d-none"
                      ref={fileInputRef}
                      multiple
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.mp4,.avi,.mov,.gif"
                      onChange={onFileInputChange}
                    />
                  </div>
                )}

                {/* Uploaded Files List */}
                {((existingFiles && existingFiles.length > 0) ||
                  newFiles.length > 0) && (
                  <div>
                    <span className="small text-muted mb-2 d-block">
                      Attached Files:
                    </span>
                    <div
                      className="d-flex flex-column gap-2 custom-scrollbar"
                      style={{ maxHeight: "250px", overflowY: "auto" }}
                    >
                      {/* EXISTING FILES (From Database) */}
                      {existingFiles.map((file) => {
                        const style = getFileIcon(file.file_extension);
                        return (
                          <div
                            key={file.id}
                            className="d-flex align-items-center justify-content-between p-3 bg-white border rounded-4 shadow-sm"
                          >
                            <div className="d-flex align-items-center">
                              <div
                                className="rounded-3 d-flex align-items-center justify-content-center me-3"
                                style={{
                                  width: "45px",
                                  height: "45px",
                                  backgroundColor: style.bg,
                                  color: style.color,
                                }}
                              >
                                <i className={`bi ${style.icon} fs-4`}></i>
                              </div>
                              <div>
                                <p
                                  className="mb-0 fw-bold text-dark text-truncate"
                                  style={{
                                    fontSize: "0.90rem",
                                    maxWidth: "300px",
                                  }}
                                >
                                  {file.name}
                                </p>
                                <p
                                  className="mb-0 text-muted"
                                  style={{ fontSize: "0.75rem" }}
                                >
                                  {formatSize(file.file_size)}
                                </p>
                              </div>
                            </div>
                            {modalMode !== "view" && (
                              <button
                                type="button"
                                className="btn btn-sm btn-light rounded-circle text-muted"
                                onClick={() => removeExistingFile(file)}
                              >
                                <i className="bi bi-x-lg"></i>
                              </button>
                            )}
                          </div>
                        );
                      })}

                      {/* NEWLY ADDED FILES */}
                      {newFiles.map((file, index) => {
                        const ext = file.name.split(".").pop();
                        const style = getFileIcon(ext);
                        return (
                          <div
                            key={index}
                            className="d-flex align-items-center justify-content-between p-3 bg-white border rounded-4 shadow-sm"
                            style={{
                              borderLeft: `4px solid ${style.color} !important`,
                            }}
                          >
                            <div className="d-flex align-items-center">
                              <div
                                className="rounded-3 d-flex align-items-center justify-content-center me-3"
                                style={{
                                  width: "45px",
                                  height: "45px",
                                  backgroundColor: style.bg,
                                  color: style.color,
                                }}
                              >
                                <i className={`bi ${style.icon} fs-4`}></i>
                              </div>
                              <div>
                                <p
                                  className="mb-0 fw-bold text-dark text-truncate"
                                  style={{
                                    fontSize: "0.90rem",
                                    maxWidth: "300px",
                                  }}
                                >
                                  {file.name}
                                </p>
                                <p
                                  className="mb-0 text-muted"
                                  style={{ fontSize: "0.75rem" }}
                                >
                                  {formatSize(file.size)}
                                </p>
                              </div>
                            </div>
                            {modalMode !== "view" && (
                              <button
                                type="button"
                                className="btn btn-sm btn-light rounded-circle text-muted"
                                onClick={() => removeNewFile(index)}
                              >
                                <i className="bi bi-x-lg"></i>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="modal-footer border-top bg-light p-3 d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-light border px-4 fw-medium rounded-3"
              data-bs-dismiss="modal"
            >
              {modalMode === "view" ? "Close" : "Cancel"}
            </button>

            {modalMode === "create" && (
              <button
                type="button"
                className="btn btn-campusloop px-4 fw-bold rounded-3"
                onClick={triggerSaveConfirmation}
              >
                Post
              </button>
            )}
            {modalMode === "update" && (
              <button
                type="button"
                className="btn btn-campusloop px-4 fw-bold rounded-3"
                onClick={triggerSaveConfirmation}
              >
                Save Changes
              </button>
            )}
            {modalMode === "view" && (
              <button
                type="button"
                className="btn btn-campusloop px-4 fw-bold rounded-3"
                data-bs-dismiss="modal"
              >
                Okay, Got it!
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementFormModal;

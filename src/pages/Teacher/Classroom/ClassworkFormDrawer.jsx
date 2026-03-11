import React, { useState, useEffect, useRef } from "react";
import { Offcanvas } from "bootstrap";
import { sileo } from "sileo";

const darkToast = {
  fill: "#242424",
  styles: { title: "sileo-toast-title", description: "sileo-toast-desc" },
};

const ClassworkFormDrawer = ({
  drawerMode,
  formData,
  handleInputChange,
  handleFileChange,
  triggerSaveConfirmation,
}) => {
  const [includeLink, setIncludeLink] = useState(false);
  const [includeFile, setIncludeFile] = useState(false);
  const [includeForm, setIncludeForm] = useState(false);

  const fileInputRef = useRef(null);

  // 25MB FILE SIZE LIMIT
  const MAX_FILE_SIZE = 25 * 1024 * 1024;

  useEffect(() => {
    if (drawerMode === "update") {
      setIncludeLink(!!formData.link);
      setIncludeFile(formData.files && formData.files.length > 0);
    } else {
      setIncludeLink(false);
      setIncludeFile(false);
      setIncludeForm(false);
    }
  }, [drawerMode, formData]);

  // HANDLING FILE UPLOADS W/ SIZE RESTRICTION
  const handleLocalFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    const validFiles = [];

    newFiles.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        sileo.error({
          title: "File too large",
          description: `${file.name} exceeds the 25MB limit.`,
          ...darkToast,
        });
      } else {
        validFiles.push(file);
      }
    });

    if (validFiles.length > 0) {
      const combinedFiles = [...(formData.files || []), ...validFiles];
      handleFileChange({ target: { name: "files", files: combinedFiles } });
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index) => {
    const updatedFiles = (formData.files || []).filter((_, i) => i !== index);
    handleFileChange({ target: { name: "files", files: updatedFiles } });
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // FILE ICONS DEPENDING ON EXTENSION
  const getFileIcon = (fileName) => {
    const ext = fileName.split(".").pop().toLowerCase();
    if (["pdf"].includes(ext))
      return {
        icon: "bi-file-earmark-pdf-fill",
        color: "#dc3545",
        bg: "#f8d7da",
      };
    if (["doc", "docx"].includes(ext))
      return {
        icon: "bi-file-earmark-word-fill",
        color: "#0d6efd",
        bg: "#cfe2ff",
      };
    if (["xls", "xlsx", "csv"].includes(ext))
      return {
        icon: "bi-file-earmark-excel-fill",
        color: "#198754",
        bg: "#d1e7dd",
      };
    if (["ppt", "pptx"].includes(ext))
      return {
        icon: "bi-file-earmark-ppt-fill",
        color: "#fd7e14",
        bg: "#ffdfc5",
      };
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext))
      return {
        icon: "bi-file-earmark-image-fill",
        color: "#20c997",
        bg: "#d1e7dd",
      };
    if (["mp4", "avi", "mov", "mkv"].includes(ext))
      return {
        icon: "bi-file-earmark-play-fill",
        color: "#6f42c1",
        bg: "#e0cffc",
      };
    if (["zip", "rar", "7z"].includes(ext))
      return {
        icon: "bi-file-earmark-zip-fill",
        color: "#6c757d",
        bg: "#e2e3e5",
      };

    return { icon: "bi-file-earmark-fill", color: "#6c757d", bg: "#e2e3e5" };
  };

  return (
    <div
      className="offcanvas offcanvas-end shadow-lg border-0"
      tabIndex="-1"
      id="classworkDrawer"
      style={{ width: "550px" }}
    >
      {/* HEADER (Same as UserDrawer) */}
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
              <i className="bi bi-journal-plus me-2 fs-4"></i> Create Classwork
            </>
          ) : (
            <>
              <i className="bi bi-pencil-square me-2 fs-4"></i> Update Classwork
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
        <form
          onSubmit={(e) => {
            e.preventDefault();
            triggerSaveConfirmation();
          }}
        >
          <div className="row g-4">
            {/* CLASSWORK DETAILS SECTION */}
            <div className="col-12">
              <h6
                className="fw-bold text-muted mb-0 border-bottom pb-2"
                style={{ fontSize: "0.85rem", letterSpacing: "1px" }}
              >
                CLASSWORK DETAILS
              </h6>
            </div>

            <div className="col-12">
              <label className="form-label small fw-bold text-dark">
                <i className="bi bi-card-heading me-1 text-muted"></i> Title
              </label>
              <input
                type="text"
                className="form-control bg-light toolbar-input"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                autoFocus
                placeholder="e.g. Chapter 1 Quiz"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-bold text-dark">
                <i className="bi bi-grid me-1 text-muted"></i> Type
              </label>
              <select
                className="form-select bg-light toolbar-input"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Type...</option>
                <option value="assignment">Assignment</option>
                <option value="activity">Activity</option>
                <option value="quiz">Quiz</option>
                <option value="exam">Exam</option>
                <option value="material">Material (No Grade)</option>
              </select>
            </div>

            {formData.type !== "material" && (
              <>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-dark">
                    <i className="bi bi-star me-1 text-muted"></i> Points
                  </label>
                  <input
                    type="number"
                    className="form-control bg-light toolbar-input"
                    name="points"
                    value={formData.points}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="e.g. 100"
                    required
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold text-dark">
                    <i className="bi bi-calendar-event me-1 text-muted"></i>{" "}
                    Deadline
                  </label>
                  <input
                    type="datetime-local"
                    className="form-control bg-light toolbar-input"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </>
            )}

            <div className="col-12">
              <label className="form-label small fw-bold text-dark">
                <i className="bi bi-body-text me-1 text-muted"></i> Instructions
                / Content
              </label>
              <textarea
                className="form-control bg-light toolbar-input custom-scrollbar"
                name="instruction"
                rows="4"
                value={formData.instruction}
                onChange={handleInputChange}
                required
                placeholder="Type your instructions or announcements here..."
              ></textarea>
            </div>

            {/* ATTACHMENTS & EXTRAS SECTION */}
            <div className="col-12 mt-4">
              <h6
                className="fw-bold text-muted mb-0 border-bottom pb-2"
                style={{ fontSize: "0.85rem", letterSpacing: "1px" }}
              >
                ATTACHMENTS & EXTRAS
              </h6>
            </div>

            <div className="col-12">
              <div
                className="d-flex flex-wrap gap-4 p-3 rounded-3 mb-4"
                style={{ backgroundColor: "var(--accent-color)" }}
              >
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="switchFiles"
                    checked={includeFile}
                    onChange={() => setIncludeFile(!includeFile)}
                    style={{ cursor: "pointer" }}
                  />
                  <label
                    className="form-check-label small fw-bold text-dark"
                    htmlFor="switchFiles"
                    style={{ cursor: "pointer" }}
                  >
                    Files
                  </label>
                </div>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="switchLink"
                    checked={includeLink}
                    onChange={() => setIncludeLink(!includeLink)}
                    style={{ cursor: "pointer" }}
                  />
                  <label
                    className="form-check-label small fw-bold text-dark"
                    htmlFor="switchLink"
                    style={{ cursor: "pointer" }}
                  >
                    Link
                  </label>
                </div>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="switchForm"
                    checked={includeForm}
                    onChange={() => setIncludeForm(!includeForm)}
                    style={{ cursor: "pointer" }}
                  />
                  <label
                    className="form-check-label small fw-bold text-dark"
                    htmlFor="switchForm"
                    style={{ cursor: "pointer" }}
                  >
                    Forms
                  </label>
                </div>
              </div>

              {/* UPLOAD FILE AREA */}
              {includeFile && (
                <div className="mb-4">
                  <div
                    className="border rounded-4 p-4 text-center mb-3 shadow-sm"
                    style={{
                      borderStyle: "dashed !important",
                      borderColor: "#A4B465 !important",
                      backgroundColor: "#f8f9fc",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onClick={() => fileInputRef.current.click()}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        "rgba(98, 111, 71, 0.05)")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f8f9fc")
                    }
                  >
                    <i
                      className="bi bi-cloud-arrow-up-fill mb-2 d-block"
                      style={{ fontSize: "3rem", color: "#626F47" }}
                    ></i>
                    <span className="fw-bold text-dark d-block">
                      Click to browse files
                    </span>
                    <span className="text-muted small">
                      No format restriction • Max 25MB per file
                    </span>
                    <input
                      type="file"
                      className="d-none"
                      ref={fileInputRef}
                      onChange={handleLocalFileChange}
                      multiple
                    />
                  </div>

                  {formData.files && formData.files.length > 0 && (
                    <div
                      className="d-flex flex-column gap-2 mt-3 custom-scrollbar"
                      style={{ maxHeight: "250px", overflowY: "auto" }}
                    >
                      <span className="small fw-bold text-muted text-uppercase mb-1">
                        Selected Files
                      </span>
                      {formData.files.map((file, idx) => {
                        const { icon, color, bg } = getFileIcon(file.name);
                        return (
                          <div
                            key={idx}
                            className="d-flex align-items-center justify-content-between p-2 rounded-3 border bg-white shadow-sm"
                            style={{
                              borderLeft: `4px solid ${color} !important`,
                            }}
                          >
                            <div className="d-flex align-items-center overflow-hidden">
                              <div
                                className="rounded-3 d-flex justify-content-center align-items-center flex-shrink-0 me-3"
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  backgroundColor: bg,
                                }}
                              >
                                <i
                                  className={`bi ${icon} fs-5`}
                                  style={{ color: color }}
                                ></i>
                              </div>
                              <div className="overflow-hidden">
                                <p
                                  className="mb-0 small fw-bold text-dark text-truncate"
                                  style={{ maxWidth: "250px" }}
                                >
                                  {file.name}
                                </p>
                                <span
                                  className="text-muted d-block"
                                  style={{ fontSize: "0.7rem" }}
                                >
                                  {formatSize(file.size)}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              className="btn btn-sm btn-light text-danger border-0 rounded-circle flex-shrink-0"
                              onClick={() => removeFile(idx)}
                              title="Remove file"
                            >
                              <i className="bi bi-x-lg"></i>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* URL LINK AREA */}
              {includeLink && (
                <div className="mb-4">
                  <label className="form-label small fw-bold text-dark">
                    <i className="bi bi-link-45deg me-1 text-muted"></i> Attach
                    URL Link
                  </label>
                  <input
                    type="url"
                    className="form-control bg-light toolbar-input"
                    name="link"
                    placeholder="https://"
                    value={formData.link}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              )}

              {/* FORM SELECTION AREA */}
              {includeForm && (
                <div className="mb-2">
                  <label className="form-label small fw-bold text-dark">
                    <i className="bi bi-ui-radios me-1 text-muted"></i> Select
                    Quiz/Exam Form
                  </label>
                  <select className="form-select bg-light toolbar-input text-dark">
                    <option value="">Select an existing form...</option>
                    <option value="mock">
                      Midterm Exam (Forms Module pending)
                    </option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="mt-5 pt-3 border-top">
            <button
              type="submit"
              className="btn btn-campusloop w-100 rounded-3 shadow-sm"
            >
              {drawerMode === "create" ? (
                <>
                  <i className="bi bi-send-check-fill me-2"></i> Post Classwork
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle-fill me-2"></i> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClassworkFormDrawer;

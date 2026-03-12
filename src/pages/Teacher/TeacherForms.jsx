import React, { useState, useEffect } from "react";
import axios from "axios";
import { sileo } from "sileo";
import { useNavigate } from "react-router-dom";
import { Modal } from "bootstrap";
import GlobalSpinner from "../../components/Shared/GlobalSpinner";
import FormSetupModal from "./FormSetupModal";

const darkToast = {
  fill: "#242424",
  styles: { title: "sileo-toast-title", description: "sileo-toast-desc" },
};

const TeacherForms = () => {
  const [forms, setForms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading forms...");
  const [searchQuery, setSearchQuery] = useState("");

  const [modalMode, setModalMode] = useState("");
  const [selectedForm, setSelectedForm] = useState(null);

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    instruction: "",
    timer: "",
    is_shuffle_questions: false,
    is_focus_mode: false,
  });

  const [openDropdownId, setOpenDropdownId] = useState(null);

  useEffect(() => {
    fetchForms();
    const closeDropdown = () => setOpenDropdownId(null);
    document.addEventListener("click", closeDropdown);
    return () => document.removeEventListener("click", closeDropdown);
  }, []);

  const fetchForms = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/forms`);
      setForms(res.data);
    } catch (error) {
      console.error("Error fetching forms", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const openFormModal = (mode, item = null) => {
    setModalMode(mode);
    if (item) {
      setSelectedForm(item);
      setFormData({
        name: item.name,
        instruction: item.instruction,
        timer: item.timer > 0 ? item.timer : "",
        is_shuffle_questions:
          item.is_shuffle_questions === 1 || item.is_shuffle_questions === true,
        is_focus_mode: item.is_focus_mode === 1 || item.is_focus_mode === true,
      });
    } else {
      setSelectedForm(null);
      setFormData({
        name: "",
        instruction: "",
        timer: "",
        is_shuffle_questions: false,
        is_focus_mode: false,
      });
    }
    const modal = new Modal(document.getElementById("formSetupModal"));
    modal.show();
  };

  const handleInitialSubmit = (e) => {
    e.preventDefault();
    if (document.activeElement) document.activeElement.blur();

    const modalElement = document.getElementById("formSetupModal");
    const modal = Modal.getInstance(modalElement);
    if (modal) modal.hide();

    if (modalMode === "update") {
      const confirmModal = new Modal(
        document.getElementById("updateConfirmModal"),
      );
      confirmModal.show();
    } else {
      executeSubmit();
    }
  };

  const executeSubmit = async () => {
    setIsLoading(true);
    setLoadingText(
      modalMode === "create"
        ? "Preparing Builder..."
        : "Saving Form Settings...",
    );

    const payload = {
      name: formData.name,
      instruction: formData.instruction,
      timer: formData.timer ? Number(formData.timer) : 0,
      is_shuffle_questions: Boolean(formData.is_shuffle_questions),
      is_focus_mode: Boolean(formData.is_focus_mode),
    };

    try {
      if (modalMode === "create") {
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/forms`,
          payload,
        );
        sileo.success({
          title: "Success",
          description: "Form created.",
          ...darkToast,
        });
        setTimeout(
          () => navigate(`/teacher/forms/${res.data.form.id}/builder`),
          500,
        );
      } else {
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/forms/${selectedForm.id}`,
          payload,
        );
        sileo.success({
          title: "Updated",
          description: "Form settings updated.",
          ...darkToast,
        });
        fetchForms();
      }
    } catch (error) {
      sileo.error({
        title: "Failed",
        description: error.response?.data?.message || "Could not save form.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDuplicate = (item) => {
    setSelectedForm(item);
    const modal = new Modal(document.getElementById("duplicateConfirmModal"));
    modal.show();
  };

  const executeDuplicate = async () => {
    setIsLoading(true);
    setLoadingText("Duplicating Form...");
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/forms/${selectedForm.id}/duplicate`,
      );
      sileo.success({
        title: "Duplicated",
        description: "A copy has been created.",
        ...darkToast,
      });
      fetchForms();
    } catch (error) {
      sileo.error({
        title: "Failed",
        description: "Could not duplicate form.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = (item) => {
    setSelectedForm(item);
    const modal = new Modal(document.getElementById("deleteConfirmModal"));
    modal.show();
  };

  const executeDelete = async () => {
    setIsLoading(true);
    setLoadingText("Moving to Recycle Bin...");
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/forms/${selectedForm.id}`,
      );
      sileo.success({
        title: "Deleted",
        description: "Form removed.",
        ...darkToast,
      });
      fetchForms();
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

  const filteredForms = forms.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <>
      <GlobalSpinner isLoading={isLoading} text={loadingText} />

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start mb-4 gap-3">
        <div>
          <h3
            className="fw-bold mb-1"
            style={{ color: "var(--primary-color)" }}
          >
            Quiz & Exam Forms <i className="bi bi-ui-radios"></i>
          </h3>
          <p className="text-muted small mb-0">
            Create and manage your assessments with advanced anti-cheat
            features.
          </p>
        </div>
        <button
          onClick={() => openFormModal("create")}
          className="btn btn-campusloop shadow-sm px-4 rounded-3 d-flex align-items-center gap-2"
        >
          <i className="bi bi-plus-lg fs-5"></i> New Form
        </button>
      </div>

      <div className="row mb-4">
        <div className="col-12 col-md-6 col-xl-4">
          <div className="input-group shadow-sm rounded-3 overflow-hidden">
            <span className="input-group-text bg-white border-end-0 text-muted px-3">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0 ps-0 toolbar-input py-2"
              placeholder="Search form name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="row g-4">
        {filteredForms.map((item) => (
          <div className="col-12 col-md-6 col-xl-4" key={item.id}>
            <div
              className="card border-0 shadow-sm rounded-4 h-100 premium-hover-card bg-white"
              style={{ borderRadius: "1rem" }}
            >
              <div
                className="p-4 position-relative d-flex flex-column justify-content-end"
                style={{
                  backgroundColor: "var(--primary-color)",
                  minHeight: "140px",
                  borderTopLeftRadius: "1rem",
                  borderTopRightRadius: "1rem",
                }}
              >
                <div
                  className="dropdown position-absolute top-0 end-0 mt-3 me-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="btn btn-sm text-white rounded-circle shadow-none d-flex justify-content-center align-items-center p-0"
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
                        className="dropdown-item py-2 fw-medium"
                        onClick={() => openFormModal("update", item)}
                      >
                        <i className="bi bi-gear-fill me-2 text-secondary"></i>{" "}
                        Form Settings
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item py-2 fw-medium"
                        onClick={() => confirmDuplicate(item)}
                      >
                        <i className="bi bi-copy me-2 text-success"></i>{" "}
                        Duplicate
                      </button>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <button
                        className="dropdown-item py-2 fw-medium text-danger"
                        onClick={() => confirmDelete(item)}
                      >
                        <i className="bi bi-trash-fill me-2"></i> Delete
                      </button>
                    </li>
                  </ul>
                </div>

                <div className="pe-4 position-relative z-1">
                  <h4
                    className="fw-bold text-white mb-1 text-truncate"
                    title={item.name}
                  >
                    {item.name}
                  </h4>
                  <span className="badge bg-white text-dark bg-opacity-25 px-2 py-1 fw-semibold shadow-sm">
                    <i className="bi bi-ui-radios me-1"></i> Quiz/Exam Form
                  </span>
                </div>
              </div>

              <div className="card-body p-4 d-flex flex-column position-relative">
                <div
                  className="position-absolute shadow-sm rounded-circle d-flex justify-content-center align-items-center text-white"
                  style={{
                    width: "55px",
                    height: "55px",
                    top: "-27px",
                    right: "24px",
                    backgroundColor: "var(--secondary-color)",
                    border: "4px solid white",
                    fontSize: "1.5rem",
                  }}
                  title="Quiz/Exam Form"
                >
                  <i className="bi bi-card-checklist"></i>
                </div>

                <div className="mb-3 mt-1">
                  <span
                    className="d-block text-muted mb-1 text-uppercase"
                    style={{
                      fontSize: "0.65rem",
                      letterSpacing: "1px",
                      fontWeight: "700",
                    }}
                  >
                    Instructions
                  </span>
                  <div
                    className="text-dark small fw-medium text-truncate"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      whiteSpace: "normal",
                    }}
                  >
                    {item.instruction || "No instructions provided."}
                  </div>
                </div>

                <div className="bg-light rounded-4 p-3 mb-4 border border-light-subtle flex-grow-1">
                  <div className="row g-0 text-center">
                    <div className="col-4 d-flex flex-column align-items-center justify-content-center">
                      <i
                        className="bi bi-hourglass-split text-warning mb-1"
                        style={{ fontSize: "1.2rem" }}
                      ></i>
                      <span
                        className="text-muted fw-bold text-uppercase mb-1"
                        style={{ fontSize: "0.6rem" }}
                      >
                        Timer
                      </span>
                      {item.timer > 0 ? (
                        <span
                          className="badge bg-warning bg-opacity-10 text-dark border border-warning border-opacity-25"
                          style={{
                            fontSize: "0.65rem",
                            padding: "0.25rem 0.4rem",
                          }}
                        >
                          {item.timer} Mins
                        </span>
                      ) : (
                        <span
                          className="badge bg-light text-muted border"
                          style={{
                            fontSize: "0.65rem",
                            padding: "0.25rem 0.4rem",
                          }}
                        >
                          None
                        </span>
                      )}
                    </div>

                    <div className="col-4 d-flex flex-column align-items-center justify-content-center border-start border-end px-1">
                      <i
                        className={`bi ${item.is_focus_mode ? "bi-eye-slash-fill text-danger" : "bi-shield-check text-success"} mb-1`}
                        style={{ fontSize: "1.2rem" }}
                      ></i>
                      <span
                        className="text-muted fw-bold text-uppercase mb-1"
                        style={{ fontSize: "0.6rem" }}
                      >
                        Security
                      </span>
                      {item.is_focus_mode ? (
                        <span
                          className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25"
                          style={{
                            fontSize: "0.65rem",
                            padding: "0.25rem 0.4rem",
                          }}
                        >
                          Focus ON
                        </span>
                      ) : (
                        <span
                          className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25"
                          style={{
                            fontSize: "0.65rem",
                            padding: "0.25rem 0.4rem",
                          }}
                        >
                          Normal
                        </span>
                      )}
                    </div>

                    <div className="col-4 d-flex flex-column align-items-center justify-content-center">
                      <i
                        className={`bi bi-shuffle ${item.is_shuffle_questions ? "text-primary" : "text-muted"} mb-1`}
                        style={{ fontSize: "1.2rem" }}
                      ></i>
                      <span
                        className="text-muted fw-bold text-uppercase mb-1"
                        style={{ fontSize: "0.6rem" }}
                      >
                        Shuffle
                      </span>
                      {item.is_shuffle_questions ? (
                        <span
                          className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25"
                          style={{
                            fontSize: "0.65rem",
                            padding: "0.25rem 0.4rem",
                          }}
                        >
                          ON
                        </span>
                      ) : (
                        <span
                          className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25"
                          style={{
                            fontSize: "0.65rem",
                            padding: "0.25rem 0.4rem",
                          }}
                        >
                          OFF
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                  <div className="d-flex flex-column">
                    <span
                      className="text-muted fw-bold text-uppercase mb-1"
                      style={{ fontSize: "0.65rem", letterSpacing: "1px" }}
                    >
                      Creator
                    </span>
                    <span
                      className="text-dark fw-bold"
                      style={{ fontSize: "0.85rem" }}
                    >
                      {item.creator
                        ? `${item.creator.first_name} ${item.creator.last_name}`
                        : "Unknown"}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate(`/teacher/forms/${item.id}`)}
                    className="btn btn-campusloop rounded-3 fw-bold px-4 shadow-sm"
                  >
                    Open <i className="bi bi-arrow-right ms-1"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredForms.length === 0 && !isLoading && (
          <div className="col-12">
            <div className="p-5 bg-white rounded-4 shadow-sm text-center border">
              <i
                className="bi bi-ui-radios text-muted d-block mb-3"
                style={{ fontSize: "3rem", opacity: 0.5 }}
              ></i>
              <h5 className="fw-bold text-dark">No records found.</h5>
              <p className="text-muted small mb-0">
                {searchQuery
                  ? "No matching forms for your search."
                  : "Click the 'New Form' button to build quizzes and exams."}
              </p>
            </div>
          </div>
        )}
      </div>

      <FormSetupModal
        modalMode={modalMode}
        formData={formData}
        handleInputChange={handleInputChange}
        handleFormSubmit={handleInitialSubmit}
      />

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
                className="rounded-circle bg-primary bg-opacity-10 d-flex justify-content-center align-items-center"
                style={{ width: "80px", height: "80px" }}
              >
                <i
                  className="bi bi-pencil-square text-primary"
                  style={{ fontSize: "2.5rem" }}
                ></i>
              </div>
            </div>
            <div className="modal-body text-center p-4">
              <h4 className="fw-bold text-dark mt-2">Save Changes</h4>
              <p className="text-muted mb-0">
                Are you sure you want to update the settings for{" "}
                <b>{selectedForm?.name}</b>?
              </p>
            </div>
            <div className="modal-footer border-0 d-flex justify-content-center pb-4 pt-0 gap-2">
              <button
                type="button"
                className="btn btn-light px-4 fw-medium shadow-sm rounded-3 border"
                data-bs-dismiss="modal"
                onClick={() => {
                  const modal = new Modal(
                    document.getElementById("formSetupModal"),
                  );
                  modal.show();
                }}
              >
                Cancel
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

      <div
        className="modal fade"
        id="duplicateConfirmModal"
        tabIndex="-1"
        aria-hidden="true"
        data-bs-backdrop="static"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="modal-header border-0 pb-0 justify-content-center mt-4">
              <div
                className="rounded-circle bg-success bg-opacity-10 d-flex justify-content-center align-items-center"
                style={{ width: "80px", height: "80px" }}
              >
                <i
                  className="bi bi-copy text-success"
                  style={{ fontSize: "2.5rem" }}
                ></i>
              </div>
            </div>
            <div className="modal-body text-center p-4">
              <h4 className="fw-bold text-dark mt-2">Duplicate Form</h4>
              <p className="text-muted mb-0">
                Are you sure you want to create a copy of{" "}
                <b>{selectedForm?.name}</b>?
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
                className="btn btn-success px-4 fw-medium shadow-sm rounded-3"
                data-bs-dismiss="modal"
                onClick={executeDuplicate}
              >
                Yes, Duplicate
              </button>
            </div>
          </div>
        </div>
      </div>

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
              <h4 className="fw-bold text-dark mt-2">Delete Form</h4>
              <p className="text-muted mb-0">
                Are you sure you want to move <b>{selectedForm?.name}</b> to the
                recycle bin?
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

export default TeacherForms;

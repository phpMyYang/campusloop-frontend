import React, { useState, useEffect } from "react";
import axios from "axios";
import { sileo } from "sileo";
import { Modal } from "bootstrap";
import { useNavigate } from "react-router-dom";
import GlobalSpinner from "../../components/Shared/GlobalSpinner";
import AdvisoryFormModal from "./AdvisoryFormModal";

const darkToast = {
  fill: "#242424",
  styles: { title: "sileo-toast-title", description: "sileo-toast-desc" },
};

const TeacherAdvisory = () => {
  const [advisories, setAdvisories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Loading Advisory Classes...");
  const [searchQuery, setSearchQuery] = useState("");

  const [modalMode, setModalMode] = useState("create");
  const [selectedItem, setSelectedItem] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    section: "",
    school_year: "",
    capacity: "",
  });

  useEffect(() => {
    fetchAdvisories();
    const closeDropdown = () => setOpenDropdownId(null);
    document.addEventListener("click", closeDropdown);
    return () => document.removeEventListener("click", closeDropdown);
  }, []);

  const fetchAdvisories = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/advisory-classes`,
      );
      setAdvisories(res.data);
    } catch (error) {
      console.error("Error fetching advisory classes", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openFormModal = () => {
    setModalMode("create");
    setOpenDropdownId(null);
    setSelectedItem(null);
    setFormData({ section: "", school_year: "", capacity: "" });
    const modal = new Modal(document.getElementById("advisoryModal"));
    modal.show();
  };

  const handleUpdateClick = (item) => {
    setOpenDropdownId(null);
    setSelectedItem(item);
    setModalMode("update");
    setFormData({
      section: item.section,
      school_year: item.school_year,
      capacity: item.capacity,
    });
    // Ipakita ang Intent Confirmation Modal muna
    const modal = new Modal(
      document.getElementById("updateIntentConfirmModal"),
    );
    modal.show();
  };

  const proceedToUpdateForm = () => {
    setTimeout(() => {
      const formModal = new Modal(document.getElementById("advisoryModal"));
      formModal.show();
    }, 400); // 400ms delay para maka-fade out ng maayos yung nakaraang modal
  };

  const handleInitialSubmit = (e) => {
    e.preventDefault();
    if (document.activeElement) document.activeElement.blur();

    const modalElement = document.getElementById("advisoryModal");
    const modal = Modal.getInstance(modalElement);
    if (modal) modal.hide();

    if (modalMode === "update") {
      // Kung UPDATE, i-save na agad (Wala nang Save Confirm Modal)
      executeSubmit();
    } else {
      // Kung CREATE, idaan muna sa Save Confirm Modal
      setTimeout(() => {
        const confirmModal = new Modal(
          document.getElementById("saveConfirmModal"),
        );
        confirmModal.show();
      }, 400);
    }
  };

  const executeSubmit = async () => {
    setIsLoading(true);
    setLoadingText(
      modalMode === "create"
        ? "Creating Advisory Class..."
        : "Saving Changes...",
    );

    try {
      if (modalMode === "create") {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/advisory-classes`,
          formData,
        );
        sileo.success({
          title: "Created",
          description: "Advisory Class added.",
          ...darkToast,
        });
      } else {
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/advisory-classes/${selectedItem.id}`,
          formData,
        );
        sileo.success({
          title: "Updated",
          description: "Changes saved.",
          ...darkToast,
        });
      }
      fetchAdvisories();
    } catch (error) {
      const errorMsg =
        error.response?.data?.errors?.school_year?.[0] ||
        error.response?.data?.message ||
        "Could not process request.";

      sileo.error({
        title: "Failed",
        description: errorMsg,
        ...darkToast,
      });

      // Ibalik agad ang modal kung nagka-error sa validation para ma-edit agad
      const modal = new Modal(document.getElementById("advisoryModal"));
      modal.show();
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = (item) => {
    setOpenDropdownId(null);
    setSelectedItem(item);
    const modal = new Modal(document.getElementById("deleteConfirmModal"));
    modal.show();
  };

  const executeDelete = async () => {
    setIsLoading(true);
    setLoadingText("Deleting Advisory Class...");
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/advisory-classes/${selectedItem.id}`,
      );
      sileo.success({
        title: "Deleted",
        description: "Class moved to Recycle Bin.",
        ...darkToast,
      });
      fetchAdvisories();
    } catch (error) {
      sileo.error({
        title: "Failed",
        description: "Could not delete class.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnterClass = (id) => {
    setIsLoading(true);
    setLoadingText("Opening Advisory Class...");
    setTimeout(() => {
      setIsLoading(false);
      navigate(`/teacher/advisory/${id}`);
    }, 1000);
  };

  const filteredAdvisories = advisories.filter((adv) =>
    `${adv.section} ${adv.school_year}`
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
            Advisory Classes <i className="bi bi-people-fill"></i>
          </h3>
          <p className="text-muted small mb-0">
            Manage your homeroom students, class records, and final grades.
          </p>
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={() => openFormModal()}
            className="btn btn-campusloop shadow-sm px-4 py-2 rounded-3 d-flex align-items-center gap-2 w-100 justify-content-center"
          >
            <i className="bi bi-plus-lg fs-5"></i> New Advisory
          </button>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="row mb-4">
        <div className="col-12 col-md-6 col-xl-4">
          <div className="input-group shadow-sm rounded-3 overflow-hidden">
            <span className="input-group-text bg-white border-end-0 text-muted px-3">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0 ps-0 toolbar-input"
              placeholder="Search Section or School Year..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {filteredAdvisories.length > 0 ? (
          filteredAdvisories.map((item) => (
            <div className="col-md-6 col-xl-4" key={item.id}>
              <div className="card h-100 border-0 shadow-sm rounded-4 hover-shadow transition-all bg-white premium-hover-card overflow-hidden">
                <div
                  className="p-4 position-relative d-flex flex-column justify-content-end"
                  style={{
                    backgroundColor: "var(--primary-color)",
                    minHeight: "110px",
                    borderTopLeftRadius: "1rem",
                    borderTopRightRadius: "1rem",
                  }}
                >
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
                          onClick={() => handleUpdateClick(item)}
                        >
                          <i
                            className="bi bi-pencil-square me-2"
                            style={{ color: "var(--primary-color)" }}
                          ></i>{" "}
                          Update
                        </button>
                      </li>
                      <li>
                        <hr className="dropdown-divider opacity-10" />
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

                  <div className="pe-4 position-relative z-1">
                    <h4
                      className="fw-bold text-white mb-1 text-truncate"
                      title={item.section}
                    >
                      {item.section}
                    </h4>
                    <span className="badge bg-white text-dark bg-opacity-25 px-2 py-1 fw-semibold shadow-sm">
                      <i className="bi bi-calendar-event me-1"></i> SY:{" "}
                      {item.school_year}
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
                    <i className="bi bi-person-video3"></i>
                  </div>

                  <div className="bg-light rounded-4 p-3 mb-4 mt-3 border border-light-subtle d-flex align-items-center justify-content-between flex-grow-1">
                    <div className="d-flex align-items-center">
                      <div
                        className="rounded-circle text-white shadow-sm d-flex justify-content-center align-items-center me-3 flex-shrink-0 fw-bold"
                        style={{
                          width: "35px",
                          height: "35px",
                          backgroundColor: "var(--primary-color)",
                        }}
                      >
                        <i className="bi bi-people-fill"></i>
                      </div>
                      <span
                        className="text-muted fw-bold mb-0 text-uppercase"
                        style={{
                          fontSize: "0.75rem",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Advisory Students
                      </span>
                    </div>
                    <span className="text-dark fw-bolder fs-6">
                      {item.students_count || 0}{" "}
                      <span className="text-muted small fw-medium">
                        / {item.capacity}
                      </span>
                    </span>
                  </div>

                  <div className="mt-auto d-flex gap-2">
                    <button
                      className="btn btn-campusloop fw-bold w-100 rounded-3 shadow-sm"
                      onClick={() => handleEnterClass(item.id)}
                    >
                      Enter Advisory Class{" "}
                      <i className="bi bi-arrow-right ms-2"></i>
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
                  ? "No matching advisory classes for your search."
                  : "Click the 'Create Advisory' button to get started."}
              </p>
            </div>
          </div>
        )}
      </div>

      <AdvisoryFormModal
        modalMode={modalMode}
        formData={formData}
        handleInputChange={handleInputChange}
        handleInitialSubmit={handleInitialSubmit}
      />

      <div
        className="modal fade"
        id="updateIntentConfirmModal"
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
              <h4 className="fw-bold text-dark mt-2">Update Advisory</h4>
              <p className="text-muted mb-0">
                Are you sure you want to update the details for{" "}
                <b>{selectedItem?.section}</b>?
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
                className="btn btn-campusloop px-4 fw-bold shadow-sm rounded-3"
                data-bs-dismiss="modal"
                onClick={proceedToUpdateForm}
              >
                Yes, Proceed
              </button>
            </div>
          </div>
        </div>
      </div>

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
                  className="bi bi-check-circle-fill"
                  style={{ fontSize: "2.5rem", color: "var(--primary-color)" }}
                ></i>
              </div>
            </div>
            <div className="modal-body text-center p-4">
              <h4 className="fw-bold text-dark">Save Changes</h4>
              <p className="text-muted mb-0">
                Are you sure you want to proceed and save this advisory class?
              </p>
            </div>
            <div className="modal-footer border-0 d-flex justify-content-center pb-4 pt-0 gap-2">
              <button
                type="button"
                className="btn btn-light px-4 fw-medium shadow-sm rounded-3 border"
                data-bs-dismiss="modal"
                onClick={() =>
                  new Modal(document.getElementById("advisoryModal")).show()
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
                Yes, Proceed
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
              <h4 className="fw-bold text-dark mt-2">Delete Advisory</h4>
              <p className="text-muted mb-0">
                Are you sure you want to remove <b>{selectedItem?.section}</b>?
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

export default TeacherAdvisory;

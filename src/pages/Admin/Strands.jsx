import React, { useState, useEffect } from "react";
import axios from "axios";
import { sileo } from "sileo";
import GlobalSpinner from "../../components/Shared/GlobalSpinner";
import StrandFormModal from "./StrandFormModal";
import { Modal } from "bootstrap";

const darkToast = {
  fill: "#242424",
  styles: { title: "sileo-toast-title", description: "sileo-toast-desc" },
};

const Strands = () => {
  const [strands, setStrands] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading...");

  const [searchQuery, setSearchQuery] = useState("");

  const [modalMode, setModalMode] = useState("");
  const [selectedStrand, setSelectedStrand] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  const [openDropdownId, setOpenDropdownId] = useState(null);

  useEffect(() => {
    fetchStrands();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".strand-card-dropdown")) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchStrands = async () => {
    setIsLoading(true);
    setLoadingText("Fetching strands...");
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/strands`,
      );
      setStrands(response.data);
    } catch (error) {
      sileo.error({
        title: "Error",
        description: "Failed to fetch strands.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // TRIGGER CONFIRMATION MODAL MUNA
  const handleConfirmUpdateClick = (strand) => {
    setOpenDropdownId(null); // Isara agad ang dropdown
    setSelectedStrand(strand);
    const modalElement = document.getElementById("updateConfirmModal");
    const modal = Modal.getInstance(modalElement) || new Modal(modalElement);
    modal.show();
  };

  // PAGKA-PROCEED, SAKA BUBUKSAN ANG UPDATE FORM
  const proceedToUpdateForm = () => {
    setTimeout(() => {
      // Safety cleanup para hindi mag-freeze ang screen
      document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";

      if (selectedStrand) {
        openFormModal("update", selectedStrand);
      }
    }, 400); // Wait sa hide animation ng confirmation modal
  };

  const openFormModal = (mode, strand = null) => {
    setOpenDropdownId(null);
    setModalMode(mode);
    if (strand) {
      setSelectedStrand(strand);
      setFormData({ name: strand.name, description: strand.description });
    } else {
      setSelectedStrand(null);
      setFormData({ name: "", description: "" });
    }
    const modalElement = document.getElementById("strandFormModal");
    const modal = Modal.getInstance(modalElement) || new Modal(modalElement);
    modal.show();
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const modalElement = document.getElementById("strandFormModal");
    const modal = Modal.getInstance(modalElement);

    if (modal) modal.hide();

    // Antayin matapos ang hide animation bago buhayin ang Spinner
    setTimeout(() => executeSubmit(), 400);
  };

  const executeSubmit = async () => {
    // Safety Cleanup ulit bago lumabas ang Global Spinner
    document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
    document.body.classList.remove("modal-open");
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";

    setIsLoading(true);
    setLoadingText(
      modalMode === "create" ? "Creating Strand..." : "Saving Changes...",
    );

    try {
      if (modalMode === "create") {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/strands`,
          formData,
        );
        sileo.success({
          title: "Success",
          description: "New strand added successfully.",
          ...darkToast,
        });
      } else {
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/strands/${selectedStrand.id}`,
          formData,
        );
        sileo.success({
          title: "Updated",
          description: "Strand information updated.",
          ...darkToast,
        });
      }
      fetchStrands();
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

  const confirmDelete = (strand) => {
    setOpenDropdownId(null);
    setSelectedStrand(strand);
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
      setLoadingText("Deleting Strand...");
      try {
        await axios.delete(
          `${import.meta.env.VITE_API_BASE_URL}/strands/${selectedStrand.id}`,
        );
        sileo.success({
          title: "Deleted",
          description: "Strand moved to recycle bin.",
          ...darkToast,
        });
        fetchStrands();
      } catch (error) {
        sileo.error({
          title: "Failed",
          description: "Could not delete strand.",
          ...darkToast,
        });
      } finally {
        setIsLoading(false);
      }
    }, 400);
  };

  const filteredStrands = strands.filter(
    (strand) =>
      strand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      strand.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <>
      <GlobalSpinner isLoading={isLoading} text={loadingText} />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3
            className="fw-bold mb-1"
            style={{ color: "var(--primary-color)" }}
          >
            Strand Management
          </h3>
          <p className="text-muted small mb-0">
            Manage all academic strands and view enrolled students.
          </p>
        </div>
        <button
          onClick={() => openFormModal("create")}
          className="btn btn-campusloop shadow-sm px-4 rounded-3 d-flex align-items-center gap-2"
        >
          <i className="bi bi-plus-lg fs-5"></i> New Strand
        </button>
      </div>

      <div className="row mb-4">
        <div className="col-12 col-md-5 col-lg-4">
          <div
            className="input-group shadow-sm rounded-3 overflow-hidden bg-white"
            style={{ border: "1px solid rgba(98, 111, 71, 0.2)" }}
          >
            <span className="input-group-text bg-white border-0 text-muted ps-3">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control border-0 ps-2 py-2 shadow-none"
              placeholder="Search by Strand Name or Description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ backgroundColor: "transparent" }}
            />
          </div>
        </div>
      </div>

      {/* GRID CARDS DISPLAY */}
      <div className="row g-4">
        {filteredStrands.map((strand) => (
          <div className="col-md-6 col-lg-4" key={strand.id}>
            <div className="card h-100 border-0 shadow-sm rounded-4 position-relative overflow-hidden">
              <div className="card-header bg-white border-0 pt-4 pb-2 d-flex justify-content-between align-items-start">
                <h4
                  className="fw-bold mb-0 d-flex align-items-center"
                  style={{ color: "var(--primary-color)" }}
                >
                  <div
                    className="rounded-circle d-flex justify-content-center align-items-center me-2"
                    style={{
                      width: "35px",
                      height: "35px",
                      backgroundColor: "rgba(98, 111, 71, 0.1)",
                    }}
                  >
                    <i className="bi bi-diagram-3-fill fs-5"></i>
                  </div>
                  {strand.name}
                </h4>

                <div className="dropdown strand-card-dropdown position-relative">
                  <button
                    className="btn btn-sm btn-light rounded-circle shadow-sm"
                    type="button"
                    onClick={() =>
                      setOpenDropdownId(
                        openDropdownId === strand.id ? null : strand.id,
                      )
                    }
                    style={{ width: "35px", height: "35px" }}
                  >
                    <i className="bi bi-three-dots-vertical text-dark"></i>
                  </button>

                  <ul
                    className={`dropdown-menu shadow border-0 rounded-3 mt-1 ${openDropdownId === strand.id ? "show" : ""}`}
                    style={{
                      display: openDropdownId === strand.id ? "block" : "none",
                      position: "absolute",
                      top: "100%",
                      right: "0",
                      zIndex: 1000,
                    }}
                  >
                    <li>
                      <button
                        className="dropdown-item py-2 fw-medium text-dark"
                        onClick={() => handleConfirmUpdateClick(strand)}
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
                        onClick={() => confirmDelete(strand)}
                      >
                        <i className="bi bi-trash3-fill me-2"></i> Delete
                      </button>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="card-body d-flex flex-column">
                <p className="text-muted small mb-4 ps-1">
                  {strand.description}
                </p>
                <div className="mt-auto">
                  <div
                    className="badge border text-dark w-100 py-3 rounded-3 d-flex justify-content-between align-items-center"
                    style={{ backgroundColor: "var(--accent-color)" }}
                  >
                    <span className="fw-medium">
                      <i className="bi bi-people-fill me-2 text-muted"></i>{" "}
                      Total Students
                    </span>
                    <span className="fw-bold fs-6">
                      {strand.users_count || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredStrands.length === 0 && !isLoading && (
          <div className="col-12 text-center py-5 bg-white rounded-4 shadow-sm">
            <i
              className="bi bi-inbox text-muted"
              style={{ fontSize: "3rem" }}
            ></i>
            <p className="text-muted mt-3">
              No strands found. Try adjusting your search or create a new one.
            </p>
          </div>
        )}
      </div>

      <StrandFormModal
        modalMode={modalMode}
        formData={formData}
        handleInputChange={handleInputChange}
        handleFormSubmit={handleFormSubmit}
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
              <h4 className="fw-bold text-dark">Edit Strand Information</h4>
              <p className="text-muted mb-0">
                You are about to edit the records of{" "}
                <b>{selectedStrand?.name}</b>. Do you want to proceed to the
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
              {/* ITO ANG MAG-TITRIGGER PARA BUMUKAS YUNG FORM MODAL */}
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
              <h4 className="fw-bold text-dark">Confirm Deletion</h4>
              <p className="text-muted mb-0">
                Are you sure you want to move <b>{selectedStrand?.name}</b> to
                the Recycle Bin? This action can be undone later.
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

export default Strands;

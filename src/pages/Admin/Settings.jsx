import React, { useState, useEffect } from "react";
import axios from "axios";
import { sileo } from "sileo";
import GlobalSpinner from "../../components/Shared/GlobalSpinner";
import SettingsFormModal from "./SettingsFormModal";
import { Modal } from "bootstrap";

const darkToast = {
  fill: "#242424",
  styles: { title: "sileo-toast-title", description: "sileo-toast-desc" },
};

const Settings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading...");

  const [currentSetting, setCurrentSetting] = useState(null);
  const [formData, setFormData] = useState({ school_year: "", semester: "" });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    setLoadingText("Fetching settings...");
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/settings`,
      );
      setCurrentSetting(response.data);
    } catch (error) {
      sileo.error({
        title: "Error",
        description: "Failed to fetch system settings.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openSetModal = () => {
    if (currentSetting) {
      setFormData({
        school_year: currentSetting.school_year || "",
        semester: currentSetting.semester || "",
      });
    } else {
      setFormData({ school_year: "", semester: "" });
    }
    const modalElement = document.getElementById("setSettingsModal");
    const modal = Modal.getInstance(modalElement) || new Modal(modalElement);
    modal.show();
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const modalElement = document.getElementById("setSettingsModal");
    const modal = Modal.getInstance(modalElement);
    if (modal) modal.hide();

    setTimeout(async () => {
      document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";

      setIsLoading(true);
      setLoadingText("Applying Settings...");

      try {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/settings`,
          formData,
        );
        sileo.success({
          title: "Success",
          description: "School settings successfully applied.",
          ...darkToast,
        });
        fetchSettings();

        // MAGPAPADALA NG SIGNAL SA NAVBAR PARA MAG-REFRESH AGAD
        window.dispatchEvent(new Event("settingsChanged"));
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
    }, 400);
  };

  const confirmReset = () => {
    const modal = new Modal(document.getElementById("resetConfirmModal"));
    modal.show();
  };

  const executeReset = () => {
    setTimeout(async () => {
      document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";

      setIsLoading(true);
      setLoadingText("Resetting System...");
      try {
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/settings/reset`);
        sileo.success({
          title: "Reset Complete",
          description: "School settings cleared.",
          ...darkToast,
        });
        setCurrentSetting(null);
        fetchSettings();

        // MAGPAPADALA NG SIGNAL SA NAVBAR PARA MAG-REFRESH AGAD
        window.dispatchEvent(new Event("settingsChanged"));
      } catch (error) {
        sileo.error({
          title: "Failed",
          description: "Could not reset settings.",
          ...darkToast,
        });
      } finally {
        setIsLoading(false);
      }
    }, 400);
  };

  return (
    <>
      <GlobalSpinner isLoading={isLoading} text={loadingText} />

      <div className="mb-4">
        <h3 className="fw-bold mb-1" style={{ color: "var(--primary-color)" }}>
          System Settings <i className="bi bi-gear"></i>
        </h3>
        <p className="text-muted small mb-0">
          Configure school year, semester, generate reports, and manage system
          status.
        </p>
      </div>

      <div className="row g-4 justify-content-center">
        {/* SCHOOL SETTINGS */}
        <div className="col-md-6 col-lg-4">
          <div
            className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden"
            style={{ border: "2px solid rgba(98, 111, 71, 0.1)" }}
          >
            <div className="card-header border-0 bg-white pt-5 pb-2 text-center">
              <div
                className="d-inline-flex justify-content-center align-items-center rounded-circle mb-3 shadow-sm"
                style={{
                  width: "80px",
                  height: "80px",
                  backgroundColor: "rgba(98, 111, 71, 0.1)",
                  color: "var(--primary-color)",
                }}
              >
                <i className="bi bi-building fs-1"></i>
              </div>
              <h4
                className="fw-bold mb-0"
                style={{ color: "var(--primary-color)" }}
              >
                School Settings
              </h4>
            </div>
            <div className="card-body px-4 text-center">
              <div
                className="p-3 rounded-4 mb-2 text-start shadow-sm position-relative overflow-hidden"
                style={{
                  backgroundColor: "var(--accent-color)",
                  border: "1px solid rgba(98, 111, 71, 0.2)",
                  zIndex: 1,
                }}
              >
                <i
                  className="bi bi-calendar-check position-absolute opacity-25"
                  style={{
                    fontSize: "5rem",
                    right: "-10px",
                    bottom: "-15px",
                    color: "var(--primary-color)",
                    zIndex: -1,
                  }}
                ></i>

                <div className="mb-3">
                  <span className="text-muted small fw-bold text-uppercase d-block mb-1">
                    <i className="bi bi-calendar-event me-2"></i>Current School
                    Year
                  </span>
                  <span className="fw-bold fs-5 text-dark ms-4">
                    {currentSetting?.school_year || "Not Set"}
                  </span>
                </div>
                <div>
                  <span className="text-muted small fw-bold text-uppercase d-block mb-1">
                    <i className="bi bi-clock-history me-2"></i>Current Semester
                  </span>
                  <span className="fw-bold fs-5 text-dark ms-4">
                    {currentSetting?.semester
                      ? `${currentSetting.semester} Semester`
                      : "Not Set"}
                  </span>
                </div>
              </div>
            </div>
            <div className="card-footer bg-white border-0 pb-4 px-4 d-flex gap-2">
              <button
                className="btn btn-campusloop flex-grow-1 fw-bold rounded-3 shadow-sm"
                onClick={openSetModal}
              >
                <i className="bi bi-gear-fill me-2"></i> Set
              </button>
              <button
                className="btn btn-outline-danger fw-bold rounded-3 px-4 shadow-sm"
                disabled={!currentSetting}
                onClick={confirmReset}
                title="Reset Settings"
              >
                <i className="bi bi-arrow-counterclockwise"></i> Reset
              </button>
            </div>
          </div>
        </div>

        {/* REPORTS (PLACEHOLDER) */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative">
            <div className="card-header border-0 bg-white pt-5 pb-2 text-center opacity-75">
              <div
                className="d-inline-flex justify-content-center align-items-center rounded-circle mb-3 shadow-sm"
                style={{
                  width: "80px",
                  height: "80px",
                  backgroundColor: "#f8f9fa",
                  color: "#6c757d",
                }}
              >
                <i className="bi bi-file-earmark-bar-graph fs-1"></i>
              </div>
              <h4 className="fw-bold mb-0 text-muted">System Reports</h4>
            </div>
            <div className="card-body px-4 text-center opacity-75">
              <span
                className="badge rounded-3 px-3 py-2 mb-3 fw-bold shadow-sm"
                style={{
                  backgroundColor: "var(--neutral-color)",
                  color: "#fff",
                }}
              >
                Coming Soon
              </span>
              <p className="text-muted small mb-0">
                Generate and download comprehensive PDF or Excel reports of
                system data.
              </p>
            </div>
            <div className="card-footer bg-white border-0 pb-4 px-4 text-center">
              <button
                className="btn btn-light border w-100 fw-bold rounded-3 text-muted shadow-sm"
                disabled
              >
                Generate Report
              </button>
            </div>
          </div>
        </div>

        {/* MAINTENANCE (PLACEHOLDER) */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative">
            <div className="card-header border-0 bg-white pt-5 pb-2 text-center opacity-75">
              <div
                className="d-inline-flex justify-content-center align-items-center rounded-circle mb-3 shadow-sm"
                style={{
                  width: "80px",
                  height: "80px",
                  backgroundColor: "#f8f9fa",
                  color: "#6c757d",
                }}
              >
                <i className="bi bi-tools fs-1"></i>
              </div>
              <h4 className="fw-bold mb-0 text-muted">Maintenance</h4>
            </div>
            <div className="card-body px-4 text-center opacity-75">
              <span
                className="badge rounded-3 px-3 py-2 mb-3 fw-bold shadow-sm"
                style={{
                  backgroundColor: "var(--neutral-color)",
                  color: "#fff",
                }}
              >
                Coming Soon
              </span>
              <p className="text-muted small mb-0">
                Enable 1-hour maintenance mode loop. Restricts teacher and
                student access.
              </p>
            </div>
            <div className="card-footer bg-white border-0 pb-4 px-4 text-center">
              <button
                className="btn btn-light border w-100 fw-bold rounded-3 text-muted shadow-sm"
                disabled
              >
                Configure Maintenance
              </button>
            </div>
          </div>
        </div>
      </div>

      <SettingsFormModal
        formData={formData}
        handleInputChange={handleInputChange}
        handleFormSubmit={handleFormSubmit}
      />

      {/* RESET CONFIRMATION MODAL */}
      <div
        className="modal fade"
        id="resetConfirmModal"
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
              <h4 className="fw-bold text-dark">Reset Settings?</h4>
              <p className="text-muted mb-0">
                Are you sure you want to clear the current School Year and
                Semester? This might affect data displaying on the dashboard.
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
                onClick={executeReset}
              >
                Yes, Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;

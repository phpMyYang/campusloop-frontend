import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import axios from "axios";
import { sileo } from "sileo";
import { Offcanvas, Modal } from "bootstrap";
import GlobalSpinner from "../../../components/Shared/GlobalSpinner";
import ClassworkFormDrawer from "./ClassworkFormDrawer";
import RespondentsModal from "./RespondentsModal";

const darkToast = {
  fill: "#242424",
  styles: { title: "sileo-toast-title", description: "sileo-toast-desc" },
};

const TabStream = () => {
  const { classroom } = useOutletContext();
  const [classworks, setClassworks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [drawerMode, setDrawerMode] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  const currentUser = JSON.parse(
    localStorage.getItem("campusloop_user") ||
      sessionStorage.getItem("campusloop_user") ||
      "{}",
  );
  const userInitial = currentUser.first_name
    ? currentUser.first_name.charAt(0).toUpperCase()
    : "U";

  const [openDropdownId, setOpenDropdownId] = useState(null);

  // ✅ EXPAND STATE PARA SA UPCOMING SIDEBAR
  const [isUpcomingExpanded, setIsUpcomingExpanded] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    type: "",
    instruction: "",
    points: "",
    deadline: "",
    link: "",
    files: [],
  });

  useEffect(() => {
    if (classroom) fetchClassworks();

    const closeDropdown = () => setOpenDropdownId(null);
    document.addEventListener("click", closeDropdown);
    return () => document.removeEventListener("click", closeDropdown);
  }, [classroom]);

  const fetchClassworks = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/classrooms/${classroom.id}/classworks`,
      );
      setClassworks(res.data);
    } catch (error) {
      console.error("Error fetching classworks", error);
    }
  };

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) =>
    setFormData({ ...formData, files: [...e.target.files] });

  const openDrawer = (mode, item = null) => {
    setOpenDropdownId(null);
    setDrawerMode(mode);
    if (item) {
      setSelectedItem(item);
      setFormData({
        title: item.title,
        type: item.type,
        instruction: item.instruction,
        points: item.points || "",
        deadline: item.deadline
          ? new Date(item.deadline).toISOString().slice(0, 16)
          : "",
        link: item.link || "",
        files: [],
      });
    } else {
      setSelectedItem(null);
      setFormData({
        title: "",
        type: "",
        instruction: "",
        points: "",
        deadline: "",
        link: "",
        files: [],
      });
    }
    const bsOffcanvas = new Offcanvas(
      document.getElementById("classworkDrawer"),
    );
    bsOffcanvas.show();
  };

  const triggerSaveConfirmation = () => {
    const bsOffcanvas = Offcanvas.getInstance(
      document.getElementById("classworkDrawer"),
    );
    if (bsOffcanvas) bsOffcanvas.hide();
    setTimeout(() => {
      document
        .querySelectorAll(".offcanvas-backdrop")
        .forEach((el) => el.remove());
      const modal = new Modal(document.getElementById("saveConfirmModal"));
      modal.show();
    }, 400);
  };

  const executeSubmit = async () => {
    setIsLoading(true);
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("type", formData.type);
      data.append("instruction", formData.instruction);
      if (formData.points) data.append("points", formData.points);
      if (formData.deadline) data.append("deadline", formData.deadline);
      if (formData.link) data.append("link", formData.link);
      formData.files.forEach((f) => data.append("files[]", f));

      if (drawerMode === "create") {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/classrooms/${classroom.id}/classworks`,
          data,
        );
        sileo.success({
          title: "Success",
          description: "Classwork posted & notifications sent.",
          ...darkToast,
        });
      } else {
        data.append("_method", "PUT");
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/classworks/${selectedItem.id}`,
          data,
        );
        sileo.success({
          title: "Updated",
          description: "Classwork updated.",
          ...darkToast,
        });
      }
      fetchClassworks();
    } catch (error) {
      sileo.error({
        title: "Failed",
        description: "Could not save.",
        ...darkToast,
      });
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
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/classworks/${selectedItem.id}`,
      );
      sileo.success({
        title: "Deleted",
        description: "Removed from stream.",
        ...darkToast,
      });
      fetchClassworks();
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

  const openRespondentsModal = (item) => {
    setOpenDropdownId(null);
    setSelectedItem(item);
    const modal = new Modal(document.getElementById("respondentsModal"));
    modal.show();
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "assignment":
        return "bi-journal-code";
      case "activity":
        return "bi-person-workspace";
      case "quiz":
        return "bi-ui-checks";
      case "exam":
        return "bi-file-earmark-check";
      case "material":
        return "bi-bookmark-star";
      default:
        return "bi-journal-text";
    }
  };

  // LOGIC PARA SA UPCOMING SIDEBAR
  const upcomingWorks = classworks
    .filter((cw) => cw.deadline) // Kunin lang yung may deadline
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline)); // I-sort pataas

  const visibleUpcoming = isUpcomingExpanded
    ? upcomingWorks
    : upcomingWorks.slice(0, 3); // Ipakita lang ang 3 kung hindi naka-expand

  const scrollToClasswork = (id) => {
    const element = document.getElementById(`classwork-${id}`);
    if (element) {
      // Mag-scroll pababa doon sa exact card
      element.scrollIntoView({ behavior: "smooth", block: "center" });

      // Magbigay ng highlight animation para madaling makita
      element.style.transition = "all 0.5s ease";
      element.style.boxShadow = "0 0 0 4px var(--primary-color)";
      setTimeout(() => {
        element.style.boxShadow = ""; // Tanggalin agad ang highlight
      }, 2000);
    }
  };

  return (
    <>
      <GlobalSpinner isLoading={isLoading} text="Processing..." />

      <div className="row g-4">
        <div className="col-12 col-lg-3">
          <div
            className="card border-0 shadow-sm rounded-4 bg-white sticky-lg-top"
            style={{ top: "100px" }}
          >
            <div className="card-body p-4">
              <h6 className="fw-bold text-dark mb-3">Upcoming</h6>

              {upcomingWorks.length === 0 ? (
                <p className="text-muted small mb-0">
                  Woohoo, no work due soon!
                </p>
              ) : (
                <div className="d-flex flex-column gap-2 transition-all">
                  {visibleUpcoming.map((task) => (
                    <div
                      key={task.id}
                      className="p-2 rounded-3"
                      style={{
                        backgroundColor: "rgba(98, 111, 71, 0.05)",
                        cursor: "pointer",
                      }}
                      onClick={() => scrollToClasswork(task.id)}
                    >
                      <span className="d-block small fw-bold text-dark text-truncate">
                        {task.title}
                      </span>
                      <span
                        className="d-block text-muted"
                        style={{ fontSize: "0.7rem" }}
                      >
                        Due:{" "}
                        {new Date(task.deadline).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {upcomingWorks.length > 3 && (
                <div className="text-end mt-3 border-top pt-2">
                  <button
                    onClick={() => setIsUpcomingExpanded(!isUpcomingExpanded)}
                    className="btn btn-link p-0 text-decoration-none fw-bold small shadow-none"
                    style={{ color: "var(--primary-color)" }}
                  >
                    {isUpcomingExpanded ? "View less" : "View all"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT MAIN AREA: STREAM FEED */}
        <div className="col-12 col-lg-9">
          <div
            className="card border-0 shadow-sm rounded-4 bg-white mb-4 premium-hover-card"
            onClick={() => openDrawer("create")}
            style={{ cursor: "pointer" }}
          >
            <div className="card-body p-4 d-flex align-items-center gap-3">
              <div
                className="rounded-circle text-white d-flex justify-content-center align-items-center fw-bold shadow-sm flex-shrink-0"
                style={{
                  width: "45px",
                  height: "45px",
                  backgroundColor: "var(--primary-color)",
                }}
              >
                {userInitial}
              </div>
              <div className="flex-grow-1 text-muted fw-medium small">
                Announce something or Create a Classwork...
              </div>
              <button
                className="btn btn-light border rounded-circle shadow-sm flex-shrink-0"
                style={{ width: "45px", height: "45px" }}
              >
                <i className="bi bi-plus-lg fs-5 text-muted"></i>
              </button>
            </div>
          </div>

          {classworks.length === 0 ? (
            <div className="card border-0 shadow-sm rounded-4 bg-white mb-4">
              <div className="card-body p-5 text-center">
                <i
                  className="bi bi-journal-text text-muted d-block mb-3 opacity-50"
                  style={{ fontSize: "4rem" }}
                ></i>
                <h5 className="fw-bold text-dark">
                  This is where you'll assign work
                </h5>
                <p className="text-muted small mb-0">
                  You can add activities, assignments, quizzes, and materials
                  here.
                </p>
              </div>
            </div>
          ) : (
            classworks.map((cw) => (
              <div
                key={cw.id}
                id={`classwork-${cw.id}`} // INILAGAY ANG ID PARA MAG-WORK ANG AUTO-SCROLL
                className="card border-0 shadow-sm rounded-4 bg-white mb-4"
                style={{ borderRadius: "1rem" }}
              >
                <div className="card-body p-4">
                  <div className="d-flex align-items-start gap-3 position-relative mb-3">
                    <div
                      className="rounded-circle bg-light d-flex justify-content-center align-items-center flex-shrink-0 shadow-sm"
                      style={{ width: "45px", height: "45px" }}
                    >
                      <i
                        className={`bi ${getTypeIcon(cw.type)} text-primary fs-5`}
                      ></i>
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="fw-bold text-dark mb-1 lh-sm pe-4">
                            {cw.title}
                          </h6>
                          <div
                            className="d-flex align-items-center gap-2 text-muted"
                            style={{ fontSize: "0.75rem" }}
                          >
                            <span className="fw-medium text-uppercase">
                              {cw.type}
                            </span>
                            <i className="bi bi-dot"></i>
                            <span>
                              {new Date(cw.created_at).toLocaleDateString(
                                "en-US",
                                { month: "short", day: "numeric" },
                              )}
                            </span>
                          </div>
                        </div>

                        <div
                          className="dropdown position-absolute top-0 end-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className="btn btn-sm text-muted rounded-circle shadow-none d-flex justify-content-center align-items-center p-0"
                            type="button"
                            onClick={() =>
                              setOpenDropdownId(
                                openDropdownId === cw.id ? null : cw.id,
                              )
                            }
                            style={{
                              width: "32px",
                              height: "32px",
                              backgroundColor:
                                openDropdownId === cw.id
                                  ? "rgba(0,0,0,0.05)"
                                  : "transparent",
                            }}
                          >
                            <i className="bi bi-three-dots-vertical"></i>
                          </button>
                          <ul
                            className={`dropdown-menu dropdown-menu-end shadow-sm border-0 rounded-3 mt-1 ${
                              openDropdownId === cw.id ? "show" : ""
                            }`}
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
                                onClick={() => openDrawer("update", cw)}
                              >
                                <i
                                  className="bi bi-pencil-square me-2"
                                  style={{ color: "var(--primary-color)" }}
                                ></i>{" "}
                                Update
                              </button>
                            </li>
                            {cw.type !== "material" && (
                              <li>
                                <button
                                  className="dropdown-item py-2 fw-medium text-success"
                                  onClick={() => openRespondentsModal(cw)}
                                >
                                  <i className="bi bi-people me-2"></i>{" "}
                                  Respondents
                                </button>
                              </li>
                            )}
                            <li>
                              <hr className="dropdown-divider" />
                            </li>
                            <li>
                              <button
                                className="dropdown-item py-2 fw-medium text-danger"
                                onClick={() => confirmDelete(cw)}
                              >
                                <i className="bi bi-trash-fill me-2"></i> Delete
                              </button>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="ps-0 ps-sm-5 ms-sm-2">
                    <p
                      className="text-dark small mb-3 lh-base"
                      style={{ whiteSpace: "pre-line" }}
                    >
                      {cw.instruction}
                    </p>

                    <div className="d-flex flex-wrap gap-2 mb-3">
                      {cw.deadline && (
                        <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-3 py-2 rounded-pill fw-medium">
                          <i className="bi bi-clock me-1"></i> Due:{" "}
                          {new Date(cw.deadline).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                      {cw.points && (
                        <span className="badge bg-light text-dark border px-3 py-2 rounded-pill fw-medium">
                          <i className="bi bi-star-fill me-1 text-warning"></i>{" "}
                          {cw.points} Points
                        </span>
                      )}
                      {cw.link && (
                        <a
                          href={cw.link}
                          target="_blank"
                          rel="noreferrer"
                          className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-2 rounded-pill text-decoration-none fw-medium"
                        >
                          <i className="bi bi-link-45deg me-1"></i> View
                          Attached Link
                        </a>
                      )}
                    </div>

                    {cw.type !== "material" && (
                      <div className="bg-light rounded-4 p-3 d-flex justify-content-around text-center border mt-4">
                        <div>
                          <h4 className="fw-bold text-dark mb-0 fs-3">0</h4>
                          <span
                            className="text-muted fw-bold text-uppercase"
                            style={{
                              fontSize: "0.65rem",
                              letterSpacing: "1px",
                            }}
                          >
                            Turned in
                          </span>
                        </div>
                        <div className="vr opacity-25"></div>
                        <div>
                          <h4 className="fw-bold text-dark mb-0 fs-3">
                            {classroom.enrolled_count || 0}
                          </h4>
                          <span
                            className="text-muted fw-bold text-uppercase"
                            style={{
                              fontSize: "0.65rem",
                              letterSpacing: "1px",
                            }}
                          >
                            Assigned
                          </span>
                        </div>
                        <div className="vr opacity-25"></div>
                        <div>
                          <h4 className="fw-bold text-success mb-0 fs-3">0</h4>
                          <span
                            className="text-success fw-bold text-uppercase"
                            style={{
                              fontSize: "0.65rem",
                              letterSpacing: "1px",
                            }}
                          >
                            Graded
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card-footer bg-light border-top p-3 px-4">
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="rounded-circle text-white d-flex justify-content-center align-items-center fw-bold flex-shrink-0 shadow-sm"
                      style={{
                        width: "35px",
                        height: "35px",
                        backgroundColor: "var(--primary-color)",
                      }}
                    >
                      {userInitial}
                    </div>
                    <input
                      type="text"
                      className="form-control form-control-sm rounded-pill px-3 py-2 border"
                      placeholder="Add a class comment..."
                    />
                    <button
                      className="btn btn-sm btn-campusloop rounded-circle shadow-sm flex-shrink-0 d-flex justify-content-center align-items-center"
                      style={{ width: "35px", height: "35px" }}
                    >
                      <i
                        className="bi bi-send-fill"
                        style={{ marginLeft: "-2px" }}
                      ></i>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ClassworkFormDrawer
        drawerMode={drawerMode}
        formData={formData}
        handleInputChange={handleInputChange}
        handleFileChange={handleFileChange}
        triggerSaveConfirmation={triggerSaveConfirmation}
      />

      <RespondentsModal selectedItem={selectedItem} />

      {/* CONFIRMATION MODALS */}
      <div
        className="modal fade"
        id="saveConfirmModal"
        tabIndex="-1"
        aria-hidden="true"
        data-bs-backdrop="static"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="modal-body text-center p-4">
              <div
                className="rounded-circle d-flex justify-content-center align-items-center mx-auto mb-3"
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
              <h4 className="fw-bold text-dark mt-3">
                {drawerMode === "create" ? "Post Classwork" : "Save Changes"}
              </h4>
              <p className="text-muted mb-4">
                Are you sure you want to post this to the stream?
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
            <div className="modal-body text-center p-4">
              <div
                className="rounded-circle bg-danger bg-opacity-10 d-flex justify-content-center align-items-center mx-auto mb-3"
                style={{ width: "80px", height: "80px" }}
              >
                <i
                  className="bi bi-exclamation-triangle-fill text-danger"
                  style={{ fontSize: "2.5rem" }}
                ></i>
              </div>
              <h4 className="fw-bold text-dark mt-3">Delete Classwork</h4>
              <p className="text-muted mb-4">
                Are you sure you want to move <b>{selectedItem?.title}</b> to
                the recycle bin?
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
      </div>
    </>
  );
};
export default TabStream;

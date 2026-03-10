import React, { useState, useEffect } from "react";
import axios from "axios";

const ClassroomFormDrawer = ({
  drawerMode,
  formData,
  handleInputChange,
  handleScheduleChange,
  triggerSaveConfirmation,
}) => {
  const [strands, setStrands] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    fetchStrandsAndSubjects();
  }, []);

  const fetchStrandsAndSubjects = async () => {
    try {
      const strandRes = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/strands`,
      );
      const subjectRes = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/subjects`,
      );
      setStrands(strandRes.data);
      setSubjects(subjectRes.data);
    } catch (error) {
      console.error("Failed to load options.");
    }
  };

  const filteredSubjects = subjects.filter(
    (sub) =>
      sub.strand_id === formData.strand_id &&
      sub.grade_level === formData.grade_level,
  );

  const daysOfWeek = [
    { id: "Mon", label: "M" },
    { id: "Tue", label: "T" },
    { id: "Wed", label: "W" },
    { id: "Thu", label: "TH" },
    { id: "Fri", label: "F" },
    { id: "Sat", label: "S" },
  ];

  // SAFE CATCHERS
  const safeSchedule = formData.schedule || {
    days: [],
    start_time: "",
    end_time: "",
  };
  const safeDays = Array.isArray(safeSchedule.days) ? safeSchedule.days : [];

  return (
    <div
      className="offcanvas offcanvas-end shadow-lg border-0"
      tabIndex="-1"
      id="classroomDrawer"
      style={{ width: "450px" }}
    >
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
              <i className="bi bi-easel2-fill me-2 fs-4"></i> Create New
              Classroom
            </>
          ) : (
            <>
              <i className="bi bi-pencil-square me-2 fs-4"></i> Update Classroom
            </>
          )}
        </h5>
        <button
          type="button"
          className="btn-close shadow-none"
          data-bs-dismiss="offcanvas"
          aria-label="Close"
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
            <div className="col-12">
              <h6
                className="fw-bold text-muted mb-0 border-bottom pb-2"
                style={{ fontSize: "0.85rem", letterSpacing: "1px" }}
              >
                CLASSROOM DETAILS
              </h6>
            </div>

            <div className="col-12">
              <label className="form-label small fw-bold text-dark">
                <i className="bi bi-door-open me-1 text-muted"></i> Classroom
                Section
              </label>
              <input
                type="text"
                className="form-control bg-light toolbar-input"
                name="section"
                value={formData.section}
                onChange={handleInputChange}
                autoFocus
                required
                placeholder="e.g. Newton"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-bold text-dark">
                <i className="bi bi-journal-text me-1 text-muted"></i> Select
                Strand
              </label>
              <select
                className="form-select bg-light toolbar-input"
                name="strand_id"
                value={formData.strand_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Choose Strand</option>
                {strands.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-bold text-dark">
                <i className="bi bi-bar-chart-steps me-1 text-muted"></i> Grade
                Level
              </label>
              <select
                className="form-select bg-light toolbar-input"
                name="grade_level"
                value={formData.grade_level}
                onChange={handleInputChange}
                required
              >
                <option value="">Choose Grade</option>
                <option value="11">Grade 11</option>
                <option value="12">Grade 12</option>
              </select>
            </div>

            <div className="col-12">
              <label className="form-label small fw-bold text-dark">
                <i className="bi bi-book-half me-1 text-muted"></i> Classroom
                Subject
              </label>
              <select
                className="form-select bg-light toolbar-input"
                name="subject_id"
                value={formData.subject_id}
                onChange={handleInputChange}
                required
                disabled={!formData.strand_id || !formData.grade_level}
              >
                <option value="">Select Subject</option>
                {filteredSubjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.code} - {sub.description}
                  </option>
                ))}
              </select>
              {(!formData.strand_id || !formData.grade_level) && (
                <small
                  className="text-danger mt-1 d-block"
                  style={{ fontSize: "0.75rem" }}
                >
                  Please select Strand and Grade Level first.
                </small>
              )}
            </div>

            <div className="col-12 mt-4">
              <h6
                className="fw-bold text-muted mb-0 border-bottom pb-2"
                style={{ fontSize: "0.85rem", letterSpacing: "1px" }}
              >
                CAPACITY & SCHEDULE
              </h6>
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-bold text-dark">
                <i className="bi bi-people me-1 text-muted"></i> Capacity
              </label>
              <input
                type="number"
                className="form-control bg-light toolbar-input"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                required
                min="1"
                placeholder="e.g. 40"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-bold text-dark">
                <i className="bi bi-palette me-1 text-muted"></i> Header Color
              </label>
              <input
                type="color"
                className="form-control form-control-color w-100 p-1 bg-light border-0 shadow-sm"
                name="color_bg"
                value={formData.color_bg}
                onChange={handleInputChange}
                required
                style={{ height: "38px", cursor: "pointer" }}
              />
            </div>

            {/* NATIVE CHECKBOX MULTI-SELECT IMPLEMENTATION */}
            <div className="col-12">
              <label className="form-label small fw-bold text-dark">
                <i className="bi bi-calendar-day me-1 text-muted"></i> Select
                Days (Multiple)
              </label>
              <div className="d-flex gap-2">
                {daysOfWeek.map((day) => {
                  const isSelected = safeDays.includes(day.id);
                  return (
                    <div key={day.id}>
                      <input
                        type="checkbox"
                        className="btn-check"
                        id={`day-${day.id}`}
                        checked={isSelected}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          // Siguradong Array addition at deduction ang mangyayari
                          const newDays = checked
                            ? [...safeDays, day.id]
                            : safeDays.filter((d) => d !== day.id);
                          handleScheduleChange("days", newDays);
                        }}
                      />
                      <label
                        className={`btn rounded-circle fw-bold d-flex align-items-center justify-content-center ${isSelected ? "btn-campusloop shadow-sm" : "btn-light border text-muted"}`}
                        htmlFor={`day-${day.id}`}
                        style={{ width: "40px", height: "40px", padding: 0 }}
                      >
                        {day.label}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-bold text-dark">
                <i className="bi bi-clock me-1 text-muted"></i> Time Start
              </label>
              <input
                type="time"
                className="form-control bg-light toolbar-input"
                value={safeSchedule.start_time}
                onChange={(e) =>
                  handleScheduleChange("start_time", e.target.value)
                }
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-bold text-dark">
                <i className="bi bi-clock-history me-1 text-muted"></i> Time End
              </label>
              <input
                type="time"
                className="form-control bg-light toolbar-input"
                value={safeSchedule.end_time}
                onChange={(e) =>
                  handleScheduleChange("end_time", e.target.value)
                }
                required
              />
            </div>
          </div>

          <div className="mt-5 pt-3 border-top">
            <button
              type="submit"
              className="btn btn-campusloop w-100 rounded-3 shadow-sm"
            >
              {drawerMode === "create" ? (
                <>
                  <i className="bi bi-plus-circle-fill me-2"></i> Create
                  Classroom
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

export default ClassroomFormDrawer;

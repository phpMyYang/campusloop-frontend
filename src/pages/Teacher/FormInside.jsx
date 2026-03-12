import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { sileo } from "sileo";
import GlobalSpinner from "../../components/Shared/GlobalSpinner";

const FormInside = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [respondents, setRespondents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("questionnaire");

  // States para sa Respondents Datatable
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchFormData();
    fetchRespondents();
  }, [id]);

  // Reset sa Page 1 kapag nag-search o nagpalit ng entries limit
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, entriesPerPage]);

  const fetchFormData = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/forms/${id}`,
      );
      setForm(res.data);
    } catch (error) {
      console.error("Error fetching form", error);
    }
  };

  const fetchRespondents = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/forms/${id}/respondents`,
      );
      setRespondents(res.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching respondents", error);
      setIsLoading(false);
    }
  };

  // DATATABLE LOGIC PARA SA RESPONDENTS
  const filteredRespondents = respondents.filter((r) =>
    `${r.student?.first_name} ${r.student?.last_name} ${r.student?.lrn} ${r.student?.email} ${r.student?.strand?.name}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentRespondents = filteredRespondents.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredRespondents.length / entriesPerPage);

  if (isLoading || !form)
    return <GlobalSpinner isLoading={true} text="Loading Form Details..." />;

  return (
    <>
      {/* BREADCRUMB NAVIGATION */}
      <nav aria-label="breadcrumb" className="mb-3 ps-1">
        <ol className="breadcrumb mb-0">
          <li className="breadcrumb-item">
            <Link
              to="/teacher/forms"
              className="text-decoration-none text-muted fw-medium d-flex align-items-center"
            >
              <i className="bi bi-arrow-left me-1"></i> Back to Forms
            </Link>
          </li>
          <li
            className="breadcrumb-item active fw-bold text-dark"
            aria-current="page"
          >
            {form.name}
          </li>
        </ol>
      </nav>

      {/* UNIFIED HEADER CARD */}
      <div className="card bg-white border-0 shadow-sm rounded-4 mb-4 overflow-hidden position-relative">
        <div className="card-body p-4 p-md-5">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-4">
            {/* TITLE & INSTRUCTION */}
            <div className="flex-grow-1" style={{ maxWidth: "800px" }}>
              <div className="d-flex align-items-center gap-3 mb-2">
                <div
                  className="rounded-circle text-white d-flex justify-content-center align-items-center shadow-sm flex-shrink-0"
                  style={{
                    width: "50px",
                    height: "50px",
                    backgroundColor: "var(--primary-color)",
                  }}
                >
                  <i className="bi bi-card-checklist fs-4"></i>
                </div>
                <h2
                  className="fw-bolder text-dark mb-0"
                  style={{ letterSpacing: "-0.5px" }}
                >
                  {form.name}
                </h2>
              </div>
              <p
                className="text-muted mt-3 mb-0"
                style={{
                  fontSize: "0.95rem",
                  lineHeight: "1.6",
                  whiteSpace: "pre-wrap",
                }}
              >
                {form.instruction}
              </p>
            </div>

            {/* ACTION BUTTON */}
            <button
              onClick={() => navigate(`/teacher/forms/${form.id}/builder`)}
              className="btn btn-campusloop shadow-sm px-4 py-2 rounded-3 d-flex align-items-center gap-2 fw-bold flex-shrink-0"
            >
              <i className="bi bi-pencil-square"></i> Open Builder
            </button>
          </div>

          <hr className="opacity-10 my-4" />

          {/* COMPACT INFO WIDGET */}
          <div className="d-flex flex-wrap justify-content-center gap-4 gap-md-5 align-items-center bg-light p-3 rounded-4 border border-light-subtle">
            <div className="d-flex align-items-center gap-3 pe-md-4 border-end-md">
              <div
                className="rounded-circle bg-white shadow-sm d-flex justify-content-center align-items-center flex-shrink-0"
                style={{ width: "40px", height: "40px" }}
              >
                <i className="bi bi-hourglass-split text-warning fs-5"></i>
              </div>
              <div>
                <span
                  className="d-block small text-muted fw-bold mb-0"
                  style={{
                    fontSize: "0.65rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Time Limit
                </span>
                <span className="d-block text-dark small fw-bolder">
                  {form.timer > 0 ? `${form.timer} Minutes` : "No Timer"}
                </span>
              </div>
            </div>

            <div className="d-flex align-items-center gap-3 pe-md-4 border-end-md">
              <div
                className="rounded-circle bg-white shadow-sm d-flex justify-content-center align-items-center flex-shrink-0"
                style={{ width: "40px", height: "40px" }}
              >
                <i
                  className={`bi ${form.is_focus_mode ? "bi-eye-slash-fill text-danger" : "bi-shield-check text-success"} fs-5`}
                ></i>
              </div>
              <div>
                <span
                  className="d-block small text-muted fw-bold mb-0"
                  style={{
                    fontSize: "0.65rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Security Mode
                </span>
                {form.is_focus_mode ? (
                  <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 mt-1 px-2 py-1">
                    Focus Mode ON
                  </span>
                ) : (
                  <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 mt-1 px-2 py-1">
                    Normal
                  </span>
                )}
              </div>
            </div>

            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle bg-white shadow-sm d-flex justify-content-center align-items-center flex-shrink-0"
                style={{ width: "40px", height: "40px" }}
              >
                <i
                  className={`bi bi-shuffle ${form.is_shuffle_questions ? "text-primary" : "text-muted"} fs-5`}
                ></i>
              </div>
              <div>
                <span
                  className="d-block small text-muted fw-bold mb-0"
                  style={{
                    fontSize: "0.65rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Question Order
                </span>
                {form.is_shuffle_questions ? (
                  <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 mt-1 px-2 py-1">
                    Shuffled
                  </span>
                ) : (
                  <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 mt-1 px-2 py-1">
                    Default Order
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SLEEK UNDERLINE TABS */}
      <div className="d-flex justify-content-center gap-4 border-bottom mb-4 px-3 mt-2">
        <button
          className={`btn rounded-0 pb-3 px-3 border-0 d-flex align-items-center gap-2 transition-all ${activeTab === "questionnaire" ? "fw-bolder" : "text-muted fw-medium"}`}
          style={{
            borderBottom:
              activeTab === "questionnaire"
                ? "3px solid var(--primary-color)"
                : "3px solid transparent",
            color: activeTab === "questionnaire" ? "var(--primary-color)" : "",
            backgroundColor: "transparent",
            boxShadow: "none",
          }}
          onClick={() => setActiveTab("questionnaire")}
        >
          <i className="bi bi-card-list"></i> Questionnaire
        </button>
        <button
          className={`btn rounded-0 pb-3 px-3 border-0 d-flex align-items-center gap-2 transition-all ${activeTab === "respondents" ? "fw-bolder" : "text-muted fw-medium"}`}
          style={{
            borderBottom:
              activeTab === "respondents"
                ? "3px solid var(--primary-color)"
                : "3px solid transparent",
            color: activeTab === "respondents" ? "var(--primary-color)" : "",
            backgroundColor: "transparent",
            boxShadow: "none",
          }}
          onClick={() => setActiveTab("respondents")}
        >
          <i className="bi bi-people-fill"></i> Respondents
          <span
            className="badge rounded-pill shadow-sm ms-1"
            style={{
              backgroundColor:
                activeTab === "respondents"
                  ? "var(--primary-color)"
                  : "#e9ecef",
              color: activeTab === "respondents" ? "white" : "#6c757d",
            }}
          >
            {respondents.length}
          </span>
        </button>
      </div>

      {/* TAB 1: QUESTIONNAIRE */}
      {activeTab === "questionnaire" && (
        <div className="row g-4">
          {form.questions && form.questions.length > 0 ? (
            form.questions.map((q, index) => (
              <div className="col-12" key={q.id}>
                <div className="card border-0 shadow-sm rounded-4 bg-white p-4 p-md-5 position-relative">
                  <div className="d-flex justify-content-between align-items-start mb-4 border-bottom pb-3">
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill fw-bolder">
                        Q{index + 1}
                      </span>
                      {q.type === "multiple_choice" ? (
                        <span className="badge bg-light text-muted border px-2 py-1">
                          <i className="bi bi-ui-radios me-1"></i> Multiple
                          Choice
                        </span>
                      ) : (
                        <span className="badge bg-light text-muted border px-2 py-1">
                          <i className="bi bi-fonts me-1"></i> Short Answer
                        </span>
                      )}
                    </div>
                    <span className="fw-bolder text-dark bg-light px-3 py-2 rounded-3 border">
                      {q.points} Pts
                    </span>
                  </div>

                  <h5
                    className="fw-bold text-dark mb-4"
                    style={{ lineHeight: "1.6" }}
                  >
                    {q.text}
                  </h5>

                  {q.type === "multiple_choice" && q.choices && (
                    <div className="d-flex flex-column gap-3 mb-3">
                      {q.choices.map((choice, cIndex) => (
                        <div
                          key={cIndex}
                          className={`p-3 rounded-4 border fw-medium d-flex align-items-center transition-all ${q.correct_answer === choice ? "bg-success bg-opacity-10 border-success text-success shadow-sm" : "bg-light text-dark border-light-subtle"}`}
                        >
                          <div
                            className={`rounded-circle d-flex justify-content-center align-items-center me-3 flex-shrink-0 ${q.correct_answer === choice ? "bg-success text-white" : "bg-white border text-muted"}`}
                            style={{
                              width: "28px",
                              height: "28px",
                              fontSize: "0.85rem",
                            }}
                          >
                            {q.correct_answer === choice ? (
                              <i className="bi bi-check-lg"></i>
                            ) : (
                              String.fromCharCode(65 + cIndex)
                            )}
                          </div>
                          {choice}
                        </div>
                      ))}
                    </div>
                  )}

                  {q.type === "short_answer" && (
                    <div className="p-4 rounded-4 border bg-success bg-opacity-10 border-success text-success mb-3 d-flex align-items-center gap-3">
                      <i className="bi bi-check-circle-fill fs-4"></i>
                      <div>
                        <span
                          className="d-block small fw-bold text-uppercase mb-1"
                          style={{ letterSpacing: "1px" }}
                        >
                          Correct Answer
                        </span>
                        <span className="fw-bolder fs-5">
                          {q.correct_answer}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-12">
              <div className="card bg-white border-0 shadow-sm rounded-4 text-center py-5 px-3">
                <div className="card-body py-5">
                  <i
                    className="bi bi-ui-radios text-muted opacity-50 d-block mb-3"
                    style={{ fontSize: "4rem" }}
                  ></i>
                  <h4 className="fw-bolder text-dark">
                    No questions added yet
                  </h4>
                  <p
                    className="text-muted mb-4"
                    style={{ maxWidth: "500px", margin: "0 auto" }}
                  >
                    Your form is currently empty. Open the Question Builder to
                    start adding sections, instructions, and questions for your
                    students.
                  </p>
                  <button
                    onClick={() =>
                      navigate(`/teacher/forms/${form.id}/builder`)
                    }
                    className="btn btn-campusloop shadow-sm fw-bold px-4 py-2 rounded-3"
                  >
                    <i className="bi bi-magic me-2"></i> Go to Builder
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: RESPONDENTS */}
      {activeTab === "respondents" && (
        <>
          <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white overflow-hidden">
            <div className="card-body p-3">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 pb-1">
                <div className="d-flex align-items-center flex-shrink-0 text-muted small fw-medium">
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

                <div className="input-group" style={{ width: "300px" }}>
                  <span className="input-group-text bg-white border-end-0 text-muted ps-3 rounded-start-3">
                    <i className="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-1 toolbar-input py-2 rounded-end-3"
                    placeholder="Search Name, Email, or LRN..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
            <div className="table-responsive custom-scrollbar">
              <table
                className="table table-summer align-middle mb-0"
                style={{ minWidth: "950px" }}
              >
                <thead>
                  <tr>
                    <th className="text-center ps-4" style={{ width: "60px" }}>
                      #
                    </th>
                    <th>STUDENT DETAILS</th>
                    <th>LRN</th>
                    <th>STRAND</th>
                    <th className="text-center">SCORE</th>
                    <th>SUBMITTED AT</th>
                    <th className="text-center pe-4">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRespondents.length > 0 ? (
                    currentRespondents.map((sub, index) => (
                      <tr key={sub.id}>
                        <td className="text-center fw-medium text-dark px-4 py-2">
                          {indexOfFirstItem + index + 1}
                        </td>
                        <td className="py-2">
                          <div className="d-flex align-items-center">
                            <div
                              className="rounded-circle text-white d-flex justify-content-center align-items-center fw-bold me-3 flex-shrink-0 shadow-sm"
                              style={{
                                width: "40px",
                                height: "40px",
                                backgroundColor: "var(--primary-color)",
                              }}
                            >
                              {sub.student?.first_name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                              <div
                                className="fw-bolder text-dark d-block text-truncate"
                                style={{ maxWidth: "200px" }}
                              >
                                {sub.student?.first_name}{" "}
                                {sub.student?.last_name}
                              </div>
                              <span
                                className="text-muted small d-block text-truncate"
                                style={{
                                  maxWidth: "200px",
                                  fontSize: "0.75rem",
                                }}
                              >
                                {sub.student?.email}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-2">
                          <span
                            className="d-block fw-bold font-monospace text-dark tracking-wide"
                            style={{ fontSize: "0.90rem" }}
                          >
                            {sub.student?.lrn || "N/A"}
                          </span>
                        </td>
                        <td className="py-2">
                          <span
                            className="badge border text-dark rounded-3 px-2 py-1"
                            style={{ backgroundColor: "var(--accent-color)" }}
                          >
                            {sub.student?.strand?.name || "N/A"}
                          </span>
                        </td>
                        <td className="text-center py-2">
                          <span className="fw-bolder text-success fs-5">
                            {sub.score}
                          </span>
                          <span
                            className="text-muted fw-bold d-block text-uppercase"
                            style={{ fontSize: "0.6rem", letterSpacing: "1px" }}
                          >
                            Points
                          </span>
                        </td>
                        <td className="py-2">
                          <span className="d-block fw-bold text-dark small">
                            {new Date(sub.submitted_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </span>
                          <span
                            className="text-muted font-monospace"
                            style={{ fontSize: "0.75rem" }}
                          >
                            {new Date(sub.submitted_at).toLocaleTimeString(
                              "en-US",
                              { hour: "2-digit", minute: "2-digit" },
                            )}
                          </span>
                        </td>
                        <td className="text-center pe-4 py-2">
                          <button
                            className="btn btn-sm btn-light border-0 shadow-sm rounded-circle d-inline-flex justify-content-center align-items-center transition-all hover-primary"
                            style={{ width: "35px", height: "35px" }}
                            title="View Answers"
                          >
                            <i
                              className="bi bi-eye-fill"
                              style={{
                                color: "var(--primary-color)",
                                fontSize: "0.9rem",
                              }}
                            ></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-5 text-muted">
                        {respondents.length === 0 ? (
                          <i className="bi bi-inbox fs-1 d-block mb-3 opacity-50"></i>
                        ) : (
                          <i className="bi bi-search fs-1 d-block mb-3 opacity-50"></i>
                        )}
                        <span className="fw-bolder text-dark d-block">
                          {respondents.length === 0
                            ? "No submissions yet"
                            : "No matching records found"}
                        </span>
                        <span className="small">
                          {respondents.length === 0
                            ? "Students haven't taken this form."
                            : "Try adjusting your search criteria."}
                        </span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* PAGINATION BUTTONS */}
          {filteredRespondents.length > 0 && (
            <div className="d-flex justify-content-between align-items-center mt-2 mb-4 px-1">
              <span className="text-muted small">
                Showing {indexOfFirstItem + 1} to{" "}
                {Math.min(indexOfLastItem, filteredRespondents.length)} of{" "}
                {filteredRespondents.length} entries
              </span>
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
        </>
      )}
    </>
  );
};

export default FormInside;

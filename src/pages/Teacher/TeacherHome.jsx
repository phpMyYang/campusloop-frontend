import React from "react";

const TeacherHome = () => {
  return (
    <div>
      <h3 className="fw-bold mb-1" style={{ color: "var(--primary-color)" }}>
        News Feed
      </h3>
      <p className="text-muted small mb-4">
        Welcome back! Here are the latest updates.
      </p>

      <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
        <h4 className="text-muted">Home & Feed (Coming Soon)</h4>
        <p className="small text-muted mb-0">
          Dito gagawin ang Facebook-style global announcements at to-do list.
        </p>
      </div>
    </div>
  );
};
export default TeacherHome;

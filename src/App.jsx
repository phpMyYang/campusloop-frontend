import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sileo";
import axios from "axios";

import Login from "./pages/Auth/Login";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import EmailVerification from "./pages/Auth/EmailVerification";

// Taga-test kung valid pa ang session
const DashboardPlaceholder = ({ title }) => {
  const testSession = async () => {
    try {
      // Susubukan niyang kumuha ng data sa backend
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/user`,
      );
      alert("Session is still active! User: " + response.data.email);
    } catch (error) {
      // Kapag 401 Unauthorized (dahil nabura na yung token sa kabilang device),
      // automatic sasaluin ito ng interceptor sa main.jsx at iki-kick out ka!
      console.log("Session verified as expired.");
    }
  };

  return (
    <div className="text-center mt-5">
      <h1 style={{ color: "var(--primary-color)" }} className="fw-bold">
        {title} (Coming Soon)
      </h1>
      <p className="text-muted">
        Click the button below to simulate fetching data from the database.
      </p>
      <button
        onClick={testSession}
        className="btn btn-campusloop mt-3 shadow-sm px-4"
      >
        Test Single Session Connection
      </button>
    </div>
  );
};

function App() {
  return (
    <>
      <div className="dark">
        <Toaster theme="dark" position="top-right" />
      </div>

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify" element={<EmailVerification />} />

        {/* Placeholders for testing */}
        <Route
          path="/admin/dashboard"
          element={<DashboardPlaceholder title="Admin Dashboard" />}
        />
        <Route
          path="/teacher/home"
          element={<DashboardPlaceholder title="Teacher Home" />}
        />
        <Route
          path="/student/home"
          element={<DashboardPlaceholder title="Student Home" />}
        />

        <Route
          path="*"
          element={
            <h2 className="text-center mt-5 text-danger">
              404 - Page Not Found
            </h2>
          }
        />
      </Routes>
    </>
  );
}

export default App;

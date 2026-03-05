import React from "react";

const GlobalSpinner = ({ isLoading, text = "Loading" }) => {
  if (!isLoading) return null;

  // Para hindi maging doble ang tuldok kapag dinagdag natin yung animated dots sa tabi
  const cleanText = text.replace(/\.+$/, "");

  return (
    <div className="global-spinner-overlay">
      <div className="spinner-card shadow-lg">
        <img
          src="/images/spinner.svg"
          alt="Loading..."
          className="toga-spinner-image mb-3"
        />

        {/* Wrapper para magkahilera ang Text at ang Jumping Dots */}
        <div className="d-flex align-items-baseline justify-content-center">
          <h5 className="fw-bold m-0" style={{ color: "var(--primary-color)" }}>
            {cleanText}
          </h5>

          {/* Ang 3 Horizontal Jumping Dots */}
          <div className="jumping-dots ms-2">
            <div
              className="dot"
              style={{ backgroundColor: "var(--primary-color)" }}
            ></div>
            <div
              className="dot"
              style={{ backgroundColor: "var(--primary-color)" }}
            ></div>
            <div
              className="dot"
              style={{ backgroundColor: "var(--primary-color)" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSpinner;

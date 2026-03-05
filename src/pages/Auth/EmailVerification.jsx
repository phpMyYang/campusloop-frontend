import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { sileo } from "sileo";
import AuthLayout from "../../components/Layouts/AuthLayout";
import GlobalSpinner from "../../components/Shared/GlobalSpinner";

const darkToast = {
  fill: "#242424",
  styles: {
    title: "sileo-toast-title",
    description: "sileo-toast-desc",
  },
};

const EmailVerification = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const id = searchParams.get("id");
  const hash = searchParams.get("hash");
  const email = searchParams.get("email");

  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const hasAttemptedVerification = useRef(false);

  useEffect(() => {
    const verifyAccount = async () => {
      if (hasAttemptedVerification.current) return;
      hasAttemptedVerification.current = true;

      setIsVerifying(true);

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/verify-email`,
          { id: id, hash: hash },
        );

        sileo.success({
          title: "Account Verified",
          description:
            response.data.message ||
            "Account successfully verified and activated!",
          ...darkToast,
        });

        setTimeout(() => navigate("/login"), 2000);
      } catch (error) {
        sileo.error({
          title: "Verification Failed",
          description:
            error.response?.data?.message ||
            "Invalid or expired verification link.",
          ...darkToast,
        });
      } finally {
        setIsVerifying(false);
      }
    };

    if (id && hash) {
      verifyAccount();
    }
  }, [id, hash, navigate]);

  const handleResend = async () => {
    if (!email) {
      sileo.error({
        title: "Email Missing",
        description: "Email address is missing. Please log in again.",
        ...darkToast,
      });
      return navigate("/login");
    }

    setIsResending(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/resend-verification`,
        { email: email },
      );

      sileo.success({
        title: "Email Sent",
        description:
          response.data.message || "Verification email sent successfully.",
        ...darkToast,
      });
    } catch (error) {
      sileo.error({
        title: "Request Failed",
        description:
          error.response?.data?.message ||
          "Failed to send verification email. Please try again.",
        ...darkToast,
      });
    } finally {
      setIsResending(false);
    }
  };

  if (id && hash) {
    return (
      <>
        <GlobalSpinner isLoading={isVerifying} text="Verifying Account..." />
        <AuthLayout illustration="/images/verify.svg">
          <div
            className="text-center w-100"
            style={{ maxWidth: "400px", margin: "0 auto" }}
          >
            <h2
              className="fw-bold mb-3"
              style={{ color: "var(--primary-color)" }}
            >
              Verifying Account
            </h2>
            <p className="text-muted">
              {isVerifying
                ? "Please wait..."
                : "Verification process complete. Redirecting..."}
            </p>
          </div>
        </AuthLayout>
      </>
    );
  }

  return (
    <>
      <GlobalSpinner isLoading={isResending} text="Sending Email..." />
      <AuthLayout illustration="/images/verify.svg">
        <div
          className="w-100 text-center"
          style={{ maxWidth: "400px", margin: "0 auto" }}
        >
          <div className="mb-4">
            <h2 className="fw-bold" style={{ color: "var(--primary-color)" }}>
              Verify Your Email
            </h2>
            <p className="text-muted mt-2">
              You need to verify your email address before you can access the
              dashboard.
            </p>
            {email && (
              <p className="fw-medium text-dark bg-light p-2 rounded border">
                {email}
              </p>
            )}
          </div>

          <div
            className="mb-4 text-start text-muted"
            style={{ fontSize: "0.9rem" }}
          >
            <p>
              We've sent a verification link to your email address. Please check
              your inbox and click the link to activate your account.
            </p>
            <p>
              If you don't see the email, check your spam folder or click the
              button below to resend.
            </p>
          </div>

          <button
            onClick={handleResend}
            className="btn btn-campusloop btn-lg w-100 rounded-3 mb-3 d-flex justify-content-center align-items-center"
            disabled={isResending}
          >
            Resend Verification Email
          </button>

          <div>
            <Link
              to="/login"
              style={{
                color: "var(--primary-color)",
                fontWeight: "500",
                textDecoration: "none",
              }}
            >
              Back to Login
            </Link>
          </div>
        </div>
      </AuthLayout>
    </>
  );
};

export default EmailVerification;

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AuthCard from "../../components/osakue/AuthCard.jsx";
import { forgotPassword } from "../../services/auth.service.js";
import "./ForgotPassword.css";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [invalid, setInvalid] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentAgain, setSentAgain] = useState(false);

  useEffect(() => {
    if (!sentAgain) return undefined;
    const timer = setTimeout(() => setSentAgain(false), 4000);
    return () => clearTimeout(timer);
  }, [sentAgain]);

  async function request(again) {
    setSubmitting(true);
    setError("");
    setSentAgain(false);
    try {
      await forgotPassword(email.trim());
      setSent(true);
      if (again) setSentAgain(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!EMAIL_PATTERN.test(email.trim())) {
      setInvalid("Enter a valid email address.");
      return;
    }
    setInvalid("");
    request(false);
  }

  if (sent) {
    return (
      <AuthCard
        title="Check your email"
        subtitle="If that email exists, we sent a link to set a new password. The link works for one hour."
      >
        <Link to="/login" className="btn btn-primary auth-submit">
          Back to log in
        </Link>
        <p className="auth-footer">
          <button
            type="button"
            className="auth-muted-link"
            onClick={() => request(true)}
            disabled={submitting}
          >
            {submitting ? "Sending" : "Send it again"}
          </button>
        </p>
        {sentAgain && (
          <p className="auth-note" role="status">
            Sent again.
          </p>
        )}
        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Forgot your password?"
      subtitle="Enter your email and we will send you a link to set a new one."
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="auth-field">
          <label htmlFor="forgot-email" className="form-label">
            Email
          </label>
          <input
            id="forgot-email"
            type="email"
            className={`form-control${invalid ? " is-invalid" : ""}`}
            placeholder="Enter your email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          {invalid && <div className="invalid-feedback">{invalid}</div>}
        </div>
        <button type="submit" className="btn btn-primary auth-submit" disabled={submitting}>
          {submitting ? "Sending" : "Send reset link"}
        </button>
        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}
      </form>
      <p className="auth-footer">
        <Link to="/login">Back to log in</Link>
      </p>
    </AuthCard>
  );
}

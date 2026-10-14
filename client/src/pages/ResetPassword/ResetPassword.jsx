import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
import AuthCard from "../../components/osakue/AuthCard.jsx";
import { resetPassword } from "../../services/auth.service.js";
import "./ResetPassword.css";

const EXPIRED_MESSAGE = "This reset link is invalid or has expired. Ask for a new one.";

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expired, setExpired] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const found = {};
    if (password.length < 8) found.password = "At least 8 characters.";
    if (confirm !== password) found.confirm = "The two passwords do not match.";
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    setError("");
    try {
      await resetPassword(token, password);
      setSaved(true);
    } catch (err) {
      if (err.message === EXPIRED_MESSAGE) setExpired(true);
      else setError(err.message || "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (saved) {
    return (
      <AuthCard
        icon={<FiCheck />}
        title="Password updated"
        subtitle="You can log in with your new password now."
      >
        <Link to="/login" className="btn btn-primary auth-submit">
          Log in
        </Link>
      </AuthCard>
    );
  }

  if (expired) {
    return (
      <AuthCard title="Link expired" subtitle={EXPIRED_MESSAGE}>
        <Link to="/forgot-password" className="btn btn-primary auth-submit">
          Request a new link
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Set a new password"
      subtitle="Choose a password you have not used on this site before."
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="auth-field">
          <label htmlFor="reset-password" className="form-label">
            New password
          </label>
          <input
            id="reset-password"
            type="password"
            className={`form-control${errors.password ? " is-invalid" : ""}`}
            placeholder="Enter your new password"
            autoComplete="new-password"
            aria-describedby="reset-password-help"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {errors.password ? (
            <div className="invalid-feedback">{errors.password}</div>
          ) : (
            <div id="reset-password-help" className="form-text">
              At least 8 characters
            </div>
          )}
        </div>
        <div className="auth-field">
          <label htmlFor="reset-confirm" className="form-label">
            Confirm new password
          </label>
          <input
            id="reset-confirm"
            type="password"
            className={`form-control${errors.confirm ? " is-invalid" : ""}`}
            placeholder="Enter your new password"
            autoComplete="new-password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
          />
          {errors.confirm && <div className="invalid-feedback">{errors.confirm}</div>}
        </div>
        <button type="submit" className="btn btn-primary auth-submit" disabled={submitting}>
          {submitting ? "Saving" : "Save new password"}
        </button>
        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}
      </form>
    </AuthCard>
  );
}

import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import AuthCard from "../../components/osakue/AuthCard.jsx";
import Loader from "../../components/shared/Loader.jsx";
import Turnstile from "../../components/shared/Turnstile.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import "./Register.css";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function safeNext(next) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export default function Register() {
  const { user, loading, register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get("next");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [resetKey, setResetKey] = useState(0);

  if (loading) return <Loader label="Checking your account" />;
  if (user && !submitting) return <Navigate to="/" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    const found = {};
    if (!name.trim()) found.name = "Enter your name.";
    if (!EMAIL_PATTERN.test(email.trim())) found.email = "Enter a valid email address.";
    if (password.length < 8) found.password = "At least 8 characters.";
    setErrors(found);
    if (Object.keys(found).length) return;
    if (!turnstileToken) return;

    setSubmitting(true);
    setError("");
    try {
      const data = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        turnstileToken,
      });
      const sentTo = encodeURIComponent(data.email || email.trim());
      const target = safeNext(next);
      const nextPart = target === "/" ? "" : `&next=${encodeURIComponent(target)}`;
      navigate(`/verify-email?email=${sentTo}${nextPart}`);
    } catch (err) {
      setError(err.message || "Something went wrong. Try again.");
      setTurnstileToken("");
      setResetKey((key) => key + 1);
      setSubmitting(false);
    }
  }

  const loginLink = next ? `/login?next=${encodeURIComponent(next)}` : "/login";
  const filled = Boolean(name.trim() && email.trim() && password);
  const needsTick = filled && !turnstileToken;

  return (
    <AuthCard
      title="Create your account"
      subtitle="Save favourites, keep your search history and get recommendations."
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="auth-field">
          <label htmlFor="register-name" className="form-label">
            Name
          </label>
          <input
            id="register-name"
            type="text"
            className={`form-control${errors.name ? " is-invalid" : ""}`}
            placeholder="Enter your name"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
        </div>
        <div className="auth-field">
          <label htmlFor="register-email" className="form-label">
            Email
          </label>
          <input
            id="register-email"
            type="email"
            className={`form-control${errors.email ? " is-invalid" : ""}`}
            placeholder="Enter your email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          {errors.email && <div className="invalid-feedback">{errors.email}</div>}
        </div>
        <div className="auth-field">
          <label htmlFor="register-password" className="form-label">
            Password
          </label>
          <input
            id="register-password"
            type="password"
            className={`form-control${errors.password ? " is-invalid" : ""}`}
            placeholder="Enter your password"
            autoComplete="new-password"
            aria-describedby="register-password-help"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {errors.password ? (
            <div className="invalid-feedback">{errors.password}</div>
          ) : (
            <div id="register-password-help" className="form-text">
              At least 8 characters
            </div>
          )}
        </div>
        <div className="auth-field">
          <Turnstile onToken={setTurnstileToken} resetKey={resetKey} />
        </div>
        <button
          type="submit"
          className="btn btn-primary auth-submit"
          disabled={submitting || !filled || !turnstileToken}
        >
          {submitting ? "Sending the code" : "Create account"}
        </button>
        {needsTick && <p className="auth-note">Tick the security check to continue.</p>}
        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}
      </form>
      <p className="auth-footer">
        Already have an account? <Link to={loginLink}>Log in</Link>
      </p>
    </AuthCard>
  );
}

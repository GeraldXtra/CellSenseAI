import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import AuthCard from "../../components/osakue/AuthCard.jsx";
import Loader from "../../components/shared/Loader.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import "./Login.css";

function safeNext(next) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export default function Login() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get("next");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <Loader label="Checking your account" />;
  if (user && !submitting) return <Navigate to="/" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    const found = {};
    if (!email.trim()) found.email = "Enter your email.";
    if (!password) found.password = "Enter your password.";
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    setError("");
    try {
      await login({ email: email.trim(), password });
      navigate(safeNext(next), { replace: true });
    } catch (err) {
      setError(err.message || "Something went wrong. Try again.");
      setSubmitting(false);
    }
  }

  const registerLink = next ? `/register?next=${encodeURIComponent(next)}` : "/register";

  return (
    <AuthCard title="Log in" subtitle="Your favourites and history are saved to your account.">
      <form onSubmit={handleSubmit} noValidate>
        <div className="auth-field">
          <label htmlFor="login-email" className="form-label">
            Email
          </label>
          <input
            id="login-email"
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
          <label htmlFor="login-password" className="form-label">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            className={`form-control${errors.password ? " is-invalid" : ""}`}
            placeholder="Enter your password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {errors.password && <div className="invalid-feedback">{errors.password}</div>}
          <div className="auth-forgot">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
        </div>
        <button type="submit" className="btn btn-primary auth-submit" disabled={submitting}>
          {submitting ? "Logging in" : "Log in"}
        </button>
        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}
      </form>
      <p className="auth-footer">
        New here? <Link to={registerLink}>Create an account</Link>
      </p>
    </AuthCard>
  );
}

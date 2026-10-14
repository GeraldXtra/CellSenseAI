import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { FiCheckCircle } from "react-icons/fi";
import Loader from "../../components/shared/Loader.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { resendCode } from "../../services/auth.service.js";
import "./VerifyEmail.css";

const LENGTH = 6;
const RESEND_SECONDS = 60;
const EMPTY = Array.from({ length: LENGTH }, () => "");

const BAD_CODE = "Enter the 6 digit code from the email";
const CODE_EXPIRED = "This code has expired. Ask for a new one.";
const TOO_MANY = "Too many wrong codes. Ask for a new code.";
const SIGNUP_EXPIRED = "This sign up has expired. Create your account again.";
const WRONG_CODE = /^That code is not right\. You have \d+ (try|tries) left\.$/;
const WAIT = /^Wait (\d+) seconds before asking for another code\.$/;

function safeNext(next) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

function formatWait(seconds) {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function VerifyEmail() {
  const { user, loading, verifyEmail } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = (searchParams.get("email") || "").trim();
  const next = searchParams.get("next");
  const [digits, setDigits] = useState(EMPTY);
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [locked, setLocked] = useState(false);
  const [expired, setExpired] = useState(false);
  const [message, setMessage] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const boxes = useRef([]);

  useEffect(() => {
    const previous = document.title;
    document.title = "Check your email | CellSense AI";
    return () => {
      document.title = previous;
    };
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) return undefined;
    const timer = setTimeout(() => setSecondsLeft((current) => current - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const nextQuery = next ? `?next=${encodeURIComponent(next)}` : "";
  const registerLink = `/register${nextQuery}`;

  if (loading) return <Loader label="Checking your account" />;
  if (!email) return <Navigate to={registerLink} replace />;
  if (user && !checking) return <Navigate to="/" replace />;

  const code = digits.join("");
  const complete = code.length === LENGTH;

  function focusBox(index) {
    const box = boxes.current[Math.min(Math.max(index, 0), LENGTH - 1)];
    if (box) {
      box.focus();
      box.select();
    }
  }

  function setDigit(index, value) {
    setDigits((current) => current.map((digit, place) => (place === index ? value : digit)));
  }

  function fill(index, found) {
    const start = found.length >= LENGTH ? 0 : index;
    const part = found.slice(0, LENGTH - start);
    setDigits((current) =>
      current.map((digit, place) =>
        place >= start && place < start + part.length ? part[place - start] : digit,
      ),
    );
    focusBox(start + part.length);
  }

  function handleChange(index, event) {
    const value = event.target.value;
    const found = value.replace(/\D/g, "");
    if (!found) {
      setDigit(index, "");
      return;
    }
    if (found.length === 1) {
      if (found === digits[index] && value !== found) return;
      setDigit(index, found);
      focusBox(index + 1);
      return;
    }
    if (found.length === 2 && digits[index]) {
      const caret = event.target.selectionStart ?? value.length;
      setDigit(index, caret <= 1 ? found[0] : found[1]);
      focusBox(index + 1);
      return;
    }
    fill(index, found);
  }

  function handleKeyDown(index, event) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      event.preventDefault();
      setDigit(index - 1, "");
      focusBox(index - 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusBox(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      focusBox(index + 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusBox(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusBox(LENGTH - 1);
    }
  }

  function handlePaste(index, event) {
    event.preventDefault();
    const found = event.clipboardData.getData("text").replace(/\D/g, "");
    if (found) fill(index, found);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!complete || checking || locked || expired) return;
    setChecking(true);
    setMessage(null);
    try {
      await verifyEmail({ email, code });
      navigate(safeNext(next), { replace: true });
    } catch (err) {
      const text = err.message || "Something went wrong. Try again.";
      setMessage({ kind: "error", text });
      setChecking(false);
      if (text === TOO_MANY) setLocked(true);
      if (text === SIGNUP_EXPIRED) setExpired(true);
      if (WRONG_CODE.test(text) || [BAD_CODE, CODE_EXPIRED, TOO_MANY].includes(text)) {
        setDigits(EMPTY);
        focusBox(0);
      }
    }
  }

  async function handleResend() {
    if (resending || secondsLeft > 0 || expired) return;
    setResending(true);
    setMessage(null);
    try {
      const data = await resendCode(email);
      setSecondsLeft(Number(data && data.resendAfterSeconds) || RESEND_SECONDS);
      setLocked(false);
      setDigits(EMPTY);
      setMessage({ kind: "success", text: `We sent a new code to ${email}.` });
      focusBox(0);
    } catch (err) {
      const text = err.message || "Something went wrong. Try again.";
      setMessage({ kind: "error", text });
      const wait = WAIT.exec(text);
      if (wait) setSecondsLeft(Number(wait[1]));
      if (text === SIGNUP_EXPIRED) setExpired(true);
    } finally {
      setResending(false);
    }
  }

  let resendLabel = "Send a new code";
  if (resending) resendLabel = "Sending a new code";
  else if (secondsLeft > 0) resendLabel = `You can ask for a new code in ${formatWait(secondsLeft)}`;

  return (
    <section className="cs-section cs-section-alt verify-page">
      <div className="cs-container">
        <div className="cs-card verify-card">
          <h1 className="cs-heading verify-title">Check your email</h1>
          <p className="cs-subheading verify-subtitle">
            We sent a 6 digit code to {email}. Enter it below to finish creating your account.
          </p>
          <form onSubmit={handleSubmit} noValidate>
            <fieldset className="verify-fieldset">
              <legend className="visually-hidden">The 6 digit code from the email</legend>
              <div className="verify-digits">
                {digits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(element) => {
                      boxes.current[index] = element;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    autoFocus={index === 0}
                    aria-label={`Digit ${index + 1} of ${LENGTH}`}
                    className="form-control verify-digit"
                    value={digit}
                    readOnly={checking}
                    onChange={(event) => handleChange(index, event)}
                    onKeyDown={(event) => handleKeyDown(index, event)}
                    onPaste={(event) => handlePaste(index, event)}
                    onFocus={(event) => event.target.select()}
                  />
                ))}
              </div>
            </fieldset>
            <div className="verify-message-area" role="status" aria-live="polite">
              {message && (
                <p className={`verify-message verify-message-${message.kind}`}>
                  {message.kind === "success" && <FiCheckCircle aria-hidden="true" />}
                  <span>{message.text}</span>
                </p>
              )}
              {expired && (
                <p className="verify-again">
                  <Link to={registerLink}>Create your account again</Link>
                </p>
              )}
            </div>
            <button
              type="submit"
              className="btn btn-primary verify-submit"
              disabled={!complete || checking || locked || expired}
            >
              {checking ? "Checking" : "Verify email"}
            </button>
          </form>
          <p className="verify-note">The code works for 10 minutes.</p>
          <p className="verify-note">
            Didn't get it?{" "}
            <button
              type="button"
              className="verify-resend"
              onClick={handleResend}
              disabled={resending || secondsLeft > 0 || expired}
            >
              {resendLabel}
            </button>
          </p>
          <p className="verify-footer">
            <Link to={registerLink}>Use a different email</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

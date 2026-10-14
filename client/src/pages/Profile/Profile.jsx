import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import {
  FiCheck,
  FiCheckCircle,
  FiChevronRight,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMinus,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import {
  changePassword,
  clearRecentlyViewed,
  clearSearchHistory,
  deleteAccount,
  getProfile,
  signOutOthers,
  updateProfile,
} from "../../services/users.service.js";
import Loader from "../../components/shared/Loader.jsx";
import EmptyState from "../../components/shared/EmptyState.jsx";
import "./Profile.css";

const NAME_MESSAGE = "Enter a name between 2 and 60 characters";
const DELETE_MESSAGE = "Enter your password to delete your account";
const FALLBACK = "Something went wrong. Try again.";

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function countText(count, one, many, none) {
  if (!count) return none;
  return `${count} ${count === 1 ? one : many}`;
}

function Feedback({ message }) {
  return (
    <div className="profile-feedback" role="status" aria-live="polite">
      {message && (
        <p className={`profile-message profile-message-${message.kind}`}>
          {message.kind === "success" && <FiCheckCircle aria-hidden="true" />}
          <span>{message.text}</span>
        </p>
      )}
    </div>
  );
}

function PasswordField({ id, label, value, onChange, autoComplete, describedBy, disabled }) {
  const [shown, setShown] = useState(false);
  const name = label.toLowerCase();

  return (
    <div className="profile-field">
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      <div className="profile-input-wrap">
        <input
          id={id}
          type={shown ? "text" : "password"}
          className="form-control"
          autoComplete={autoComplete}
          aria-describedby={describedBy}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          type="button"
          className="profile-eye"
          aria-label={shown ? `Hide ${name}` : `Show ${name}`}
          onClick={() => setShown((current) => !current)}
        >
          {shown ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
}

function Rule({ met, children }) {
  return (
    <li className={met ? "profile-rule profile-rule-met" : "profile-rule"}>
      {met ? <FiCheck aria-hidden="true" /> : <FiMinus aria-hidden="true" />}
      <span className="visually-hidden">{met ? "Done: " : "Not yet: "}</span>
      <span>{children}</span>
    </li>
  );
}

export default function Profile() {
  const { user, applySession, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const { data, loading, error, reload } = useAsync(() => getProfile(), []);
  const [local, setLocal] = useState(null);
  const [busy, setBusy] = useState("");
  const [confirm, setConfirm] = useState("");
  const [messages, setMessages] = useState({});
  const [nameDraft, setNameDraft] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const askButtons = useRef({});
  const deleteField = useRef(null);

  useEffect(() => {
    const previous = document.title;
    document.title = "Your profile | CellSense AI";
    return () => {
      document.title = previous;
    };
  }, []);

  const profile = local || data;
  const working = Boolean(busy);
  const signedInAs = (user && user.name) || (profile && profile.user.name) || "you";

  function patch(change) {
    setLocal((current) => change(current || data));
  }

  function say(section, kind, text) {
    setMessages((current) => ({ ...current, [section]: text ? { kind, text } : null }));
  }

  function ask(kind) {
    setMessages((current) => ({ ...current, privacy: null, delete: null }));
    setConfirm(kind);
  }

  function cancel() {
    const kind = confirm;
    flushSync(() => setConfirm(""));
    const button = askButtons.current[kind];
    if (button) button.focus();
  }

  async function handleSaveName(event) {
    event.preventDefault();
    const name = (nameDraft ?? profile.user.name).trim();
    if (working || name === profile.user.name || name.length < 2 || name.length > 60) return;
    setBusy("name");
    say("name");
    try {
      const result = await updateProfile({ name });
      updateUser(result.user);
      patch((current) => ({ ...current, user: { ...current.user, name: result.user.name } }));
      setNameDraft(null);
      say("name", "success", "Your name was saved.");
    } catch (err) {
      say("name", "error", err.message || FALLBACK);
    } finally {
      setBusy("");
    }
  }

  async function handleChangePassword(event) {
    event.preventDefault();
    if (working || !passwordReady) return;
    setBusy("password");
    say("password");
    try {
      const result = await changePassword({ currentPassword, newPassword });
      applySession(result);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      patch((current) => ({
        ...current,
        user: { ...current.user, passwordChangedAt: new Date().toISOString() },
      }));
      say(
        "password",
        "success",
        "Your password was changed. Your other devices have been logged out.",
      );
    } catch (err) {
      say("password", "error", err.message || FALLBACK);
    } finally {
      setBusy("");
    }
  }

  async function runPrivacy(kind) {
    if (working) return;
    setBusy(kind);
    say("privacy");
    try {
      if (kind === "history") {
        await clearSearchHistory();
        patch((current) => ({ ...current, counts: { ...current.counts, searchHistory: 0 } }));
        say("privacy", "success", "Your search history was cleared.");
      } else if (kind === "viewed") {
        await clearRecentlyViewed();
        patch((current) => ({ ...current, counts: { ...current.counts, recentlyViewed: 0 } }));
        say("privacy", "success", "Your recently viewed phones were cleared.");
      } else {
        const result = await signOutOthers();
        applySession(result);
        say("privacy", "success", "Your other devices have been logged out.");
      }
    } catch (err) {
      say("privacy", "error", err.message || FALLBACK);
    } finally {
      setConfirm("");
      setBusy("");
    }
  }

  function handleAskDelete(event) {
    event.preventDefault();
    if (working) return;
    if (!deletePassword) {
      say("delete", "error", DELETE_MESSAGE);
      if (deleteField.current) deleteField.current.focus();
      return;
    }
    ask("delete");
  }

  async function handleDelete() {
    if (working) return;
    setBusy("delete");
    say("delete");
    try {
      await deleteAccount(deletePassword);
      logout();
      navigate("/", { replace: true });
    } catch (err) {
      say("delete", "error", err.message || FALLBACK);
      setConfirm("");
      setBusy("");
    }
  }

  const longEnough = newPassword.length >= 8;
  const different = Boolean(currentPassword && newPassword && newPassword !== currentPassword);
  const matches = Boolean(newPassword && newPassword === confirmPassword);
  const passwordReady = longEnough && different && matches;

  function renderPrivacyActions(kind, label, confirmLabel, busyLabel, empty) {
    if (confirm === kind) {
      return (
        <div className="profile-confirm">
          <button
            type="button"
            className="btn btn-primary profile-small"
            onClick={() => runPrivacy(kind)}
            disabled={working}
            autoFocus
          >
            {busy === kind ? busyLabel : confirmLabel}
          </button>
          <button
            type="button"
            className="btn btn-outline-primary profile-small"
            onClick={cancel}
            disabled={working}
          >
            Cancel
          </button>
        </div>
      );
    }
    return (
      <button
        type="button"
        ref={(element) => {
          askButtons.current[kind] = element;
        }}
        className="btn btn-outline-primary profile-small"
        onClick={() => ask(kind)}
        disabled={working || empty}
        aria-label={label}
      >
        {kind === "others" ? "Log out" : "Clear"}
      </button>
    );
  }

  function renderContent() {
    if (loading && !profile) return <Loader label="Loading your profile" />;
    if (error || !profile) {
      return (
        <EmptyState
          title="We could not load your profile"
          message={error}
          action={
            <button type="button" className="btn btn-outline-primary" onClick={reload}>
              Try again
            </button>
          }
        />
      );
    }

    const account = profile.user;
    const counts = profile.counts;
    const nameValue = nameDraft ?? account.name;
    const trimmedName = nameValue.trim();
    const nameValid = trimmedName.length >= 2 && trimmedName.length <= 60;
    const nameChanged = trimmedName !== account.name;
    const showNameProblem = nameDraft !== null && !nameValid;
    const initial = (Array.from(account.name.trim())[0] || "?").toUpperCase();
    const emailHelp = account.emailVerified
      ? "profile-email-verified profile-email-help"
      : "profile-email-help";

    return (
      <div className="profile-layout">
        <aside className="cs-card profile-summary" aria-label="Account summary">
          <div className="profile-avatar" aria-hidden="true">
            {initial}
          </div>
          <h2 className="profile-name">{account.name}</h2>
          <p className="profile-email">{account.email}</p>
          <p className="profile-since">Member since {formatDate(account.createdAt)}</p>
          <dl className="profile-stats">
            <div className="profile-stat">
              <dt>Favourites</dt>
              <dd>{counts.favourites}</dd>
            </div>
            <div className="profile-stat">
              <dt>Reviews written</dt>
              <dd>{counts.reviews}</dd>
            </div>
            <div className="profile-stat">
              <dt>Searches</dt>
              <dd>{counts.searchHistory}</dd>
            </div>
          </dl>
          <Link to="/dashboard" className="cs-link-chevron profile-dashboard-link">
            Open your dashboard
            <FiChevronRight aria-hidden="true" />
          </Link>
        </aside>

        <div className="profile-main">
          <section className="cs-card profile-card" aria-labelledby="profile-details-title">
            <h2 id="profile-details-title" className="profile-card-title">
              Your details
            </h2>
            <form onSubmit={handleSaveName} noValidate>
              <label htmlFor="profile-name" className="form-label">
                Name
              </label>
              <div className="profile-name-row">
                <input
                  id="profile-name"
                  type="text"
                  className={`form-control${showNameProblem ? " is-invalid" : ""}`}
                  autoComplete="name"
                  aria-invalid={showNameProblem}
                  aria-describedby={showNameProblem ? "profile-name-problem" : undefined}
                  value={nameValue}
                  onChange={(event) => setNameDraft(event.target.value)}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={working || !nameChanged || !nameValid}
                >
                  {busy === "name" ? "Saving" : "Save name"}
                </button>
              </div>
              {showNameProblem && (
                <p id="profile-name-problem" className="profile-field-error">
                  {NAME_MESSAGE}
                </p>
              )}
              <Feedback message={messages.name} />
            </form>

            <div className="profile-field profile-email-field">
              <div className="profile-label-row">
                <label htmlFor="profile-email" className="form-label">
                  Email
                </label>
                {account.emailVerified && (
                  <span id="profile-email-verified" className="profile-tag">
                    Verified
                    <FiCheck aria-hidden="true" />
                  </span>
                )}
              </div>
              <div className="profile-input-wrap">
                <input
                  id="profile-email"
                  type="email"
                  className="form-control profile-readonly"
                  value={account.email}
                  readOnly
                  aria-readonly="true"
                  aria-describedby={emailHelp}
                />
                <FiLock className="profile-lock" aria-hidden="true" />
              </div>
              <p id="profile-email-help" className="form-text profile-help">
                Your email is how you log in, so it can't be changed.
              </p>
            </div>
          </section>

          <section className="cs-card profile-card" aria-labelledby="profile-password-title">
            <h2 id="profile-password-title" className="profile-card-title">
              Change password
            </h2>
            {account.passwordChangedAt && (
              <p className="profile-card-sub">Last changed {formatDate(account.passwordChangedAt)}</p>
            )}
            <form onSubmit={handleChangePassword} noValidate>
              <PasswordField
                id="profile-current-password"
                label="Current password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={setCurrentPassword}
                disabled={busy === "password"}
              />
              <PasswordField
                id="profile-new-password"
                label="New password"
                autoComplete="new-password"
                describedBy="profile-password-rules"
                value={newPassword}
                onChange={setNewPassword}
                disabled={busy === "password"}
              />
              <PasswordField
                id="profile-confirm-password"
                label="Confirm new password"
                autoComplete="new-password"
                describedBy="profile-password-rules"
                value={confirmPassword}
                onChange={setConfirmPassword}
                disabled={busy === "password"}
              />
              <ul id="profile-password-rules" className="profile-rules">
                <Rule met={longEnough}>At least 8 characters</Rule>
                <Rule met={different}>Different from your current password</Rule>
                <Rule met={matches}>Both new passwords match</Rule>
              </ul>
              <button
                type="submit"
                className="btn btn-primary profile-submit"
                disabled={working || !passwordReady}
              >
                {busy === "password" ? "Updating password" : "Update password"}
              </button>
              <Feedback message={messages.password} />
              <p className="form-text profile-help">
                Changing your password logs you out on your other devices.
              </p>
            </form>
          </section>

          <section className="cs-card profile-card" aria-labelledby="profile-privacy-title">
            <h2 id="profile-privacy-title" className="profile-card-title">
              Privacy
            </h2>
            <ul className="profile-rows">
              <li className="profile-row">
                <div className="profile-row-text">
                  <p className="profile-row-title">Search history</p>
                  <p className="profile-row-detail">
                    {countText(counts.searchHistory, "search saved", "searches saved", "No searches saved")}
                  </p>
                </div>
                {renderPrivacyActions(
                  "history",
                  "Clear search history",
                  "Yes, clear",
                  "Clearing",
                  !counts.searchHistory,
                )}
              </li>
              <li className="profile-row">
                <div className="profile-row-text">
                  <p className="profile-row-title">Recently viewed</p>
                  <p className="profile-row-detail">
                    {countText(counts.recentlyViewed, "phone", "phones", "No phones")}
                  </p>
                </div>
                {renderPrivacyActions(
                  "viewed",
                  "Clear recently viewed",
                  "Yes, clear",
                  "Clearing",
                  !counts.recentlyViewed,
                )}
              </li>
              <li className="profile-row">
                <div className="profile-row-text">
                  <p className="profile-row-title">Other devices</p>
                  <p className="profile-row-detail">Log out everywhere except here</p>
                </div>
                {renderPrivacyActions(
                  "others",
                  "Log out other devices",
                  "Yes, log them out",
                  "Logging out",
                  false,
                )}
              </li>
            </ul>
            <Feedback message={messages.privacy} />
          </section>

          <section className="cs-card profile-card" aria-labelledby="profile-delete-title">
            <h2 id="profile-delete-title" className="profile-card-title">
              Delete account
            </h2>
            <p className="profile-card-text">
              This removes your account, your favourites, your history and your reviews. It cannot
              be undone.
            </p>
            <form onSubmit={handleAskDelete} noValidate>
              <label htmlFor="profile-delete-password" className="form-label">
                Password
              </label>
              <input
                ref={deleteField}
                id="profile-delete-password"
                type="password"
                className="form-control"
                autoComplete="current-password"
                value={deletePassword}
                disabled={busy === "delete"}
                onChange={(event) => setDeletePassword(event.target.value)}
              />
              {confirm === "delete" ? (
                <div className="profile-confirm profile-submit">
                  <button
                    type="button"
                    className="btn profile-danger profile-danger-solid"
                    onClick={handleDelete}
                    disabled={working}
                    autoFocus
                  >
                    {busy === "delete" ? "Deleting your account" : "Yes, delete my account"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={cancel}
                    disabled={working}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="submit"
                  ref={(element) => {
                    askButtons.current.delete = element;
                  }}
                  className="btn profile-danger profile-submit"
                  disabled={working}
                >
                  Delete my account
                </button>
              )}
              <Feedback message={messages.delete} />
            </form>
          </section>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="cs-section profile-intro">
        <div className="cs-container">
          <h1 className="cs-heading">Your profile</h1>
          <p className="cs-subheading">
            Signed in as {signedInAs}. Only you can see this page.
          </p>
        </div>
      </section>

      <section className="cs-section cs-section-alt profile-band">
        <div className="cs-container">{renderContent()}</div>
      </section>
    </>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowDown, FiArrowUp, FiCheckCircle, FiChevronRight } from "react-icons/fi";
import { useAsync } from "../../hooks/useAsync.js";
import { getAdminPhones, recordPrices } from "../../services/admin.service.js";
import PhoneImage, { phoneName } from "../../components/shared/PhoneImage.jsx";
import Loader from "../../components/shared/Loader.jsx";
import EmptyState from "../../components/shared/EmptyState.jsx";
import { checkedOnOrAfter, formatDay, formatPrice, localToday } from "../Admin/adminFormat.js";
import "../Admin/Admin.css";
import "./AdminPrices.css";

const DATE_MESSAGE = "Enter the date the prices were checked";
const FUTURE_MESSAGE = "The date checked can't be in the future";
const FALLBACK = "Something went wrong. Try again.";

function readPrice(value) {
  const text = String(value || "").trim();
  if (!text) return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : Number.NaN;
}

function dateProblem(day) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return DATE_MESSAGE;
  if (day > localToday()) return FUTURE_MESSAGE;
  return "";
}

function Change({ current, value }) {
  const price = readPrice(value);
  if (price === null || !current) {
    return (
      <span className="prices-change">
        <span aria-hidden="true">—</span>
        <span className="visually-hidden">No new price</span>
      </span>
    );
  }
  if (!(price > 0)) {
    return <span className="prices-change prices-change-bad">Not a price</span>;
  }
  const percent = ((price - current) / current) * 100;
  const text = `${percent > 0 ? "+" : ""}${percent.toFixed(1)}%`;
  if (percent <= -2) {
    return (
      <span className="prices-change prices-change-falling">
        <FiArrowDown aria-hidden="true" />
        {text}
      </span>
    );
  }
  return (
    <span className="prices-change">
      {percent >= 2 && <FiArrowUp aria-hidden="true" />}
      {text}
    </span>
  );
}

function plural(count, one, many) {
  return `${count} ${count === 1 ? one : many}`;
}

export default function AdminPrices() {
  const { data, loading, error, reload } = useAsync(() => getAdminPhones({ limit: 200 }), []);
  const [checkedOn, setCheckedOn] = useState(localToday);
  const [prices, setPrices] = useState({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const previous = document.title;
    document.title = "Record prices | CellSense AI";
    return () => {
      document.title = previous;
    };
  }, []);

  const items = (data && data.items) || [];
  const total = (data && data.total) || 0;
  const problem = dateProblem(checkedOn);

  const ready = {};
  for (const phone of items) {
    if (checkedOnOrAfter(phone, checkedOn)) continue;
    const price = readPrice(prices[phone.slug]);
    if (price > 0) ready[phone.slug] = price;
  }
  const count = Object.keys(ready).length;

  function setPrice(slug, value) {
    setPrices((current) => ({ ...current, [slug]: value }));
    setResult(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (busy || !count) return;
    if (problem) {
      setFormError(problem);
      return;
    }
    setBusy(true);
    setFormError("");
    setResult(null);
    try {
      const answer = await recordPrices({ checkedOn, prices: ready });
      setResult(answer);
      setPrices({});
      reload();
    } catch (err) {
      setFormError(err.message || FALLBACK);
    } finally {
      setBusy(false);
    }
  }

  function renderTable() {
    if (!data && loading) return <Loader label="Loading phones" />;
    if (error) {
      return (
        <EmptyState
          title="We could not load the phones"
          message={error}
          action={
            <button type="button" className="btn btn-outline-primary" onClick={reload}>
              Try again
            </button>
          }
        />
      );
    }
    if (!items.length) {
      return (
        <EmptyState
          title="No phones yet"
          message="Add a phone before you record its price."
          action={
            <Link to="/admin/phones/new" className="btn btn-primary">
              Add a phone
            </Link>
          }
        />
      );
    }

    return (
      <form className="admin-table-card prices-card" onSubmit={handleSubmit} noValidate aria-busy={loading}>
        <div className="cs-table-wrap">
          <table className="table admin-table prices-table">
            <thead>
              <tr>
                <th scope="col">Phone</th>
                <th scope="col">Current price</th>
                <th scope="col">Last checked</th>
                <th scope="col">New price</th>
                <th scope="col">Change</th>
              </tr>
            </thead>
            <tbody>
              {items.map((phone) => {
                const name = phoneName(phone);
                const done = checkedOnOrAfter(phone, checkedOn);
                const inputId = `prices-${phone.slug}`;
                return (
                  <tr key={phone.slug} className={done ? "prices-row-done" : undefined}>
                    <td>
                      <div className="admin-phone">
                        <div className="admin-thumb">
                          <PhoneImage phone={phone} />
                        </div>
                        <label htmlFor={inputId} className="admin-phone-name prices-name">
                          {name}
                        </label>
                      </div>
                    </td>
                    <td>
                      <span className="admin-price">{formatPrice(phone.price)}</span>
                    </td>
                    <td className="admin-soft admin-nowrap">
                      {formatDay(phone.price && phone.price.updatedAt)}
                    </td>
                    <td>
                      <div className="prices-input">
                        <span className="prices-dollar" aria-hidden="true">
                          $
                        </span>
                        <input
                          id={inputId}
                          type="text"
                          inputMode="decimal"
                          className="form-control"
                          value={done ? "" : prices[phone.slug] || ""}
                          disabled={done || busy}
                          aria-describedby={done ? `${inputId}-done` : undefined}
                          onChange={(event) => setPrice(phone.slug, event.target.value)}
                        />
                      </div>
                    </td>
                    <td>
                      {done ? (
                        <span id={`${inputId}-done`} className="prices-change">
                          Already checked
                        </span>
                      ) : (
                        <Change current={phone.price && phone.price.current} value={prices[phone.slug]} />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="prices-footer">
          <p className="admin-count">
            {plural(count, "new price", "new prices")}
            {total > items.length && ` · showing the first ${items.length} of ${total} phones`}
          </p>
          <div className="prices-buttons">
            <Link to="/admin" className="btn btn-outline-primary">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={busy || !count || Boolean(problem)}>
              {busy ? "Recording" : `Record ${plural(count, "price", "prices")}`}
            </button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <>
      <section className="cs-section prices-intro">
        <div className="cs-container">
          <nav className="prices-crumbs" aria-label="Breadcrumb">
            <Link to="/admin">Admin</Link>
            <FiChevronRight aria-hidden="true" />
            <span aria-current="page">Record prices</span>
          </nav>
          <h1 className="cs-heading">Record prices</h1>
          <p className="cs-subheading">
            Enter the guide price you checked for each phone. Phones you leave empty keep their price.
          </p>
        </div>
      </section>

      <section className="cs-section cs-section-alt prices-band">
        <div className="cs-container">
          <div className="cs-card prices-date">
            <label htmlFor="prices-checked-on" className="form-label">
              Checked on
            </label>
            <input
              id="prices-checked-on"
              type="date"
              className={`form-control${problem ? " is-invalid" : ""}`}
              value={checkedOn}
              max={localToday()}
              disabled={busy}
              aria-invalid={Boolean(problem)}
              aria-describedby="prices-checked-on-note"
              onChange={(event) => {
                setCheckedOn(event.target.value);
                setResult(null);
                setFormError("");
              }}
            />
            <p id="prices-checked-on-note" className="form-text prices-note">
              {problem || "A phone already checked on or after this date is skipped."}
            </p>
          </div>

          <div role="status" aria-live="polite">
            {result && (
              <p className="admin-notice prices-result">
                <FiCheckCircle aria-hidden="true" />
                <span>
                  {result.changed} changed, {result.unchanged} unchanged, {result.skipped} skipped
                  {result.notFound && result.notFound.length
                    ? `, ${result.notFound.length} not found`
                    : ""}
                </span>
              </p>
            )}
          </div>
          {formError && (
            <p className="prices-error" role="alert">
              {formError}
            </p>
          )}

          {renderTable()}
        </div>
      </section>
    </>
  );
}

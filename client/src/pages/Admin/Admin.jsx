import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  FiArrowDown,
  FiArrowUp,
  FiCheckCircle,
  FiChevronRight,
  FiMinus,
  FiPlus,
  FiSearch,
  FiX,
} from "react-icons/fi";
import { useAsync } from "../../hooks/useAsync.js";
import { getAdminPhones } from "../../services/admin.service.js";
import PhoneImage, { phoneName } from "../../components/shared/PhoneImage.jsx";
import Loader from "../../components/shared/Loader.jsx";
import EmptyState from "../../components/shared/EmptyState.jsx";
import { SOURCE_LABELS, categoryLabel, formatDay, formatPrice } from "./adminFormat.js";
import "./Admin.css";

const PAGE_SIZE = 20;

const SOURCE_OPTIONS = [
  { value: "", label: "All sources" },
  { value: "seed", label: SOURCE_LABELS.seed },
  { value: "ai", label: SOURCE_LABELS.ai },
  { value: "admin", label: SOURCE_LABELS.admin },
];

function pageNumbers(page, pages) {
  if (pages <= 7) return Array.from({ length: pages }, (_, index) => index + 1);
  const numbers = new Set([1, pages, page - 1, page, page + 1]);
  const sorted = [...numbers].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
  const list = [];
  sorted.forEach((n, index) => {
    if (index > 0 && n - sorted[index - 1] > 1) list.push(`gap-${n}`);
    list.push(n);
  });
  return list;
}

function Trend({ trend }) {
  if (trend === "falling") {
    return (
      <span className="admin-trend admin-trend-falling">
        <FiArrowDown aria-hidden="true" />
        Falling
      </span>
    );
  }
  if (trend === "rising") {
    return (
      <span className="admin-trend">
        <FiArrowUp aria-hidden="true" />
        Rising
      </span>
    );
  }
  if (trend === "stable") {
    return (
      <span className="admin-trend">
        <FiMinus aria-hidden="true" />
        Stable
      </span>
    );
  }
  return (
    <span className="admin-trend">
      <span aria-hidden="true">—</span>
      <span className="visually-hidden">Not enough price checks yet</span>
    </span>
  );
}

function plural(count, one, many) {
  return count === 1 ? one : many;
}

export default function Admin() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const q = searchParams.get("q") || "";
  const brand = searchParams.get("brand") || "";
  const source = searchParams.get("source") || "";
  const page = Math.max(1, Math.floor(Number(searchParams.get("page")) || 1));
  const key = searchParams.toString();

  const { data, loading, error, reload } = useAsync(
    () => getAdminPhones({ q, brand, source, page, limit: PAGE_SIZE }),
    [key],
  );

  const [text, setText] = useState(q);
  const [written, setWritten] = useState(q);
  const [seenQ, setSeenQ] = useState(q);
  const [notice, setNotice] = useState(() => (location.state && location.state.notice) || "");

  if (seenQ !== q) {
    setSeenQ(q);
    if (q !== written) {
      setText(q);
      setWritten(q);
    }
  }

  useEffect(() => {
    const previous = document.title;
    document.title = "Admin | CellSense AI";
    return () => {
      document.title = previous;
    };
  }, []);

  useEffect(() => {
    if (location.state && location.state.notice) {
      navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
    }
  }, [location, navigate]);

  useEffect(() => {
    const next = text.trim();
    if (next === q) return undefined;
    const timer = setTimeout(() => {
      setWritten(next);
      setSearchParams(
        (current) => {
          const params = new URLSearchParams(current);
          if (next) params.set("q", next);
          else params.delete("q");
          params.delete("page");
          return params;
        },
        { replace: true },
      );
    }, 300);
    return () => clearTimeout(timer);
  }, [text, q, setSearchParams]);

  function setParam(name, value) {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(name, value);
    else params.delete(name);
    params.delete("page");
    setSearchParams(params);
  }

  function goToPage(number) {
    const params = new URLSearchParams(searchParams);
    if (number > 1) params.set("page", String(number));
    else params.delete("page");
    setSearchParams(params);
  }

  function clearFilters() {
    setText("");
    setWritten("");
    setSearchParams({});
  }

  const counts = data && data.counts;
  const brands = (data && data.brands) || [];
  const items = (data && data.items) || [];
  const total = (data && data.total) || 0;
  const pages = (data && data.pages) || 1;
  const currentPage = (data && data.page) || page;
  const filtered = Boolean(q || brand || source);

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
      return filtered ? (
        <EmptyState
          title="No phones match"
          message="Try another name, brand or source."
          action={
            <button type="button" className="btn btn-primary" onClick={clearFilters}>
              Clear filters
            </button>
          }
        />
      ) : (
        <EmptyState
          title="No phones yet"
          message="Add the first phone to the list."
          action={
            <Link to="/admin/phones/new" className="btn btn-primary">
              Add a phone
            </Link>
          }
        />
      );
    }

    return (
      <>
        <div className="admin-table-card" aria-busy={loading}>
          <div className="cs-table-wrap">
            <table className="table admin-table">
              <thead>
                <tr>
                  <th scope="col">Phone</th>
                  <th scope="col">Category</th>
                  <th scope="col">Guide price</th>
                  <th scope="col">Last checked</th>
                  <th scope="col">Trend</th>
                  <th scope="col">Source</th>
                  <th scope="col">
                    <span className="visually-hidden">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((phone) => {
                  const name = phoneName(phone);
                  const estimated = phone.source === "ai";
                  return (
                    <tr key={phone.slug}>
                      <td>
                        <div className="admin-phone">
                          <div className="admin-thumb">
                            <PhoneImage phone={phone} />
                          </div>
                          <div className="admin-phone-text">
                            <span className="admin-phone-name">{name}</span>
                            <span className="admin-phone-brand">{phone.brand}</span>
                          </div>
                        </div>
                      </td>
                      <td className="admin-soft">{categoryLabel(phone.category)}</td>
                      <td>
                        <span className="admin-price">{formatPrice(phone.price)}</span>
                        {estimated && <span className="cs-estimated admin-estimated">Estimated</span>}
                      </td>
                      <td className="admin-soft admin-nowrap">
                        {formatDay(phone.price && phone.price.updatedAt)}
                      </td>
                      <td>
                        <Trend trend={phone.trend} />
                      </td>
                      <td className="admin-soft admin-nowrap">
                        {SOURCE_LABELS[phone.source] || phone.source}
                      </td>
                      <td className="admin-action">
                        <Link
                          to={`/admin/phones/${phone.slug}`}
                          className="cs-link-chevron admin-edit"
                          aria-label={`${estimated ? "Review" : "Edit"} ${name}`}
                        >
                          {estimated ? "Review" : "Edit"}
                          <FiChevronRight aria-hidden="true" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="admin-footer">
          <p className="admin-count">
            {items.length} of {total} {plural(total, "phone", "phones")}
          </p>
          {pages > 1 && (
            <nav className="admin-pages" aria-label="Pages">
              <button
                type="button"
                className="admin-page-step"
                disabled={currentPage <= 1}
                onClick={() => goToPage(currentPage - 1)}
              >
                Previous
              </button>
              {pageNumbers(currentPage, pages).map((item) =>
                typeof item === "number" ? (
                  <button
                    key={item}
                    type="button"
                    className={item === currentPage ? "admin-page admin-page-current" : "admin-page"}
                    aria-current={item === currentPage ? "page" : undefined}
                    aria-label={`Page ${item}`}
                    onClick={() => goToPage(item)}
                  >
                    {item}
                  </button>
                ) : (
                  <span key={item} className="admin-page-gap" aria-hidden="true">
                    …
                  </span>
                ),
              )}
              <button
                type="button"
                className="admin-page-step"
                disabled={currentPage >= pages}
                onClick={() => goToPage(currentPage + 1)}
              >
                Next
                <FiChevronRight aria-hidden="true" />
              </button>
            </nav>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <section className="cs-section admin-intro">
        <div className="cs-container">
          <h1 className="cs-heading">Admin</h1>
          <p className="cs-subheading">
            Add phones and record guide prices. Every price is saved with the date it was checked.
          </p>

          {notice && (
            <div className="admin-notice" role="status">
              <FiCheckCircle aria-hidden="true" />
              <span>{notice}</span>
              <button
                type="button"
                className="admin-notice-close"
                aria-label="Close the message"
                onClick={() => setNotice("")}
              >
                <FiX aria-hidden="true" />
              </button>
            </div>
          )}

          {counts && (
            <dl className="admin-stats">
              <div className="admin-stat">
                <dt>{plural(counts.phones, "phone", "phones")}</dt>
                <dd>{counts.phones}</dd>
              </div>
              <div className="admin-stat">
                <dt>estimated</dt>
                <dd>{counts.estimated}</dd>
              </div>
              <div className="admin-stat">
                <dt>last price check</dt>
                <dd>{counts.lastCheck ? formatDay(counts.lastCheck) : "—"}</dd>
              </div>
            </dl>
          )}
        </div>
      </section>

      <section className="cs-section cs-section-alt admin-band">
        <div className="cs-container">
          <div className="admin-toolbar">
            <div className="admin-search">
              <label htmlFor="admin-search" className="visually-hidden">
                Search by brand or model
              </label>
              <FiSearch className="admin-search-icon" aria-hidden="true" />
              <input
                id="admin-search"
                type="search"
                className="form-control"
                placeholder="Search by brand or model"
                autoComplete="off"
                value={text}
                onChange={(event) => setText(event.target.value)}
              />
            </div>
            <div className="admin-actions">
              <Link to="/admin/prices" className="btn btn-outline-primary">
                Record prices
              </Link>
              <Link to="/admin/phones/new" className="btn btn-primary">
                <FiPlus aria-hidden="true" />
                Add a phone
              </Link>
            </div>
          </div>

          <div className="admin-filters">
            <div className="admin-tabs" role="group" aria-label="Brands">
              {[""].concat(brands).map((name) => {
                const active = name.toLowerCase() === brand.toLowerCase();
                return (
                  <button
                    key={name || "all"}
                    type="button"
                    className={active ? "admin-tab admin-tab-active" : "admin-tab"}
                    aria-pressed={active}
                    onClick={() => setParam("brand", name)}
                  >
                    {name || "All"}
                  </button>
                );
              })}
            </div>
            <label htmlFor="admin-source" className="visually-hidden">
              Source
            </label>
            <select
              id="admin-source"
              className="form-select admin-source"
              value={source}
              onChange={(event) => setParam("source", event.target.value)}
            >
              {SOURCE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {renderTable()}
        </div>
      </section>
    </>
  );
}

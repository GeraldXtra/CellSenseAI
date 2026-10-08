import { useEffect, useRef, useState } from "react";
import { FiX } from "react-icons/fi";
import { listPhones } from "../../services/phones.service.js";
import { useCompare } from "../../context/CompareContext.jsx";
import PhoneImage, { phoneName } from "../shared/PhoneImage.jsx";
import { specLine } from "../shared/PhoneCard.jsx";
import Loader from "../shared/Loader.jsx";

function formatPrice(price) {
  if (!price || price.current == null) return "";
  const currency = price.currency || "USD";
  return currency === "USD" ? `$${price.current}` : `${price.current} ${currency}`;
}

export default function AddPhoneDialog({ onClose }) {
  const { slugs, add, isFull } = useCompare();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fieldRef = useRef(null);
  const term = query.trim();

  useEffect(() => {
    if (fieldRef.current) fieldRef.current.focus();
  }, []);

  useEffect(() => {
    const { body } = document;
    const previous = body.style.overflow;
    body.style.overflow = "hidden";
    return () => {
      body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (term.length < 2) return undefined;
    let active = true;
    const timer = setTimeout(() => {
      setLoading(true);
      setError(null);
      listPhones({ q: term, limit: 5 })
        .then((data) => {
          if (active) setResults(Array.isArray(data?.items) ? data.items : []);
        })
        .catch((err) => {
          if (active) {
            setResults([]);
            setError(err.message || "Something went wrong");
          }
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [term]);

  function handleAdd(slug) {
    if (add(slug)) onClose();
  }

  function handleOverlay(event) {
    if (event.target === event.currentTarget) onClose();
  }

  const visible = term.length < 2 ? [] : results.filter((phone) => !slugs.includes(phone.slug));
  const searched = term.length >= 2 && !loading;

  return (
    <div className="cs-overlay" onMouseDown={handleOverlay}>
      <div className="cs-dialog add-dialog" role="dialog" aria-modal="true" aria-labelledby="add-dialog-title">
        <div className="add-dialog-head">
          <h2 id="add-dialog-title" className="add-dialog-title">
            Add a phone
          </h2>
          <button type="button" className="add-dialog-close" aria-label="Close" onClick={onClose}>
            <FiX aria-hidden="true" />
          </button>
        </div>

        <div className="add-dialog-field">
          <label htmlFor="add-dialog-input" className="add-dialog-label">
            Type a phone name
          </label>
          <input
            ref={fieldRef}
            id="add-dialog-input"
            type="text"
            className="add-dialog-input"
            autoComplete="off"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        {loading && <Loader label="Searching phones" />}
        {!loading && error && term.length >= 2 && <p className="add-dialog-message">{error}</p>}
        {searched && !error && visible.length === 0 && (
          <p className="add-dialog-message">No phone matches that name.</p>
        )}

        {!loading && visible.length > 0 && (
          <ul className="add-dialog-list">
            {visible.map((phone) => (
              <li key={phone.slug} className="add-dialog-row">
                <div className="add-dialog-thumb">
                  <PhoneImage phone={phone} />
                </div>
                <div className="add-dialog-info">
                  <p className="add-dialog-name">{phoneName(phone)}</p>
                  <p className="add-dialog-specs">{specLine(phone)}</p>
                </div>
                <div className="add-dialog-side">
                  <span className="cs-price">{formatPrice(phone.price)}</span>
                  <button
                    type="button"
                    className="btn btn-primary add-dialog-add"
                    aria-label={`Add ${phoneName(phone)}`}
                    disabled={isFull}
                    onClick={() => handleAdd(phone.slug)}
                  >
                    Add
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

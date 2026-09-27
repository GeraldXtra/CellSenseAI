import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import PhoneImage, { phoneName } from "./PhoneImage.jsx";
import { useCompare } from "../../context/CompareContext.jsx";

export function specLine(phone) {
  const specs = (phone && phone.specs) || {};
  return [
    specs.ram != null && `${specs.ram} GB`,
    specs.storage != null && `${specs.storage} GB`,
    specs.mainCamera != null && `${specs.mainCamera} MP`,
    specs.battery != null && `${specs.battery} mAh`,
  ]
    .filter(Boolean)
    .join(", ");
}

function formatPrice(price) {
  if (!price || price.current == null) return "";
  const currency = price.currency || "USD";
  return currency === "USD"
    ? `$${price.current}`
    : `${price.current} ${currency}`;
}

export default function PhoneCard({
  phone,
  reason,
  estimated,
  rank,
  compare = true,
}) {
  const { has, add, remove, isFull } = useCompare();
  const href = `/phones/${phone.slug}`;
  const checked = has(phone.slug);
  const showEstimated =
    estimated === undefined ? phone.source === "ai" : Boolean(estimated);

  function toggleCompare(event) {
    if (event.target.checked) add(phone.slug);
    else remove(phone.slug);
  }

  return (
    <article className="cs-phone-card">
      {rank != null && (
        <span className="cs-phone-rank" aria-hidden="true">
          {rank}
        </span>
      )}
      <Link
        to={href}
        className="cs-phone-card-image"
        tabIndex={-1}
        aria-hidden="true"
      >
        <PhoneImage phone={phone} />
      </Link>
      <h3 className="cs-phone-card-name">{phoneName(phone)}</h3>
      {!reason && <p className="cs-phone-card-specs">{specLine(phone)}</p>}
      <p className="cs-phone-card-price">
        <span className="cs-price">{formatPrice(phone.price)}</span>
        {showEstimated && <span className="cs-estimated">Estimated</span>}
      </p>
      {reason && <p className="cs-phone-card-reason">{reason}</p>}
      <div className="cs-phone-card-actions">
        {compare && (
          <label className="cs-compare-check">
            <input
              type="checkbox"
              className="form-check-input"
              aria-label={`Compare ${phoneName(phone)}`}
              checked={checked}
              disabled={!checked && isFull}
              onChange={toggleCompare}
            />
            Compare
          </label>
        )}
        <Link to={href} className="cs-link-chevron">
          See details
          <FiChevronRight aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

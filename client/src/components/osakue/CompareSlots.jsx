import { FiPlus, FiX } from "react-icons/fi";
import PhoneImage, { phoneName } from "../shared/PhoneImage.jsx";
import { specLine } from "../shared/PhoneCard.jsx";

const TOTAL = 4;

function shortName(phone) {
  const model = phone.model || "";
  return /^\d/.test(model) ? phoneName(phone) : model;
}

export default function CompareSlots({ phones, single = false, onRemove, onAdd, canAdd = true }) {
  const empty = Math.max(TOTAL - phones.length, 0);

  return (
    <ul className="compare-slots">
      {phones.map((phone) => (
        <li key={phone.slug} className={single ? "compare-slot cs-card compare-slot-single" : "compare-slot"}>
          <button
            type="button"
            className="compare-slot-close"
            aria-label={`Remove ${phoneName(phone)} from compare`}
            onClick={() => onRemove(phone.slug)}
          >
            <FiX aria-hidden="true" />
          </button>
          <div className="compare-slot-image">
            <PhoneImage phone={phone} />
          </div>
          <h2 className="compare-slot-name">{single ? phoneName(phone) : shortName(phone)}</h2>
          {single && <p className="compare-slot-specs">{specLine(phone)}</p>}
          <button
            type="button"
            className={single ? "compare-remove compare-remove-underline" : "compare-remove"}
            aria-label={`Remove ${phoneName(phone)}`}
            onClick={() => onRemove(phone.slug)}
          >
            Remove
          </button>
        </li>
      ))}
      {Array.from({ length: empty }, (_, index) => (
        <li key={`empty-${index}`} className="compare-slot">
          <button type="button" className="compare-add" onClick={onAdd} disabled={!canAdd}>
            <span className={single || phones.length === 0 ? "compare-add-icon compare-add-icon-round" : "compare-add-icon"}>
              <FiPlus aria-hidden="true" />
            </span>
            Add a phone
          </button>
        </li>
      ))}
    </ul>
  );
}

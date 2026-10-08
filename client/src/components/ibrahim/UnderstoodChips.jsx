import { FiX } from "react-icons/fi";

const SORT_WORDS = {
  newest: "newest",
  priceAsc: "price low to high",
  priceDesc: "price high to low",
  camera: "camera",
  battery: "battery",
};

function chipLabel(key, value) {
  if (value === undefined || value === null || value === "" || value === false) return "";
  switch (key) {
    case "maxPrice":
      return `Max price $${value}`;
    case "minPrice":
      return `Min price $${value}`;
    case "minCamera":
      return `Camera ${value}MP or more`;
    case "minBattery":
      return `Battery ${value}mAh or more`;
    case "minRam":
      return `${value}GB RAM or more`;
    case "minStorage":
      return `${value}GB storage or more`;
    case "minRefresh":
      return `${value}Hz display`;
    case "has5G":
      return value === true || value === "true" ? "5G" : "";
    case "brand":
      return String(value).split(",").join(", ");
    case "category": {
      const text = String(value);
      return text.charAt(0).toUpperCase() + text.slice(1);
    }
    case "sort":
      return SORT_WORDS[value] ? `Sorted by ${SORT_WORDS[value]}` : "";
    case "q":
      return String(value);
    default:
      return "";
  }
}

export default function UnderstoodChips({ filters = {}, onRemove }) {
  const chips = Object.keys(filters)
    .map((key) => ({ key, label: chipLabel(key, filters[key]) }))
    .filter((chip) => chip.label);

  if (!chips.length) return null;

  return (
    <div className="understood">
      <p className="understood-label">Understood as</p>
      <ul className="understood-list">
        {chips.map((chip) => (
          <li key={chip.key} className="cs-chip">
            {chip.label}
            <button
              type="button"
              className="cs-chip-remove"
              aria-label={`Remove ${chip.label}`}
              onClick={() => onRemove(chip.key)}
            >
              <FiX aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

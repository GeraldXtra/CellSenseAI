import { useId } from "react";
import { BRANDS } from "./BrandTabs.jsx";

const FEATURES = [
  { name: "has5G", label: "5G" },
  { name: "refresh120", label: "120Hz display" },
  { name: "ram8", label: "8GB RAM or more" },
  { name: "battery5000", label: "5000mAh or more" },
];

export const STRIP_KEYS = ["brand", "minPrice", "maxPrice", "has5G", "minRefresh", "minRam", "minBattery"];

export function stripFromParams(params = {}) {
  const chosen = params.brand
    ? String(params.brand)
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean)
    : [];
  return {
    brands: BRANDS.filter((name) => chosen.includes(name.toLowerCase())),
    minPrice: params.minPrice != null ? String(params.minPrice) : "",
    maxPrice: params.maxPrice != null ? String(params.maxPrice) : "",
    has5G: params.has5G === true || params.has5G === "true",
    refresh120: Number(params.minRefresh) >= 120,
    ram8: Number(params.minRam) >= 8,
    battery5000: Number(params.minBattery) >= 5000,
  };
}

export function paramsFromStrip(strip) {
  return {
    brand: strip.brands.join(","),
    minPrice: strip.minPrice.trim(),
    maxPrice: strip.maxPrice.trim(),
    has5G: strip.has5G ? "true" : "",
    minRefresh: strip.refresh120 ? "120" : "",
    minRam: strip.ram8 ? "8" : "",
    minBattery: strip.battery5000 ? "5000" : "",
  };
}

export default function FilterStrip({ id, value, onChange, onApply, maxPlaceholder = "1000" }) {
  const uid = useId();

  function toggleBrand(name, checked) {
    const brands = checked
      ? BRANDS.filter((item) => item === name || value.brands.includes(item))
      : value.brands.filter((item) => item !== name);
    onChange({ ...value, brands });
  }

  function handleSubmit(event) {
    event.preventDefault();
    onApply();
  }

  return (
    <form id={id} className="filter-strip" onSubmit={handleSubmit}>
      <fieldset className="filter-group">
        <legend className="filter-title">Brand</legend>
        {BRANDS.map((name) => (
          <div key={name} className="form-check filter-check">
            <input
              id={`${uid}-brand-${name}`}
              type="checkbox"
              className="form-check-input"
              checked={value.brands.includes(name)}
              onChange={(event) => toggleBrand(name, event.target.checked)}
            />
            <label htmlFor={`${uid}-brand-${name}`} className="form-check-label">
              {name}
            </label>
          </div>
        ))}
      </fieldset>

      <fieldset className="filter-group">
        <legend className="filter-title">Price</legend>
        <div className="filter-price">
          <label htmlFor={`${uid}-min`} className="visually-hidden">
            Lowest price in US dollars
          </label>
          <input
            id={`${uid}-min`}
            type="number"
            min="0"
            inputMode="numeric"
            className="form-control filter-price-field"
            placeholder="0"
            value={value.minPrice}
            onChange={(event) => onChange({ ...value, minPrice: event.target.value })}
          />
          <span className="filter-price-dash" aria-hidden="true">
            -
          </span>
          <label htmlFor={`${uid}-max`} className="visually-hidden">
            Highest price in US dollars
          </label>
          <input
            id={`${uid}-max`}
            type="number"
            min="0"
            inputMode="numeric"
            className="form-control filter-price-field"
            placeholder={maxPlaceholder}
            value={value.maxPrice}
            onChange={(event) => onChange({ ...value, maxPrice: event.target.value })}
          />
        </div>
      </fieldset>

      <fieldset className="filter-group">
        <legend className="filter-title">Features</legend>
        {FEATURES.map((feature) => (
          <div key={feature.name} className="form-check filter-check">
            <input
              id={`${uid}-${feature.name}`}
              type="checkbox"
              className="form-check-input"
              checked={value[feature.name]}
              onChange={(event) => onChange({ ...value, [feature.name]: event.target.checked })}
            />
            <label htmlFor={`${uid}-${feature.name}`} className="form-check-label">
              {feature.label}
            </label>
          </div>
        ))}
      </fieldset>

      <div className="filter-group filter-apply">
        <button type="submit" className="btn btn-primary filter-apply-button">
          Apply
        </button>
      </div>
    </form>
  );
}

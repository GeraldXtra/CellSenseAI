import { useId } from "react";
import { FiChevronDown } from "react-icons/fi";

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "priceAsc", label: "Price low to high" },
  { value: "priceDesc", label: "Price high to low" },
  { value: "camera", label: "Camera" },
  { value: "battery", label: "Battery" },
];

export default function SortSelect({ value = "newest", onChange }) {
  const id = useId();

  return (
    <div className="sort-select">
      <label htmlFor={id} className="sort-select-label">
        Sort by:
      </label>
      <div className="sort-select-control">
        <select
          id={id}
          className="sort-select-field"
          value={value || "newest"}
          onChange={(event) => onChange(event.target.value)}
        >
          {SORTS.map((sort) => (
            <option key={sort.value} value={sort.value}>
              {sort.label}
            </option>
          ))}
        </select>
        <FiChevronDown className="sort-select-icon" aria-hidden="true" />
      </div>
    </div>
  );
}

import { forwardRef, useState } from "react";

const brands = [
  { label: "Any", value: "any" },
  { label: "Samsung", value: "Samsung" },
  { label: "Apple", value: "Apple" },
  { label: "OnePlus", value: "OnePlus" },
  { label: "Xiaomi", value: "Xiaomi" },
  { label: "Vivo", value: "Vivo" },
];

const purposes = [
  { label: "Everyday", value: "everyday" },
  { label: "Work", value: "work" },
  { label: "Gaming", value: "gaming" },
  { label: "Photos", value: "photos" },
];

const performances = [
  { label: "Basic", value: "basic" },
  { label: "Good", value: "balanced" },
  { label: "Top", value: "high" },
];

const checks = [
  { name: "camera", label: "Camera matters most" },
  { name: "gaming", label: "I play games" },
  { name: "battery", label: "Battery matters most" },
];

const BUDGET_MESSAGE = "Enter a budget between 50 and 5000 US dollars";

const RecommendForm = forwardRef(function RecommendForm({ onSubmit, loading = false }, budgetRef) {
  const [values, setValues] = useState({
    budget: "700",
    brand: "any",
    purpose: "everyday",
    performance: "balanced",
    camera: true,
    gaming: false,
    battery: true,
  });
  const [budgetError, setBudgetError] = useState("");

  function update(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
    if (name === "budget") setBudgetError("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    const budget = Number(values.budget);
    if (values.budget === "" || !Number.isFinite(budget) || budget < 50 || budget > 5000) {
      setBudgetError(BUDGET_MESSAGE);
      if (budgetRef && budgetRef.current) budgetRef.current.focus();
      return;
    }
    onSubmit({
      budget,
      brand: values.brand,
      purpose: values.purpose,
      performance: values.performance,
      camera: values.camera,
      gaming: values.gaming,
      battery: values.battery,
    });
  }

  return (
    <form className="cs-card recommend-form" onSubmit={handleSubmit} noValidate>
      <div className="recommend-fields">
        <div className="recommend-field">
          <label htmlFor="recommend-budget" className="recommend-label">
            Budget (US dollars)
          </label>
          <input
            ref={budgetRef}
            id="recommend-budget"
            type="number"
            min="50"
            max="5000"
            inputMode="numeric"
            className={budgetError ? "form-control is-invalid" : "form-control"}
            aria-invalid={Boolean(budgetError)}
            aria-describedby={budgetError ? "recommend-budget-error" : undefined}
            value={values.budget}
            onChange={(event) => update("budget", event.target.value)}
          />
          {budgetError && (
            <div id="recommend-budget-error" className="invalid-feedback d-block">
              {budgetError}
            </div>
          )}
        </div>

        <div className="recommend-field">
          <label htmlFor="recommend-brand" className="recommend-label">
            Brand
          </label>
          <select
            id="recommend-brand"
            className="form-select"
            value={values.brand}
            onChange={(event) => update("brand", event.target.value)}
          >
            {brands.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="recommend-field">
          <label htmlFor="recommend-purpose" className="recommend-label">
            Purpose
          </label>
          <select
            id="recommend-purpose"
            className="form-select"
            value={values.purpose}
            onChange={(event) => update("purpose", event.target.value)}
          >
            {purposes.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="recommend-field">
          <label htmlFor="recommend-performance" className="recommend-label">
            Performance
          </label>
          <select
            id="recommend-performance"
            className="form-select"
            value={values.performance}
            onChange={(event) => update("performance", event.target.value)}
          >
            {performances.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="recommend-checks">
        {checks.map((check) => (
          <div key={check.name} className="form-check recommend-check">
            <input
              id={`recommend-${check.name}`}
              type="checkbox"
              className="form-check-input"
              checked={values[check.name]}
              onChange={(event) => update(check.name, event.target.checked)}
            />
            <label htmlFor={`recommend-${check.name}`} className="form-check-label">
              {check.label}
            </label>
          </div>
        ))}
      </div>

      <button type="submit" className="btn btn-primary w-100" disabled={loading}>
        {loading ? "Finding your top 3" : "Show my top 3"}
      </button>
    </form>
  );
});

export default RecommendForm;

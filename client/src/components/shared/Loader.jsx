export default function Loader({ label = "Loading" }) {
  return (
    <div className="cs-loader" role="status" aria-live="polite">
      <span className="cs-spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

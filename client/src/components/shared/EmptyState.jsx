export default function EmptyState({ title, message, action }) {
  return (
    <div className="cs-empty">
      {title && <p className="cs-empty-title">{title}</p>}
      {message && <p className="cs-empty-message">{message}</p>}
      {action && <div className="cs-empty-action">{action}</div>}
    </div>
  );
}

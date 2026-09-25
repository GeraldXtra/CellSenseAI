// EmptyState: a centred box with a title, a message and an optional action for empty results. Owner: Gerald.
export default function EmptyState({ title, message, action }) {
  return (
    <div className="cs-empty">
      <p className="cs-empty-title">{title}</p>
      {message && <p className="cs-empty-message">{message}</p>}
      {action}
    </div>
  );
}

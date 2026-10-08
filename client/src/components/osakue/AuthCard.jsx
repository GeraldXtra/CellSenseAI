export default function AuthCard({ title, subtitle, icon, children }) {
  return (
    <section className="cs-section cs-section-alt auth-page">
      <div className="cs-container">
        <div className="cs-card auth-card">
          {icon && (
            <div className="auth-card-icon" aria-hidden="true">
              {icon}
            </div>
          )}
          <h1 className="cs-heading auth-card-title">{title}</h1>
          {subtitle && <p className="cs-subheading auth-card-subtitle">{subtitle}</p>}
          {children}
        </div>
      </div>
    </section>
  );
}

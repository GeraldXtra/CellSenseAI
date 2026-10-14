import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import Loader from "./Loader.jsx";
import EmptyState from "./EmptyState.jsx";

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader label="Checking your account" />;
  }

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search + location.hash);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  if (user.role !== "admin") {
    return (
      <section className="cs-section">
        <div className="cs-container">
          <EmptyState
            title="Admins only"
            message="This page is only for the people who look after the phone list."
            action={
              <Link to="/" className="btn btn-primary">
                Go home
              </Link>
            }
          />
        </div>
      </section>
    );
  }

  return children;
}

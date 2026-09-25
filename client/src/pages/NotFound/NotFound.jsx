// NotFound page. Owner: Gerald. Match docs/ui/page-not-found.png.
import { Link } from "react-router-dom";
import "./NotFound.css";

export default function NotFound() {
  return (
    <section className="cs-section">
      <div className="cs-container notfound">
        <div className="notfound-phone" aria-hidden="true" />
        <h1 className="cs-heading">Page not found</h1>
        <p className="cs-subheading">That link does not exist.</p>
        <Link to="/" className="btn btn-primary">
          Go home
        </Link>
      </div>
    </section>
  );
}

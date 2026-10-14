import { useEffect } from "react";
import { Link } from "react-router-dom";
import PhoneImage from "../../components/shared/PhoneImage.jsx";
import "./NotFound.css";

export default function NotFound() {
  useEffect(() => {
    const previous = document.title;
    document.title = "Page not found | CellSense AI";
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <section className="cs-section">
      <div className="cs-container notfound">
        <PhoneImage phone={{}} className="notfound-phone" />
        <h1 className="cs-heading">Page not found</h1>
        <p className="cs-subheading">That link does not exist.</p>
        <Link to="/" className="btn btn-primary notfound-action">
          Go home
        </Link>
      </div>
    </section>
  );
}

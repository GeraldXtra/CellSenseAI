import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowDown } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext.jsx";
import { useCompare } from "../../context/CompareContext.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { getPhone, getPriceTrend } from "../../services/phones.service.js";
import { addFavourite } from "../../services/users.service.js";
import PhoneImage from "../../components/shared/PhoneImage.jsx";
import Loader from "../../components/shared/Loader.jsx";
import EmptyState from "../../components/shared/EmptyState.jsx";
import SpecTable from "../../components/ibrahim/SpecTable.jsx";
import PriceHistoryChart from "../../components/ibrahim/PriceHistoryChart.jsx";
import NoticeBar from "../../components/ibrahim/NoticeBar.jsx";
import ReviewsSection from "../../components/osakue/ReviewsSection.jsx";
import "./PhoneDetail.css";

function formatPrice(price) {
  if (!price || price.current == null) return "";
  const currency = price.currency || "USD";
  return currency === "USD" ? `$${price.current}` : `${price.current} ${currency}`;
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function TrendLine({ trend }) {
  if (trend.loading && !trend.data) return null;
  if (trend.error || !trend.data || !trend.data.suggestion) return null;
  if (trend.data.trend === "falling") {
    return (
      <p className="cs-price-note detail-trend">
        <FiArrowDown aria-hidden="true" />
        {trend.data.suggestion}
      </p>
    );
  }
  return <p className="detail-trend detail-muted">{trend.data.suggestion}</p>;
}

function PriceHistory({ trend }) {
  if (trend.loading && !trend.data) return <Loader label="Loading the price history" />;
  if (trend.error) {
    return (
      <div className="detail-error">
        <p className="detail-muted">{trend.error}</p>
        <button type="button" className="btn btn-outline-primary" onClick={trend.reload}>
          Try again
        </button>
      </div>
    );
  }
  return <PriceHistoryChart history={(trend.data && trend.data.history) || []} />;
}

export default function PhoneDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { add } = useCompare();
  const detail = useAsync(() => getPhone(slug), [slug]);
  const trend = useAsync(() => getPriceTrend(slug), [slug]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  if (detail.loading && !detail.data) {
    return (
      <section className="cs-section">
        <div className="cs-container">
          <Loader label="Loading the phone" />
        </div>
      </section>
    );
  }

  if (detail.error) {
    const notFound = detail.error === "Phone not found";
    return (
      <section className="cs-section">
        <div className="cs-container">
          {notFound ? (
            <EmptyState
              title="Phone not found"
              message="That phone is not in our list."
              action={
                <Link to="/browse" className="btn btn-primary">
                  Browse phones
                </Link>
              }
            />
          ) : (
            <div className="detail-error">
              <p className="detail-muted">{detail.error}</p>
              <button type="button" className="btn btn-outline-primary" onClick={detail.reload}>
                Try again
              </button>
            </div>
          )}
        </div>
      </section>
    );
  }

  const phone = detail.data.phone;
  const isFavourite = Boolean(detail.data.isFavourite);
  const brandSlug = (phone.brand || "").toLowerCase();
  const estimated = phone.source === "ai";
  const checked = phone.price && phone.price.updatedAt ? formatDate(phone.price.updatedAt) : "";

  function handleCompare() {
    add(phone.slug);
    navigate("/compare");
  }

  async function handleFavourite() {
    if (!user) {
      navigate(`/login?next=${encodeURIComponent(`/phones/${phone.slug}`)}`);
      return;
    }
    if (isFavourite) return;
    setSaving(true);
    setSaveError("");
    try {
      await addFavourite(phone.slug);
      detail.reload();
    } catch (err) {
      setSaveError(err.message || "Could not save the phone. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <section className="cs-section detail-top">
        <div className="cs-container">
          <nav aria-label="Breadcrumb" className="detail-breadcrumb">
            <ol>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to={`/browse/${brandSlug}`}>{phone.brand}</Link>
              </li>
              <li aria-current="page">{phone.model}</li>
            </ol>
          </nav>

          {estimated && (
            <div className="detail-notice">
              <NoticeBar>
                Our assistant added this phone. Its specs and price are estimates until we check
                them.
              </NoticeBar>
            </div>
          )}

          <div className="detail-hero">
            <div className="detail-picture">
              <PhoneImage phone={phone} className="detail-image" />
            </div>
            <div className="detail-info">
              <p className="detail-brand">{phone.brand}</p>
              <h1 className="detail-model">{phone.model}</h1>
              <p className="detail-price">
                <span>{formatPrice(phone.price)}</span>
                {estimated && <span className="cs-estimated">Estimated</span>}
              </p>
              {checked && <p className="detail-muted detail-checked">Guide price, checked {checked}</p>}
              <TrendLine trend={trend} />
              {phone.aiSummary && (
                <div className="cs-ai-box detail-summary">
                  <h2 className="cs-ai-box-title">In plain words</h2>
                  <p>{phone.aiSummary}</p>
                </div>
              )}
              <div className="detail-actions">
                <button type="button" className="btn btn-primary" onClick={handleCompare}>
                  Add to compare
                </button>
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={handleFavourite}
                  disabled={saving}
                  aria-pressed={isFavourite}
                >
                  {isFavourite ? "Saved" : "Save to favourites"}
                </button>
              </div>
              {saveError && (
                <p className="detail-save-error" role="alert">
                  {saveError}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="cs-section cs-section-alt">
        <div className="cs-container">
          <h2 className="cs-heading detail-section-title">Tech specs</h2>
          <SpecTable specs={phone.specs || {}} />
        </div>
      </section>

      <section className="cs-section">
        <div className="cs-container">
          <h2 className="cs-heading detail-section-title">Price history</h2>
          <PriceHistory trend={trend} />
        </div>
      </section>

      <section className="cs-section cs-section-alt">
        <div className="cs-container">
          <h2 className="cs-heading detail-section-title">Reviews</h2>
          <ReviewsSection slug={phone.slug} />
        </div>
      </section>
    </>
  );
}

import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext.jsx";
import { getDashboard, removeFavourite } from "../../services/users.service.js";
import { useAsync } from "../../hooks/useAsync.js";
import PhoneCard from "../../components/shared/PhoneCard.jsx";
import PhoneImage, { phoneName } from "../../components/shared/PhoneImage.jsx";
import Loader from "../../components/shared/Loader.jsx";
import EmptyState from "../../components/shared/EmptyState.jsx";
import "./Dashboard.css";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatPrice(price) {
  if (!price || price.current == null) return "";
  const currency = price.currency || "USD";
  return currency === "USD" ? `$${price.current}` : `${price.current} ${currency}`;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function formatDay(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const days = Math.round((startOfDay(new Date()) - startOfDay(date)) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

function FavouriteRow({ phone, onRemove, removing }) {
  return (
    <li className="dashboard-row">
      <Link to={`/phones/${phone.slug}`} className="dashboard-fav-thumb" tabIndex={-1} aria-hidden="true">
        <PhoneImage phone={phone} />
      </Link>
      <div className="dashboard-fav-body">
        <Link to={`/phones/${phone.slug}`} className="dashboard-fav-name">
          {phoneName(phone)}
        </Link>
        <span className="cs-price">{formatPrice(phone.price)}</span>
      </div>
      <button
        type="button"
        className="dashboard-remove"
        onClick={() => onRemove(phone.slug)}
        disabled={removing}
        aria-label={`Remove ${phoneName(phone)} from favourites`}
      >
        Remove
      </button>
    </li>
  );
}

function HistoryRow({ entry }) {
  return (
    <li className="dashboard-row">
      <Link to={`/search?q=${encodeURIComponent(entry.query)}`} className="dashboard-query">
        {entry.query}
      </Link>
      <span className="dashboard-day">{formatDay(entry.at)}</span>
    </li>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { hash } = useLocation();
  const { data, loading, error, reload } = useAsync(() => getDashboard(), []);
  const [removing, setRemoving] = useState("");
  const [removeError, setRemoveError] = useState("");
  const scrolled = useRef(false);

  const recentlyViewed = (data && data.recentlyViewed) || [];
  const favourites = (data && data.favourites) || [];
  const searchHistory = (data && data.searchHistory) || [];
  const recommendations = ((data && data.recommendations) || []).filter((item) => item && item.phone);

  useEffect(() => {
    if (!data || scrolled.current || !hash) return;
    scrolled.current = true;
    const target = document.getElementById(hash.slice(1));
    if (target) target.scrollIntoView({ block: "start" });
  }, [data, hash]);

  async function handleRemove(slug) {
    setRemoving(slug);
    setRemoveError("");
    try {
      await removeFavourite(slug);
      reload();
    } catch (err) {
      setRemoveError(err.message || "Could not remove the phone. Try again.");
    } finally {
      setRemoving("");
    }
  }

  function renderBlock(content) {
    if (loading && !data) return <Loader label="Loading" />;
    if (error) {
      return (
        <div className="dashboard-error" role="alert">
          <span>{error}</span>
          <button type="button" className="btn btn-outline-primary" onClick={reload}>
            Try again
          </button>
        </div>
      );
    }
    return content();
  }

  const firstName = user && user.name ? user.name : "you";

  return (
    <>
      <section className="cs-section dashboard-intro">
        <div className="cs-container">
          <h1 className="cs-heading">Your dashboard</h1>
          <p className="cs-subheading">
            Signed in as {firstName}. Your history stays on this account only.
          </p>
        </div>
      </section>

      <section className="cs-section cs-section-alt dashboard-band">
        <div className="cs-container">
          <h2 className="dashboard-title">Recently viewed</h2>
          {renderBlock(() =>
            recentlyViewed.length ? (
              <div className="cs-grid">
                {recentlyViewed.map((phone) => (
                  <PhoneCard key={phone.slug} phone={phone} />
                ))}
              </div>
            ) : (
              <EmptyState
                message="Phones you open will appear here."
                action={
                  <Link to="/browse" className="cs-link-chevron">
                    Browse phones
                    <FiChevronRight aria-hidden="true" />
                  </Link>
                }
              />
            ),
          )}
        </div>
      </section>

      <section className="cs-section dashboard-band">
        <div className="cs-container dashboard-cards">
          <div id="favourites" className="cs-card dashboard-card">
            <h2 className="dashboard-card-title">Favourites</h2>
            {renderBlock(() =>
              favourites.length ? (
                <ul className="dashboard-list">
                  {favourites.map((phone) => (
                    <FavouriteRow
                      key={phone.slug}
                      phone={phone}
                      onRemove={handleRemove}
                      removing={removing === phone.slug}
                    />
                  ))}
                </ul>
              ) : (
                <p className="dashboard-empty">
                  No favourites yet. Use Save to favourites on any phone.
                </p>
              ),
            )}
            {removeError && (
              <p className="dashboard-remove-error" role="alert">
                {removeError}
              </p>
            )}
          </div>

          <div id="search-history" className="cs-card dashboard-card">
            <h2 className="dashboard-card-title">Search history</h2>
            {renderBlock(() =>
              searchHistory.length ? (
                <ul className="dashboard-list">
                  {searchHistory.map((entry, index) => (
                    <HistoryRow key={`${entry.at}-${index}`} entry={entry} />
                  ))}
                </ul>
              ) : (
                <p className="dashboard-empty">No searches yet.</p>
              ),
            )}
          </div>
        </div>
      </section>

      <section className="cs-section cs-section-alt dashboard-band">
        <div className="cs-container">
          <h2 className="dashboard-title">Recommended for you</h2>
          {renderBlock(() =>
            recommendations.length ? (
              <div className="cs-grid">
                {recommendations.map((item) => (
                  <PhoneCard
                    key={item.phone.slug}
                    phone={item.phone}
                    reason={item.reason}
                    compare={false}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                message="Answer five quick questions and we show the phones that fit."
                action={
                  <Link to="/recommend" className="btn btn-primary">
                    Get a recommendation
                  </Link>
                }
              />
            ),
          )}
        </div>
      </section>
    </>
  );
}

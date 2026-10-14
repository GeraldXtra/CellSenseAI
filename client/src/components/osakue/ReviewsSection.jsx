import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { addReview, getReviewSummary, getReviews } from "../../services/phones.service.js";
import Loader from "../shared/Loader.jsx";

const EMPTY_TEXT = "No reviews yet. Be the first to write one.";
const RATINGS = [5, 4, 3, 2, 1];

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function ReviewForm({ slug, user, onPosted, title }) {
  const [rating, setRating] = useState("5");
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fieldId = `review-text-${slug}`;
  const ratingId = `review-rating-${slug}`;

  if (!user) {
    const next = encodeURIComponent(`/phones/${slug}`);
    return (
      <div className="reviews-login">
        {title && <h3 className="reviews-card-title">{title}</h3>}
        <p className="reviews-muted">Log in to write a review of this phone.</p>
        <Link to={`/login?next=${next}`} className="btn btn-primary reviews-submit">
          Log in
        </Link>
      </div>
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const body = text.trim();
    if (body.length < 3) {
      setError("Write a few words about the phone");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await addReview(slug, { rating: Number(rating), text: body });
      setText("");
      setRating("5");
      onPosted();
    } catch (err) {
      setError(err.message || "Could not post the review. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="reviews-form" onSubmit={handleSubmit} noValidate>
      {title && <h3 className="reviews-card-title">{title}</h3>}
      <div className="reviews-field">
        <label htmlFor={ratingId} className="reviews-label">
          Rating
        </label>
        <select
          id={ratingId}
          className="form-select reviews-rating"
          value={rating}
          onChange={(event) => setRating(event.target.value)}
          disabled={saving}
        >
          {RATINGS.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>
      <label htmlFor={fieldId} className="visually-hidden">
        Your review
      </label>
      <textarea
        id={fieldId}
        className={error ? "form-control reviews-text is-invalid" : "form-control reviews-text"}
        placeholder="What is it like to use every day?"
        rows={3}
        maxLength={1000}
        value={text}
        onChange={(event) => setText(event.target.value)}
        disabled={saving}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${fieldId}-error` : undefined}
      />
      {error && (
        <p id={`${fieldId}-error`} className="reviews-error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn-primary reviews-submit" disabled={saving}>
        {saving ? "Posting" : "Post review"}
      </button>
    </form>
  );
}

export default function ReviewsSection({ slug }) {
  const { user } = useAuth();
  const reviews = useAsync(() => getReviews(slug), [slug]);
  const summary = useAsync(() => getReviewSummary(slug), [slug]);

  function refresh() {
    reviews.reload();
    summary.reload();
  }

  if (reviews.loading && !reviews.data) {
    return <Loader label="Loading reviews" />;
  }

  if (reviews.error) {
    return (
      <div className="reviews-message">
        <p className="reviews-muted">{reviews.error}</p>
        <button type="button" className="btn btn-outline-primary" onClick={reviews.reload}>
          Try again
        </button>
      </div>
    );
  }

  const items = (reviews.data && reviews.data.items) || [];
  const count = (reviews.data && reviews.data.count) || items.length;

  if (items.length === 0) {
    return (
      <div className="reviews">
        <div className="cs-card reviews-empty">
          <p className="reviews-empty-text">{EMPTY_TEXT}</p>
          <ReviewForm slug={slug} user={user} onPosted={refresh} />
        </div>
      </div>
    );
  }

  const summaryText = summary.data && summary.data.summary;

  return (
    <div className="reviews">
      <div className="reviews-top">
        <div className="cs-card reviews-summary">
          <h3 className="reviews-card-title">Summary</h3>
          <p className="reviews-muted reviews-summary-text">
            {summary.loading && !summaryText ? "Reading the reviews" : summaryText || ""}
          </p>
          <p className="reviews-count">
            Based on {count} {count === 1 ? "review" : "reviews"}
          </p>
        </div>
        <div className="cs-card">
          <ReviewForm slug={slug} user={user} onPosted={refresh} title="Write a review" />
        </div>
      </div>
      <ul className="reviews-list">
        {items.map((review) => (
          <li key={review._id} className="cs-card reviews-row">
            <div className="reviews-row-main">
              <p className="reviews-author">{review.author}</p>
              <p className="reviews-text-body">{review.text}</p>
            </div>
            <p className="reviews-stars">{review.rating} of 5</p>
            <p className="reviews-date">{formatDate(review.createdAt)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

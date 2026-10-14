import { useRef, useState } from "react";
import { recommend } from "../../services/ai.service.js";
import RecommendForm from "../../components/osakue/RecommendForm.jsx";
import PhoneCard from "../../components/shared/PhoneCard.jsx";
import Loader from "../../components/shared/Loader.jsx";
import EmptyState from "../../components/shared/EmptyState.jsx";
import "./Recommend.css";

export default function Recommend() {
  const budgetRef = useRef(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(needs) {
    setLoading(true);
    setError(null);
    try {
      const data = await recommend(needs);
      setResult({
        items: Array.isArray(data?.items) ? data.items : [],
        widened: Boolean(data?.widened),
      });
    } catch (err) {
      setError(err.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function focusBudget() {
    if (budgetRef.current) {
      budgetRef.current.focus();
      budgetRef.current.select();
    }
  }

  const showResults = loading || result;

  return (
    <>
      <section className="cs-section recommend-intro">
        <div className="cs-container">
          <h1 className="cs-heading">Get a recommendation</h1>
          <p className="cs-subheading">Answer five quick questions and we show the three phones that fit.</p>
        </div>
      </section>

      <section className="cs-section cs-section-alt recommend-band">
        <div className="cs-container">
          <div className="recommend-form-wrap">
            <RecommendForm ref={budgetRef} onSubmit={handleSubmit} loading={loading} />
            {error && (
              <p className="recommend-error" role="alert">
                {error}
              </p>
            )}
          </div>
        </div>
      </section>

      {showResults && (
        <section className="cs-section recommend-results" aria-live="polite">
          <div className="cs-container">
            <h2 className="recommend-title">Your top 3</h2>
            {loading && <Loader label="Finding your top 3" />}
            {!loading && result && result.items.length === 0 && (
              <EmptyState
                message="No phones fit that budget. Try a higher one."
                action={
                  <button type="button" className="btn btn-primary" onClick={focusBudget}>
                    Raise the budget
                  </button>
                }
              />
            )}
            {!loading && result && result.items.length > 0 && (
              <>
                {result.widened && (
                  <p className="recommend-widened">Few phones fit your budget, so we looked a little above it.</p>
                )}
                <div className="cs-grid">
                  {result.items.map((item, index) => (
                    <PhoneCard
                      key={item.phone.slug}
                      phone={item.phone}
                      rank={index + 1}
                      reason={item.reason}
                      compare={false}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}
    </>
  );
}

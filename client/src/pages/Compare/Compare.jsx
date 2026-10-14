import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import { useCompare } from "../../context/CompareContext.jsx";
import { comparePhones, getPhone } from "../../services/phones.service.js";
import { useAsync } from "../../hooks/useAsync.js";
import Loader from "../../components/shared/Loader.jsx";
import EmptyState from "../../components/shared/EmptyState.jsx";
import { phoneName } from "../../components/shared/PhoneImage.jsx";
import CompareSlots from "../../components/osakue/CompareSlots.jsx";
import CompareTable from "../../components/osakue/CompareTable.jsx";
import AddPhoneDialog from "../../components/osakue/AddPhoneDialog.jsx";
import "./Compare.css";

const NOT_FOUND = "Could not find at least two of those phones";

function loadPhones(slugs) {
  if (slugs.length >= 2) return comparePhones(slugs);
  if (slugs.length === 1) {
    return getPhone(slugs[0]).then((data) => ({ phones: [data.phone], best: {} }));
  }
  return Promise.resolve({ phones: [], best: {} });
}

function question(phones) {
  const names = phones.map(phoneName);
  const list = names.length > 1 ? `${names.slice(0, -1).join(", ")} or ${names[names.length - 1]}` : names[0];
  return `Which should I buy: ${list}?`;
}

export default function Compare() {
  const { slugs, remove, isFull } = useCompare();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dialogOpen, setDialogOpen] = useState(false);
  const key = slugs.join(",");
  const currentIds = searchParams.get("ids") || "";
  const { data, loading, error, reload } = useAsync(() => loadPhones(key ? key.split(",") : []), [key]);

  useEffect(() => {
    if (currentIds !== key) {
      setSearchParams(key ? { ids: key } : {}, { replace: true });
    }
  }, [key, currentIds, setSearchParams]);

  useEffect(() => {
    if (!data || loading || slugs.length < 2) return;
    const found = (data.phones || []).map((phone) => phone.slug);
    if (found.length >= 2 && found.length < slugs.length) {
      slugs.filter((slug) => !found.includes(slug)).forEach(remove);
    }
  }, [data, loading, slugs, remove]);

  useEffect(() => {
    if (error === "Phone not found" && slugs.length === 1) remove(slugs[0]);
  }, [error, slugs, remove]);

  const phones = data && Array.isArray(data.phones) ? data.phones.filter((phone) => slugs.includes(phone.slug)) : [];
  const best = (data && data.best) || {};
  const showTable = slugs.length >= 2;
  const notFound = error === NOT_FOUND;
  const slotPhones = loading && phones.length === 0 ? [] : phones;

  return (
    <>
      <section className="cs-section compare-page">
        <div className="cs-container">
          <h1 className="cs-heading">Compare</h1>
          <p className="cs-subheading">
            Up to four phones. The <strong className="compare-bold">bold</strong> value wins each row.
          </p>

          <CompareSlots
            phones={slotPhones}
            single={slugs.length < 2}
            onRemove={remove}
            onAdd={() => setDialogOpen(true)}
            canAdd={!isFull}
          />

          {!showTable && !(loading && slugs.length === 1) && (
            <div className="compare-below">
              <EmptyState
                message="Add at least one more phone to compare."
                action={
                  <Link to="/browse" className="btn btn-primary">
                    Browse phones
                  </Link>
                }
              />
            </div>
          )}

          {showTable && (
            <div className="compare-below">
              {loading && <Loader label="Loading the phones" />}
              {!loading && notFound && (
                <EmptyState
                  title={NOT_FOUND}
                  action={
                    <Link to="/browse" className="btn btn-primary">
                      Browse phones
                    </Link>
                  }
                />
              )}
              {!loading && error && !notFound && (
                <div className="compare-error">
                  <p className="compare-error-text">{error}</p>
                  <button type="button" className="btn btn-outline-primary" onClick={reload}>
                    Try again
                  </button>
                </div>
              )}
              {!loading && !error && phones.length >= 2 && <CompareTable phones={phones} best={best} />}
            </div>
          )}
        </div>
      </section>

      {showTable && !loading && !error && phones.length >= 2 && (
        <section className="cs-section cs-section-alt">
          <div className="cs-container">
            <div className="cs-card compare-verdict">
              <h2 className="compare-verdict-title">Verdict</h2>
              <p className="compare-verdict-text">
                The assistant can tell you which of these phones suits you best.
              </p>
              <Link
                to={`/assistant?q=${encodeURIComponent(question(phones))}`}
                className="cs-link-chevron"
              >
                Ask the assistant
                <FiChevronRight aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {dialogOpen && <AddPhoneDialog onClose={() => setDialogOpen(false)} />}
    </>
  );
}

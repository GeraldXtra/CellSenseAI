import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { listPhones } from "../../services/phones.service.js";
import { useAsync } from "../../hooks/useAsync.js";
import PhoneCard from "../../components/shared/PhoneCard.jsx";
import Loader from "../../components/shared/Loader.jsx";
import EmptyState from "../../components/shared/EmptyState.jsx";
import BrandTabs, { BRANDS } from "../../components/ibrahim/BrandTabs.jsx";
import FilterStrip, { paramsFromStrip, stripFromParams } from "../../components/ibrahim/FilterStrip.jsx";
import SortSelect from "../../components/ibrahim/SortSelect.jsx";
import "../SearchResults/SearchResults.css";
import "./Browse.css";

export default function Browse() {
  const { brand } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const key = `${brand ?? ""}?${searchParams.toString()}`;
  const params = {
    ...Object.fromEntries(searchParams),
    ...(brand ? { brand } : {}),
  };
  const { data, loading, error, reload } = useAsync(() => listPhones(params), [key]);

  const [strip, setStrip] = useState(() => stripFromParams(params));
  const [seenKey, setSeenKey] = useState(key);

  if (seenKey !== key) {
    setSeenKey(key);
    setStrip(stripFromParams(params));
  }

  const brandName = brand
    ? BRANDS.find((name) => name.toLowerCase() === brand.toLowerCase()) || brand
    : "";
  const title = brandName || (params.brand ? params.brand.split(",").join(", ") : "All phones");
  const items = (data && data.items) || [];
  const total = (data && data.total) || 0;
  const page = (data && data.page) || 1;
  const pages = (data && data.pages) || 1;

  function handleApply() {
    const values = paramsFromStrip(strip);
    const next = new URLSearchParams();
    for (const name of ["minPrice", "maxPrice", "has5G", "minRefresh", "minRam", "minBattery"]) {
      if (values[name]) next.set(name, values[name]);
    }
    const sort = searchParams.get("sort");
    if (sort) next.set("sort", sort);
    let path = "/browse";
    if (strip.brands.length === 1) path = `/browse/${strip.brands[0].toLowerCase()}`;
    else if (strip.brands.length > 1) next.set("brand", strip.brands.join(","));
    const query = next.toString();
    navigate(query ? `${path}?${query}` : path);
  }

  function handleSort(sort) {
    const next = new URLSearchParams(searchParams);
    next.set("sort", sort);
    next.delete("page");
    setSearchParams(next);
  }

  function goToPage(number) {
    const next = new URLSearchParams(searchParams);
    if (number > 1) next.set("page", String(number));
    else next.delete("page");
    setSearchParams(next);
  }

  function handleClear() {
    navigate(brand ? `/browse/${brand}` : "/browse");
  }

  return (
    <div className="browse-page">
      <section className="cs-section browse-top">
        <div className="cs-container">
          <h1 className="cs-heading">Browse phones</h1>
          <p className="cs-subheading">Pick a brand or set a price range.</p>
          <BrandTabs active={brandName} />
        </div>
      </section>

      <section className="browse-strip-band" aria-label="Filters">
        <div className="cs-container">
          <FilterStrip id="browse-filters" value={strip} onChange={setStrip} onApply={handleApply} />
        </div>
      </section>

      <section className="cs-section cs-section-alt browse-results">
        <div className="cs-container">
          <div className="browse-tools">
            <SortSelect value={searchParams.get("sort") || "newest"} onChange={handleSort} />
          </div>
          <div className="browse-title">
            <h2 className="browse-name">{title}</h2>
            {data && !loading && !error && (
              <p className="browse-count">{total === 1 ? "1 phone" : `${total} phones`}</p>
            )}
          </div>

          {loading && <Loader label="Loading phones" />}

          {!loading && error && (
            <EmptyState
              title="We could not load the phones"
              message={error}
              action={
                <button type="button" className="btn btn-outline-primary" onClick={reload}>
                  Try again
                </button>
              }
            />
          )}

          {!loading && !error && data && items.length === 0 && (
            <EmptyState
              title="No phones match these filters."
              action={
                <button type="button" className="btn btn-primary" onClick={handleClear}>
                  Clear filters
                </button>
              }
            />
          )}

          {!loading && !error && items.length > 0 && (
            <>
              <div className="cs-grid">
                {items.map((phone) => (
                  <PhoneCard key={phone.slug} phone={phone} />
                ))}
              </div>
              {pages > 1 && (
                <nav className="browse-pages" aria-label="Pages">
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    disabled={page <= 1}
                    onClick={() => goToPage(page - 1)}
                  >
                    Previous page
                  </button>
                  <span className="browse-page-number">
                    Page {page} of {pages}
                  </span>
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    disabled={page >= pages}
                    onClick={() => goToPage(page + 1)}
                  >
                    Next page
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

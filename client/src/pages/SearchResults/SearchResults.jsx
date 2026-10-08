import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FiChevronRight, FiSliders } from "react-icons/fi";
import { searchPhones } from "../../services/ai.service.js";
import { listPhones } from "../../services/phones.service.js";
import { useAsync } from "../../hooks/useAsync.js";
import PhoneCard from "../../components/shared/PhoneCard.jsx";
import Loader from "../../components/shared/Loader.jsx";
import EmptyState from "../../components/shared/EmptyState.jsx";
import SearchBar from "../../components/ibrahim/SearchBar.jsx";
import UnderstoodChips from "../../components/ibrahim/UnderstoodChips.jsx";
import FilterStrip, {
  STRIP_KEYS,
  paramsFromStrip,
  stripFromParams,
} from "../../components/ibrahim/FilterStrip.jsx";
import SortSelect from "../../components/ibrahim/SortSelect.jsx";
import NoticeBar from "../../components/ibrahim/NoticeBar.jsx";
import "./SearchResults.css";

const FILTER_KEYS = [
  "brand",
  "minPrice",
  "maxPrice",
  "has5G",
  "minRam",
  "minStorage",
  "minCamera",
  "minBattery",
  "minRefresh",
  "category",
  "sort",
];

function readListFilters(searchParams) {
  const filters = {};
  for (const key of FILTER_KEYS) {
    const value = searchParams.get(key);
    if (!value) continue;
    if (key === "has5G") {
      if (value === "true") filters.has5G = true;
    } else {
      filters[key] = value;
    }
  }
  const words = searchParams.get("words");
  if (words) filters.q = words;
  return filters;
}

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const q = (searchParams.get("q") || "").trim();
  const listMode = searchParams.get("list") === "1";
  const key = searchParams.toString();

  const { data, loading, error, reload } = useAsync(() => {
    if (listMode) {
      const filters = readListFilters(searchParams);
      return listPhones(filters).then((reply) => ({
        items: reply.items || [],
        filters,
        source: "list",
      }));
    }
    if (!q) return null;
    return searchPhones(q);
  }, [key]);

  const filters = (data && data.filters) || {};
  const filtersKey = JSON.stringify(filters);
  const [strip, setStrip] = useState(() => stripFromParams(filters));
  const [seenFilters, setSeenFilters] = useState(filtersKey);

  if (seenFilters !== filtersKey) {
    setSeenFilters(filtersKey);
    setStrip(stripFromParams(filters));
  }

  const items = (data && data.items) || [];
  const added = items.some((phone) => phone.source === "ai");
  const showChips = data && (data.source === "ai" || data.source === "list") && !added;
  const showStrip = !added;
  const empty = !q && !listMode;

  function openFilters(nextFilters) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    params.set("list", "1");
    for (const [name, value] of Object.entries(nextFilters)) {
      if (value === undefined || value === null || value === "" || value === false) continue;
      params.set(name === "q" ? "words" : name, String(value));
    }
    setSearchParams(params);
  }

  function handleSearch(text) {
    navigate(`/search?q=${encodeURIComponent(text)}`);
  }

  function handleRemove(name) {
    const next = { ...filters };
    delete next[name];
    openFilters(next);
  }

  function handleApply() {
    const next = { ...filters };
    for (const name of STRIP_KEYS) delete next[name];
    openFilters({ ...next, ...paramsFromStrip(strip) });
  }

  function handleSort(sort) {
    openFilters({ ...filters, sort });
  }

  function handleClear() {
    openFilters(q ? { q } : {});
  }

  function scrollToFilters() {
    const target = document.getElementById("search-filters");
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  let heading = "";
  if (data && !loading) {
    if (items.length === 0) heading = "No phones found";
    else heading = items.length === 1 ? "1 phone" : `${items.length} phones`;
  }

  return (
    <div className="search-page">
      <section className="cs-section cs-section-alt search-top">
        <div className="cs-container search-top-inner">
          <SearchBar key={q} defaultValue={q} onSearch={handleSearch} autoFocus={empty} />
          {showChips && !loading && (
            <UnderstoodChips filters={filters} onRemove={handleRemove} />
          )}
          {empty ? (
            <p className="cs-subheading search-hint">Type what you need and press Enter.</p>
          ) : (
            <div className="search-count">
              {heading && <h1 className="cs-heading">{heading}</h1>}
              {!heading && <h1 className="visually-hidden">Search results</h1>}
              {q && <p className="cs-subheading search-for">for {q}</p>}
            </div>
          )}
        </div>
      </section>

      {!empty && showStrip && (
        <section className="search-strip-band" aria-label="Filters">
          <div className="cs-container">
            <div className="search-strip-tools">
              <button type="button" className="search-filters-link" onClick={scrollToFilters}>
                <FiSliders aria-hidden="true" />
                Filters
              </button>
              <span className="search-strip-rule" aria-hidden="true" />
              <SortSelect value={filters.sort || "newest"} onChange={handleSort} />
            </div>
            <FilterStrip
              id="search-filters"
              value={strip}
              onChange={setStrip}
              onApply={handleApply}
              maxPlaceholder="400"
            />
          </div>
        </section>
      )}

      {!empty && (
        <section className="cs-section cs-section-alt search-results">
          <div className="cs-container">
            {loading && <Loader label="Searching phones" />}

            {!loading && error && (
              <EmptyState
                title="We could not run this search"
                message={error}
                action={
                  <button type="button" className="btn btn-outline-primary" onClick={reload}>
                    Try again
                  </button>
                }
              />
            )}

            {!loading && !error && data && items.length === 0 && (
              <div className="cs-card search-none">
                <p className="search-none-title">Nothing in our data matches all of that.</p>
                <p className="search-none-text">Try raising the budget or removing a filter.</p>
                <div className="search-none-actions">
                  <button type="button" className="btn btn-primary" onClick={handleClear}>
                    Clear filters
                  </button>
                  <Link
                    to={`/assistant?q=${encodeURIComponent(q)}`}
                    className="cs-link-chevron search-none-link"
                  >
                    Ask the assistant
                    <FiChevronRight aria-hidden="true" />
                  </Link>
                </div>
              </div>
            )}

            {!loading && !error && items.length > 0 && (
              <>
                {added && (
                  <NoticeBar>
                    This phone was not in our data. The assistant added its specifications. The
                    price is an estimate until we check it.
                  </NoticeBar>
                )}
                <div className={items.length === 1 && added ? "search-single" : "cs-grid"}>
                  {items.map((phone) => (
                    <PhoneCard key={phone.slug} phone={phone} />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

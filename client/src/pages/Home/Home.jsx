import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import SearchBar from "../../components/ibrahim/SearchBar.jsx";
import PhoneImage from "../../components/shared/PhoneImage.jsx";
import Loader from "../../components/shared/Loader.jsx";
import { comparePhones } from "../../services/phones.service.js";
import { useAsync } from "../../hooks/useAsync.js";
import "./Home.css";

const suggestions = [
  "Best battery under $300",
  "Gaming phone with 12GB RAM",
  "Cheapest 5G phone",
];

const heroPhones = [
  { brand: "Samsung", model: "Galaxy S24", imageUrl: "/phones/samsung-galaxy-s24.png" },
  { brand: "Samsung", model: "Galaxy S24 Plus", imageUrl: "/phones/samsung-galaxy-s24-plus.png" },
  { brand: "Samsung", model: "Galaxy S24 Ultra", imageUrl: "/phones/samsung-galaxy-s24-ultra.png" },
];

const brands = [
  { name: "Samsung", phone: { brand: "Samsung", model: "Galaxy S24", imageUrl: "/phones/samsung-galaxy-s24.png" } },
  { name: "Apple", phone: { brand: "Apple", model: "iPhone 15", imageUrl: "/phones/apple-iphone-15.png" } },
  { name: "OnePlus", phone: { brand: "OnePlus", model: "OnePlus 12", imageUrl: "/phones/oneplus-12.png" } },
  { name: "Xiaomi", phone: { brand: "Xiaomi", model: "Redmi Note 13 Pro", imageUrl: "/phones/xiaomi-redmi-note-13-pro.png" } },
  { name: "Vivo", phone: { brand: "Vivo", model: "V30", imageUrl: "/phones/vivo-v30.png" } },
];

const teaserSlugs = ["samsung-galaxy-s24", "xiaomi-redmi-note-13-pro"];

const teaserRows = [
  { key: "mainCamera", label: "Camera", read: (phone) => phone.specs?.mainCamera, unit: (value) => `${value} MP` },
  { key: "battery", label: "Battery", read: (phone) => phone.specs?.battery, unit: (value) => `${value} mAh` },
  { key: "ram", label: "RAM", read: (phone) => phone.specs?.ram, unit: (value) => `${value} GB` },
  { key: "price", label: "Price", read: (phone) => phone.price?.current, unit: (value, phone) => formatPrice(value, phone) },
];

function formatPrice(value, phone) {
  const currency = phone.price?.currency || "USD";
  return currency === "USD" ? `$${value}` : `${value} ${currency}`;
}

function CompareTeaser() {
  const { data, loading, error, reload } = useAsync(() => comparePhones(teaserSlugs), []);

  if (loading) {
    return <Loader label="Loading the comparison" />;
  }

  if (error || !data || !Array.isArray(data.phones) || data.phones.length < 2) {
    return (
      <div className="home-teaser-error" role="alert">
        <p>{error || "The comparison could not be loaded."}</p>
        <button type="button" className="btn btn-outline-primary" onClick={reload}>
          Try again
        </button>
      </div>
    );
  }

  const [left, right] = data.phones;
  const best = data.best || {};

  function cell(row, phone) {
    const value = row.read(phone);
    const winners = best[row.key] || [];
    const className = winners.includes(phone.slug) ? "cs-cell-best" : undefined;
    return (
      <td className={className}>{value == null ? "Not listed" : row.unit(value, phone)}</td>
    );
  }

  return (
    <div className="home-teaser">
      <div className="home-teaser-phone">
        <PhoneImage phone={left} />
      </div>
      <div className="home-teaser-middle">
        <table className="table home-teaser-table">
          <caption className="visually-hidden">
            {`${left.model} against ${right.model}`}
          </caption>
          <thead className="visually-hidden">
            <tr>
              <th scope="col">Spec</th>
              <th scope="col">{left.model}</th>
              <th scope="col">{right.model}</th>
            </tr>
          </thead>
          <tbody>
            {teaserRows.map((row) => (
              <tr key={row.key}>
                <th scope="row">{row.label}</th>
                {cell(row, left)}
                {cell(row, right)}
              </tr>
            ))}
          </tbody>
        </table>
        <Link to="/compare" className="cs-link-chevron home-teaser-link">
          Open compare
          <FiChevronRight aria-hidden="true" />
        </Link>
      </div>
      <div className="home-teaser-phone">
        <PhoneImage phone={right} />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <section className="cs-section home-hero">
        <div className="cs-container">
          <h1 className="cs-heading home-title">
            Find a phone by budget, camera, battery and brand
          </h1>
          <p className="cs-subheading">
            Ask in plain words. We answer from real specs and dated prices.
          </p>
          <div className="home-search">
            <SearchBar />
          </div>
          <ul className="home-suggestions">
            {suggestions.map((suggestion) => (
              <li key={suggestion}>
                <Link
                  to={`/search?q=${encodeURIComponent(suggestion)}`}
                  className="cs-link-chevron"
                >
                  {suggestion}
                  <FiChevronRight aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
          <div className="home-hero-phones">
            {heroPhones.map((phone) => (
              <div key={phone.model} className="home-hero-phone">
                <PhoneImage phone={phone} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cs-section cs-section-alt">
        <div className="cs-container">
          <h2 className="cs-heading home-section-title">Compare side by side</h2>
          <p className="cs-subheading">Two to four phones, every spec in one table.</p>
          <CompareTeaser />
        </div>
      </section>

      <section className="cs-section">
        <div className="cs-container">
          <h2 className="cs-heading home-section-title">Ask the assistant</h2>
          <p className="cs-subheading">
            It answers from the same phone data as the site, with the date each price was checked.
          </p>
          <div className="home-chat" aria-label="Sample conversation">
            <p className="home-bubble home-bubble-user">Best camera phone under $400?</p>
            <p className="home-bubble home-bubble-reply">
              Two phones fit. Redmi Note 13 Pro at $299 and Vivo V30 at $399.
            </p>
          </div>
          <div className="home-chat-action">
            <Link to="/assistant" className="btn btn-primary">
              Open the assistant
            </Link>
          </div>
        </div>
      </section>

      <section className="cs-section cs-section-alt">
        <div className="cs-container">
          <h2 className="cs-heading home-section-title">Browse by brand</h2>
          <ul className="home-brands">
            {brands.map((brand) => (
              <li key={brand.name}>
                <Link to={`/browse/${brand.name.toLowerCase()}`} className="cs-card home-brand">
                  <span className="home-brand-image" aria-hidden="true">
                    <PhoneImage phone={brand.phone} />
                  </span>
                  <span className="home-brand-name">{brand.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

import { Link } from "react-router-dom";

const columns = [
  {
    title: "Explore",
    links: [
      { label: "Browse phones", to: "/browse" },
      { label: "Compare", to: "/compare" },
      { label: "Recommend", to: "/recommend" },
      { label: "Assistant", to: "/assistant" },
      { label: "Dashboard", to: "/dashboard" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Log in", to: "/login" },
      { label: "Create account", to: "/register" },
      { label: "Favourites", to: "/dashboard#favourites" },
      { label: "Search history", to: "/dashboard#history" },
    ],
  },
  {
    title: "Brands",
    links: [
      { label: "Samsung", to: "/browse/samsung" },
      { label: "Apple", to: "/browse/apple" },
      { label: "OnePlus", to: "/browse/oneplus" },
      { label: "Xiaomi", to: "/browse/xiaomi" },
      { label: "Vivo", to: "/browse/vivo" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "About CellSense AI", to: "/about#about" },
      { label: "How prices work", to: "/about#prices" },
      { label: "ASKME Ltd.", to: "/about#askme" },
      { label: "Contact", to: "/about#contact" },
    ],
  },
];

const team = ["Gerald", "Ibrahim", "Osakue", "Aptech semester 1 eProject"];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="cs-footer">
      <div className="cs-container">
        <div className="cs-footer-grid">
          {columns.map((column) => (
            <div key={column.title}>
              <h2 className="cs-footer-title">{column.title}</h2>
              <ul className="cs-footer-list">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="cs-footer-link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h2 className="cs-footer-title">Built by</h2>
            <ul className="cs-footer-list">
              {team.map((name) => (
                <li key={name} className="cs-footer-text">
                  {name}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="cs-footer-bottom">
          <div className="cs-footer-legal">
            <span>Copyright {year} CellSense AI. All rights reserved.</span>
            <span>An eProject built for ASKME Ltd.</span>
            <span>
              Prices are guide prices with the date they were checked.
            </span>
          </div>
          <span className="cs-footer-region">Nigeria / English</span>
        </div>
      </div>
    </footer>
  );
}

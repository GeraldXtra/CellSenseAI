import { Link } from "react-router-dom";

export const BRANDS = ["Samsung", "Apple", "OnePlus", "Xiaomi", "Vivo"];

export default function BrandTabs({ active = "" }) {
  const tabs = [{ label: "All", to: "/browse", name: "" }].concat(
    BRANDS.map((name) => ({ label: name, to: `/browse/${name.toLowerCase()}`, name })),
  );

  return (
    <nav className="brand-tabs" aria-label="Brands">
      {tabs.map((tab) => {
        const current = tab.name.toLowerCase() === active.toLowerCase();
        return (
          <Link
            key={tab.label}
            to={tab.to}
            className={current ? "brand-tab brand-tab-active" : "brand-tab"}
            aria-current={current ? "page" : undefined}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

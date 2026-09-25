// NotFound page. Owner: Gerald. Match docs/ui/page-not-found.png.
import PhoneCard from "../../components/shared/PhoneCard.jsx";
import { mockPhones } from "../../data/mockPhones.js";

export default function NotFound() {
  return (
    <section className="cs-section">
      <div
        className="cs-container"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "24px",
        }}
      >
        {mockPhones.map((phone) => (
          <PhoneCard
            key={phone.slug}
            phone={phone}
            rank={1}
            reason="Best battery for your budget"
          />
        ))}
      </div>
    </section>
  );
}

// PhoneCard: the product card with the picture, the name, one spec line, the price, the Compare checkbox and the See details link. Owner: Gerald.
import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import PhoneImage, { phoneName } from "./PhoneImage.jsx";
import { useCompare } from "../../context/CompareContext.jsx";

export function specLine(phone) {
  const specs = phone.specs || {};
  return `${specs.ram} GB, ${specs.storage} GB, ${specs.mainCamera} MP, ${specs.battery} mAh`;
}

export default function PhoneCard({
  phone,
  rank,
  reason,
  estimated = false,
  compare = true,
}) {
  const { has, add, remove } = useCompare();
  const checked = has ? has(phone.slug) : false;

  function toggleCompare(event) {
    if (!add || !remove) return;
    if (event.target.checked) add(phone.slug);
    else remove(phone.slug);
  }

  return (
    <article className="cs-phone-card">
      {rank && <span className="cs-phone-rank">{rank}</span>}
      <Link to={`/phones/${phone.slug}`} className="cs-phone-card-image">
        <PhoneImage phone={phone} />
      </Link>
      <h3 className="cs-phone-card-name">{phoneName(phone)}</h3>
      <p className="cs-phone-card-specs">{specLine(phone)}</p>
      <p className="cs-price">
        ${phone.price.current}
        {estimated && <span className="cs-estimated">Estimated</span>}
      </p>
      {reason && <p className="cs-phone-card-reason">{reason}</p>}
      <div className="cs-phone-card-actions">
        {compare && (
          <label className="cs-compare-check">
            <input type="checkbox" checked={checked} onChange={toggleCompare} />
            Compare
          </label>
        )}
        <Link to={`/phones/${phone.slug}`} className="cs-link-chevron">
          See details <FiChevronRight />
        </Link>
      </div>
    </article>
  );
}

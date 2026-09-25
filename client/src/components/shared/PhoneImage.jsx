// PhoneImage: the phone picture when there is one, otherwise a plain grey box with the phone name. Owner: Gerald.
export function phoneName(phone) {
  const brand = phone.brand || "";
  const model = phone.model || "";
  if (model.toLowerCase().startsWith(brand.toLowerCase())) return model;
  return `${brand} ${model}`.trim();
}

export default function PhoneImage({ phone, className = "" }) {
  const name = phoneName(phone);

  if (phone.imageUrl) {
    return (
      <img
        src={phone.imageUrl}
        alt={name}
        className={`cs-phone-image ${className}`}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`cs-phone-image cs-phone-placeholder ${className}`}
      aria-label={name}
    >
      {name}
    </div>
  );
}

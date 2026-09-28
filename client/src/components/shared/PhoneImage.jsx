import { useState } from "react";

export function phoneName(phone) {
  const brand = phone && phone.brand ? String(phone.brand).trim() : "";
  const model = phone && phone.model ? String(phone.model).trim() : "";
  if (!brand) return model;
  if (model.toLowerCase().startsWith(brand.toLowerCase())) return model;
  return `${brand} ${model}`.trim();
}

function join(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function PhoneImage({ phone, className = "" }) {
  const [brokenUrl, setBrokenUrl] = useState(null);
  const name = phoneName(phone);
  const imageUrl = phone && phone.imageUrl ? phone.imageUrl : "";

  if (imageUrl && imageUrl !== brokenUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={join("cs-phone-image", className)}
        loading="lazy"
        onError={() => setBrokenUrl(imageUrl)}
      />
    );
  }

  return (
    <div
      className={join("cs-phone-image", "cs-phone-placeholder", className)}
      role="img"
      aria-label={name || "Phone"}
    >
      <span aria-hidden="true">{name}</span>
    </div>
  );
}

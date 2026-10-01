import { useState } from "react";

export function phoneName(phone) {
  const brand = phone.brand || "";
  const model = phone.model || "";
  if (model.toLowerCase().startsWith(brand.toLowerCase())) return model;
  return `${brand} ${model}`.trim();
}

export default function PhoneImage({ phone, className = "" }) {
  const [failedUrl, setFailedUrl] = useState("");
  const name = phoneName(phone);
  const showPicture = phone.imageUrl && failedUrl !== phone.imageUrl;

  if (showPicture) {
    return (
      <img
        src={phone.imageUrl}
        alt={name}
        className={`cs-phone-image ${className}`}
        loading="lazy"
        onError={() => setFailedUrl(phone.imageUrl)}
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

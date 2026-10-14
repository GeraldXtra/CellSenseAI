export const CATEGORIES = ["budget", "midrange", "flagship", "gaming", "camera"];

export const SOURCE_LABELS = {
  seed: "From our list",
  ai: "Estimated",
  admin: "Added by admin",
};

export function categoryLabel(category) {
  if (!category) return "";
  return category.charAt(0).toUpperCase() + category.slice(1);
}

export function formatDay(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatPrice(price) {
  if (!price || price.current == null) return "";
  return `$${price.current}`;
}

export function localToday() {
  return new Date().toLocaleDateString("en-CA");
}

export function checkedOnOrAfter(phone, day) {
  const updatedAt = phone.price && phone.price.updatedAt;
  if (!updatedAt || !day) return false;
  return new Date(updatedAt) >= new Date(`${day}T00:00:00.000Z`);
}

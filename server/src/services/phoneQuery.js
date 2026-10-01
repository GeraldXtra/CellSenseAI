// phoneQuery: builds and runs the MongoDB phone query from a set of filters. Owner: Gerald.
const CATEGORIES = ["budget", "midrange", "flagship", "gaming", "camera"];

const SORTS = {
  newest: { releaseYear: -1, brand: 1, model: 1 },
  priceAsc: { "price.current": 1 },
  priceDesc: { "price.current": -1 },
  camera: { "specs.mainCamera": -1, "price.current": 1 },
  battery: { "specs.battery": -1, "price.current": 1 },
};

const MINIMUMS = {
  minRam: "specs.ram",
  minStorage: "specs.storage",
  minCamera: "specs.mainCamera",
  minBattery: "specs.battery",
  minRefresh: "specs.refreshRate",
};

export function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toNumber(value) {
  const number = Number(value);
  return value !== undefined && value !== "" && Number.isFinite(number)
    ? number
    : null;
}

export function buildPhoneFilter(query = {}) {
  const filter = {};

  if (query.brand) {
    const brands = String(query.brand)
      .split(",")
      .map((b) => b.trim())
      .filter(Boolean);
    if (brands.length) {
      filter.brand = {
        $in: brands.map((b) => new RegExp(`^${escapeRegex(b)}$`, "i")),
      };
    }
  }

  if (CATEGORIES.includes(query.category)) filter.category = query.category;
  if (query.has5G === "true" || query.has5G === true)
    filter["specs.has5G"] = true;

  for (const [param, field] of Object.entries(MINIMUMS)) {
    const value = toNumber(query[param]);
    if (value !== null) filter[field] = { $gte: value };
  }

  const minPrice = toNumber(query.minPrice);
  const maxPrice = toNumber(query.maxPrice);
  if (minPrice !== null || maxPrice !== null) {
    filter["price.current"] = {};
    if (minPrice !== null) filter["price.current"].$gte = minPrice;
    if (maxPrice !== null) filter["price.current"].$lte = maxPrice;
  }

  const words = String(query.q || "")
    .trim()
    .slice(0, 100)
    .split(/\s+/)
    .filter(Boolean);
  if (words.length) {
    filter.$and = words.map((word) => {
      const pattern = new RegExp(escapeRegex(word), "i");
      return { $or: [{ brand: pattern }, { model: pattern }] };
    });
  }

  return filter;
}

export function buildSort(sort) {
  return SORTS[sort] || SORTS.newest;
}

export function buildPage(query = {}) {
  const page = Math.max(1, Math.floor(toNumber(query.page) || 1));
  const limit = Math.min(
    50,
    Math.max(1, Math.floor(toNumber(query.limit) || 24)),
  );
  return { page, limit, skip: (page - 1) * limit };
}

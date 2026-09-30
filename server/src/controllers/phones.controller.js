// phonesController: the request handlers for the phones routes (list, compare, detail, price trend, reviews). Owner: Gerald.
import { Phone } from "../models/Phone.js";
import { Review } from "../models/Review.js";
import { ok, httpError } from "../utils/http.js";
import {
  buildPhoneFilter,
  buildSort,
  buildPage,
} from "../services/phoneQuery.js";
import { priceTrend } from "../services/price.service.js";
import {
  sentimentFromRating,
  summaryFromRatings,
} from "../services/review.service.js";

const COMPARE_ROWS = [
  { key: "price", value: (p) => p.price.current, best: "lowest" },
  { key: "ram", value: (p) => p.specs.ram, best: "highest" },
  { key: "storage", value: (p) => p.specs.storage, best: "highest" },
  { key: "mainCamera", value: (p) => p.specs.mainCamera, best: "highest" },
  { key: "frontCamera", value: (p) => p.specs.frontCamera, best: "highest" },
  { key: "battery", value: (p) => p.specs.battery, best: "highest" },
  { key: "displaySize", value: (p) => p.specs.displaySize, best: "highest" },
  { key: "refreshRate", value: (p) => p.specs.refreshRate, best: "highest" },
];

async function findPhone(slug) {
  const phone = await Phone.findOne({ slug }).lean();
  if (!phone) throw httpError(404, "Phone not found");
  return phone;
}

export async function listPhones(req, res) {
  const filter = buildPhoneFilter(req.query);
  const sort = buildSort(req.query.sort);
  const { page, limit, skip } = buildPage(req.query);

  const [items, total] = await Promise.all([
    Phone.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Phone.countDocuments(filter),
  ]);

  return ok(res, {
    items,
    total,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
  });
}

export async function comparePhones(req, res) {
  const slugs = String(req.query.ids || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);
  if (slugs.length < 2)
    throw httpError(400, "Choose at least two phones to compare");

  const found = await Phone.find({ slug: { $in: slugs } }).lean();
  const phones = slugs
    .map((slug) => found.find((p) => p.slug === slug))
    .filter(Boolean);
  if (phones.length < 2)
    throw httpError(404, "Could not find at least two of those phones");

  const best = {};
  for (const row of COMPARE_ROWS) {
    const values = phones.map(row.value);
    if (values.some((v) => typeof v !== "number")) continue;
    const target =
      row.best === "lowest" ? Math.min(...values) : Math.max(...values);
    if (values.every((v) => v === target)) continue;
    best[row.key] = phones
      .filter((p, i) => values[i] === target)
      .map((p) => p.slug);
  }

  return ok(res, { phones, best });
}

export async function getPhone(req, res) {
  const phone = await findPhone(req.params.slug);
  return ok(res, { phone });
}

export async function getPriceTrend(req, res) {
  const phone = await findPhone(req.params.slug);
  return ok(res, priceTrend(phone.priceHistory));
}

export async function listReviews(req, res) {
  const phone = await findPhone(req.params.slug);
  const items = await Review.find({ phone: phone._id })
    .select("author rating text sentiment createdAt")
    .sort({ createdAt: -1 })
    .lean();
  const count = items.length;
  const average = count
    ? Number((items.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1))
    : 0;
  return ok(res, { items, average, count });
}

export async function addReview(req, res) {
  const phone = await findPhone(req.params.slug);
  const rating = Number(req.body?.rating);
  const text = String(req.body?.text || "").trim();

  if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    throw httpError(400, "Choose a rating from 1 to 5");
  if (text.length < 3)
    throw httpError(400, "Write a few words about the phone");
  if (text.length > 1000)
    throw httpError(400, "Keep the review under 1000 characters");

  const already = await Review.exists({ phone: phone._id, user: req.user._id });
  if (already) throw httpError(409, "You have already reviewed this phone");

  const review = await Review.create({
    phone: phone._id,
    user: req.user._id,
    author: req.user.name,
    rating,
    text,
    sentiment: sentimentFromRating(rating),
  });
  return ok(res, { review }, 201);
}

export async function getReviewSummary(req, res) {
  const phone = await findPhone(req.params.slug);
  const reviews = await Review.find({ phone: phone._id })
    .select("rating")
    .lean();
  return ok(res, summaryFromRatings(reviews.map((r) => r.rating)));
}

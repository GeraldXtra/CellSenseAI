// recommendService: builds the shortlist from budget, brand and needs, then asks the model to rank it. Owner: Gerald.
import { Phone } from "../models/Phone.js";
import { escapeRegex } from "./phoneQuery.js";
import { httpError } from "../utils/http.js";

const WIDEN = 1.15;
const SHORTLIST_SIZE = 6;
const PERFORMANCE = ["basic", "balanced", "high"];
const PURPOSES = {
  everyday: {},
  photos: { camera: 2 },
  gaming: { speed: 2 },
  work: { battery: 1.5, speed: 1 },
};

export function readNeeds(body = {}) {
  const budget = Number(body.budget);
  if (!Number.isFinite(budget) || budget < 50 || budget > 5000) {
    throw httpError(400, "Enter a budget between 50 and 5000 US dollars");
  }
  const brand =
    typeof body.brand === "string" ? body.brand.trim().slice(0, 40) : "";
  return {
    budget: Math.round(budget),
    brand: brand.toLowerCase() === "any" ? "" : brand,
    purpose: Object.keys(PURPOSES).includes(body.purpose)
      ? body.purpose
      : "everyday",
    performance: PERFORMANCE.includes(body.performance)
      ? body.performance
      : "balanced",
    camera: body.camera === true,
    gaming: body.gaming === true,
    battery: body.battery === true,
  };
}

function metrics(phone) {
  const s = phone.specs || {};
  return {
    camera: Math.sqrt(s.mainCamera || 0) + 0.3 * Math.sqrt(s.frontCamera || 0),
    battery: s.battery || 0,
    speed:
      (s.ram || 0) + (s.refreshRate >= 120 ? 4 : s.refreshRate >= 90 ? 2 : 0),
    newer: Math.max(0, (phone.releaseYear || 2018) - 2018),
  };
}

function weightsFor(needs) {
  const weights = { camera: 1, battery: 1, speed: 1, newer: 0.5 };
  for (const [key, value] of Object.entries(PURPOSES[needs.purpose]))
    weights[key] += value;
  if (needs.camera) weights.camera += 2;
  if (needs.battery) weights.battery += 2;
  if (needs.gaming) weights.speed += 2;
  if (needs.performance === "high") weights.speed += 1.5;
  if (needs.performance === "basic") weights.speed = 0.5;
  return weights;
}

function scorePhones(phones, needs) {
  const weights = weightsFor(needs);
  const entries = phones.map((phone) => ({ phone, m: metrics(phone) }));
  const max = {};
  for (const key of Object.keys(weights)) {
    max[key] = Math.max(...entries.map((entry) => entry.m[key]), 1);
  }
  return entries
    .map(({ phone, m }) => ({
      phone,
      score: Object.keys(weights).reduce(
        (sum, key) => sum + (weights[key] * m[key]) / max[key],
        0,
      ),
    }))
    .sort(
      (a, b) =>
        b.score - a.score || a.phone.price.current - b.phone.price.current,
    )
    .map((entry) => entry.phone);
}

function phonesWithin(budget, brand) {
  const filter = { "price.current": { $lte: budget } };
  if (brand) filter.brand = new RegExp(`^${escapeRegex(brand)}$`, "i");
  return Phone.find(filter)
    .select("slug brand model category releaseYear specs price source imageUrl")
    .lean();
}

export async function buildShortlist(needs) {
  let budget = needs.budget;
  let pool = await phonesWithin(budget, needs.brand);
  let widened = false;

  if (pool.length < 3) {
    budget = Math.round(needs.budget * WIDEN);
    pool = await phonesWithin(budget, needs.brand);
    widened = true;
  }

  return {
    shortlist: scorePhones(pool, needs).slice(0, SHORTLIST_SIZE),
    widened,
    budget,
  };
}

export function describeNeeds(needs, widened, budget) {
  const important = ["camera", "gaming", "battery"].filter((key) => needs[key]);
  return [
    `Budget: $${needs.budget}${widened ? `, stretched to $${budget} because few phones fit` : ""}.`,
    `Brand: ${needs.brand || "any"}.`,
    `Purpose: ${needs.purpose}.`,
    `Performance: ${needs.performance}.`,
    `Matters most: ${important.length ? important.join(", ") : "nothing in particular"}.`,
  ].join(" ");
}

export function ruleReason(phone, needs) {
  const s = phone.specs || {};
  const parts = [];
  if ((needs.camera || needs.purpose === "photos") && s.mainCamera)
    parts.push(`a ${s.mainCamera} MP main camera`);
  if ((needs.battery || needs.purpose === "work") && s.battery)
    parts.push(`a ${s.battery} mAh battery`);
  if (
    (needs.gaming ||
      needs.purpose === "gaming" ||
      needs.performance === "high") &&
    s.ram
  ) {
    parts.push(
      `${s.ram} GB of RAM${s.refreshRate ? ` and a ${s.refreshRate}Hz screen` : ""}`,
    );
  }
  if (!parts.length) {
    if (s.mainCamera) parts.push(`a ${s.mainCamera} MP main camera`);
    if (s.battery) parts.push(`a ${s.battery} mAh battery`);
  }
  const list =
    parts.length > 1
      ? `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`
      : parts[0] || "a good balance of features";
  return `Guide price $${phone.price.current}, with ${list}.`;
}

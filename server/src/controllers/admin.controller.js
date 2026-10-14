// adminController: the request handlers for the admin routes (phone list, add, edit, picture, record prices). Owner: Gerald.
import { Phone } from "../models/Phone.js";
import { PhonePicture } from "../models/PhonePicture.js";
import { ok, httpError } from "../utils/http.js";
import { Slugify } from "../utils/slug.js";
import { buildPhoneFilter } from "../services/phoneQuery.js";
import { priceTrend, recordPrices } from "../services/price.service.js";

const CATEGORIES = ["budget", "midrange", "flagship", "gaming", "camera"];
const SOURCES = ["seed", "ai", "admin"];
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const TEXT_SPECS = {
  processor: "Enter a processor of up to 60 characters",
  displayType: "Enter a display type of up to 60 characters",
  os: "Enter an operating system of up to 60 characters",
};

const NUMBER_SPECS = {
  ram: { min: 1, max: 32, message: "Enter RAM between 1 and 32 GB" },
  storage: { min: 8, max: 2048, message: "Enter storage between 8 and 2048 GB" },
  mainCamera: {
    min: 2,
    max: 300,
    message: "Enter a main camera between 2 and 300 MP",
  },
  frontCamera: {
    min: 1,
    max: 100,
    message: "Enter a front camera between 1 and 100 MP",
  },
  battery: {
    min: 1000,
    max: 10000,
    message: "Enter a battery between 1000 and 10000 mAh",
  },
  displaySize: {
    min: 3,
    max: 9,
    message: "Enter a display size between 3 and 9 inches",
  },
  refreshRate: {
    min: 60,
    max: 240,
    message: "Enter a refresh rate between 60 and 240 Hz",
  },
};

function isBlank(value) {
  return (
    value === undefined ||
    value === null ||
    (typeof value === "string" && !value.trim())
  );
}

function toNumber(value) {
  if (isBlank(value) || !["number", "string"].includes(typeof value))
    return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function lagosToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function readDay(value, missingMessage) {
  const text = String(value ?? "").trim();
  const date = new Date(`${text}T00:00:00.000Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(text) ||
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== text
  )
    throw httpError(400, missingMessage);
  if (text > lagosToday())
    throw httpError(400, "The date checked can't be in the future");
  return date;
}

function readCategory(value) {
  if (!CATEGORIES.includes(value))
    throw httpError(
      400,
      "Choose a category: budget, midrange, flagship, gaming or camera",
    );
  return value;
}

function readReleaseYear(value) {
  const nextYear = new Date().getFullYear() + 1;
  const year = toNumber(value);
  if (!Number.isInteger(year) || year < 2010 || year > nextYear)
    throw httpError(400, `Enter a release year between 2010 and ${nextYear}`);
  return year;
}

function readSummary(value) {
  if (isBlank(value)) return "";
  if (typeof value !== "string")
    throw httpError(400, "Write the summary as text");
  const summary = value.trim();
  if (summary.length > 400)
    throw httpError(400, "Keep the summary under 400 characters");
  return summary;
}

function readSpecs(raw) {
  if (raw === undefined || raw === null) return { set: {}, unset: [] };
  if (typeof raw !== "object" || Array.isArray(raw))
    throw httpError(400, "Send the specs as a set of fields");

  const set = {};
  const unset = [];

  for (const [key, message] of Object.entries(TEXT_SPECS)) {
    if (!(key in raw)) continue;
    if (isBlank(raw[key])) {
      unset.push(key);
      continue;
    }
    if (typeof raw[key] !== "string") throw httpError(400, message);
    const text = raw[key].trim();
    if (text.length > 60) throw httpError(400, message);
    set[key] = text;
  }

  for (const [key, rule] of Object.entries(NUMBER_SPECS)) {
    if (!(key in raw)) continue;
    if (isBlank(raw[key])) {
      unset.push(key);
      continue;
    }
    const number = toNumber(raw[key]);
    if (number === null || number < rule.min || number > rule.max)
      throw httpError(400, rule.message);
    set[key] = number;
  }

  if ("has5G" in raw) {
    if (typeof raw.has5G !== "boolean")
      throw httpError(400, "Choose whether the phone has 5G");
    set.has5G = raw.has5G;
  }

  return { set, unset };
}

async function findPhone(slug) {
  const phone = await Phone.findOne({ slug }).lean();
  if (!phone) throw httpError(404, "Phone not found");
  return phone;
}

function withTrend(phone) {
  const history = phone.priceHistory || [];
  return {
    ...phone,
    trend: history.length >= 2 ? priceTrend(history).trend : null,
  };
}

function distinctBrands(brands) {
  const seen = new Set();
  return brands
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }))
    .filter((brand) => {
      const key = brand.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export async function listPhones(req, res) {
  const page = Math.max(1, Math.floor(toNumber(req.query.page) || 1));
  const limit = Math.min(
    200,
    Math.max(1, Math.floor(toNumber(req.query.limit) || 20)),
  );
  const filter = buildPhoneFilter({ q: req.query.q, brand: req.query.brand });
  if (SOURCES.includes(req.query.source)) filter.source = req.query.source;

  const [items, total, phones, estimated, latest, brands] = await Promise.all([
    Phone.find(filter)
      .collation({ locale: "en", strength: 2 })
      .sort({ brand: 1, model: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Phone.countDocuments(filter),
    Phone.countDocuments(),
    Phone.countDocuments({ source: "ai" }),
    Phone.findOne({ "price.updatedAt": { $ne: null } })
      .sort({ "price.updatedAt": -1 })
      .select("price.updatedAt")
      .lean(),
    Phone.distinct("brand"),
  ]);

  return ok(res, {
    items: items.map(withTrend),
    total,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
    counts: {
      phones,
      estimated,
      lastCheck: latest?.price?.updatedAt ?? null,
    },
    brands: distinctBrands(brands),
  });
}

export async function getPhone(req, res) {
  return ok(res, { phone: await findPhone(req.params.slug) });
}

export async function createPhone(req, res) {
  const body = req.body || {};
  const brand = String(body.brand ?? "").trim();
  const model = String(body.model ?? "").trim();

  if (!brand || brand.length > 40)
    throw httpError(400, "Enter a brand between 1 and 40 characters");
  if (!model || model.length > 60)
    throw httpError(400, "Enter a model between 1 and 60 characters");
  const category = readCategory(body.category);
  const releaseYear = readReleaseYear(body.releaseYear);
  const { set: specs } = readSpecs(body.specs);
  if (specs.has5G === undefined) specs.has5G = false;

  const price = toNumber(body.price);
  if (!Number.isInteger(price) || price < 20 || price > 5000)
    throw httpError(400, "Enter a guide price between 20 and 5000 US dollars");
  const checkedOn = readDay(
    body.checkedOn,
    "Enter the date the price was checked",
  );
  const aiSummary = readSummary(body.aiSummary);

  const slug = Slugify(`${brand} ${model}`);
  if (!slug)
    throw httpError(400, "Enter a brand and a model with letters or digits");
  if (await Phone.exists({ slug }))
    throw httpError(409, "That phone is already in the list");

  try {
    const phone = await Phone.create({
      slug,
      brand,
      model,
      imageUrl: "",
      category,
      releaseYear,
      specs,
      price: { current: price, currency: "USD", updatedAt: checkedOn },
      priceHistory: [{ price, date: checkedOn, source: "manual" }],
      aiSummary,
      source: "admin",
    });
    return ok(res, { phone: phone.toObject() }, 201);
  } catch (err) {
    if (err.code === 11000)
      throw httpError(409, "That phone is already in the list");
    throw err;
  }
}

function pictureUrl(slug, updatedAt) {
  return `/api/uploads/phones/${slug}.png?v=${new Date(updatedAt).getTime()}`;
}

function hasUploadedPicture(phone) {
  const path = `/api/uploads/phones/${phone.slug}.png`;
  const imageUrl = phone.imageUrl || "";
  return imageUrl === path || imageUrl.startsWith(`${path}?`);
}

async function movePictureTo(from, to) {
  await PhonePicture.deleteOne({ slug: to });
  return PhonePicture.findOneAndUpdate(
    { slug: from },
    { $set: { slug: to } },
    { new: true },
  ).lean();
}

export async function updatePhone(req, res) {
  const phone = await findPhone(req.params.slug);
  const body = req.body || {};

  const brand =
    body.brand !== undefined ? String(body.brand ?? "").trim() : phone.brand;
  const model =
    body.model !== undefined ? String(body.model ?? "").trim() : phone.model;
  const renamed = brand !== phone.brand || model !== phone.model;
  let slug = phone.slug;

  if (renamed) {
    if (phone.source === "seed")
      throw httpError(400, "Built in phones keep their brand and model");
    if (!brand || brand.length > 40)
      throw httpError(400, "Enter a brand between 1 and 40 characters");
    if (!model || model.length > 60)
      throw httpError(400, "Enter a model between 1 and 60 characters");
    slug = Slugify(`${brand} ${model}`);
    if (!slug)
      throw httpError(400, "Enter a brand and a model with letters or digits");
    if (slug !== phone.slug && (await Phone.exists({ slug })))
      throw httpError(409, "That phone is already in the list");
  }

  if (
    (body.price !== undefined &&
      toNumber(body.price) !== phone.price.current) ||
    body.checkedOn !== undefined ||
    body.priceHistory !== undefined
  )
    throw httpError(400, "Change prices on the Record prices page");

  const set = {};
  const unset = {};
  if (body.category !== undefined) set.category = readCategory(body.category);
  if (body.releaseYear !== undefined)
    set.releaseYear = readReleaseYear(body.releaseYear);
  const specs = readSpecs(body.specs);
  for (const [key, value] of Object.entries(specs.set))
    set[`specs.${key}`] = value;
  for (const key of specs.unset) unset[`specs.${key}`] = 1;
  if (body.aiSummary !== undefined) set.aiSummary = readSummary(body.aiSummary);
  if (phone.source === "ai") set.source = "admin";

  const movePicture = slug !== phone.slug && hasUploadedPicture(phone);
  if (renamed) {
    set.brand = brand;
    set.model = model;
    set.slug = slug;
  }
  if (movePicture) {
    const moved = await movePictureTo(phone.slug, slug);
    if (moved) set.imageUrl = pictureUrl(slug, moved.updatedAt);
  }

  const update = { $set: set };
  if (Object.keys(unset).length) update.$unset = unset;

  try {
    const saved = await Phone.findOneAndUpdate({ _id: phone._id }, update, {
      new: true,
      runValidators: true,
    }).lean();
    return ok(res, { phone: saved });
  } catch (err) {
    if (set.imageUrl) await movePictureTo(slug, phone.slug).catch(() => {});
    if (err.code === 11000)
      throw httpError(409, "That phone is already in the list");
    throw err;
  }
}

export async function uploadPicture(req, res) {
  const phone = await findPhone(req.params.slug);
  const file = req.file;
  if (
    !file ||
    file.buffer.length < PNG_SIGNATURE.length ||
    !file.buffer.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)
  )
    throw httpError(400, "Upload a PNG picture");

  const picture = await PhonePicture.findOneAndUpdate(
    { slug: phone.slug },
    {
      $set: {
        data: file.buffer,
        contentType: "image/png",
        size: file.buffer.length,
      },
    },
    { upsert: true, new: true },
  ).lean();

  const saved = await Phone.findOneAndUpdate(
    { _id: phone._id },
    { $set: { imageUrl: pictureUrl(phone.slug, picture.updatedAt) } },
    { new: true },
  ).lean();
  return ok(res, { phone: saved });
}

export async function recordPriceList(req, res) {
  const checkedOn = readDay(
    req.body?.checkedOn,
    "Enter the date the prices were checked",
  );
  const raw = req.body?.prices;
  const prices = {};
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    for (const [slug, price] of Object.entries(raw)) {
      if (!isBlank(price)) prices[slug] = price;
    }
  }
  if (!Object.keys(prices).length)
    throw httpError(400, "Enter at least one new price");

  const { changed, unchanged, skipped, missing } = await recordPrices(
    checkedOn,
    prices,
  );
  return ok(res, { changed, unchanged, skipped, notFound: missing });
}

// aiService: the one file that calls the OpenAI compatible chat API for search filters, chat replies, recommendations and summaries. Owner: Gerald.
import { env } from "../config/env.js";
import { httpError } from "../utils/http.js";

const NUMBER_FILTERS = [
  "minPrice",
  "maxPrice",
  "minRam",
  "minStorage",
  "minCamera",
  "minBattery",
  "minRefresh",
];
const SORTS = ["newest", "priceAsc", "priceDesc", "camera", "battery"];

const SEARCH_PROMPT = `You turn a shopper's request for a phone into search filters for a phone database.
Reply with one JSON object and nothing else.
Use only these keys, and leave out any key the request does not mention:
brand: a phone brand such as Samsung, Apple, OnePlus, Xiaomi or Vivo. Several brands are separated by commas.
minPrice, maxPrice: numbers in US dollars.
has5G: true.
minRam, minStorage: numbers in GB.
minCamera: the main camera in megapixels.
minBattery: the battery in mAh.
minRefresh: the display refresh rate in Hz.
category: one of budget, midrange, flagship, gaming, camera.
sort: one of priceAsc, priceDesc, camera, battery, newest.
keywords: only a model name the shopper typed, such as Galaxy S24. Never general words like phone, good or cheap.
Meanings: "under 400" means maxPrice 400. "good camera" or "great camera" means minCamera 48 and sort camera. "long battery" means minBattery 5000 and sort battery. "gaming" means minRam 8 and minRefresh 120. "cheap" or "cheapest" means sort priceAsc.
Example: phone under $400 with a great camera
{"maxPrice":400,"minCamera":48,"sort":"camera"}
Example: Samsung with a long battery and 5G
{"brand":"Samsung","has5G":true,"minBattery":5000,"sort":"battery"}`;

export function isAIConfigured() {
  return Boolean(env.AI_BASE_URL && env.AI_API_KEY && env.AI_MODEL);
}

export async function askModel(messages, { temperature = 0.2 } = {}) {
  if (!isAIConfigured())
    throw httpError(503, "The AI features are not set up yet");

  const url = `${env.AI_BASE_URL.replace(/\/+$/, "")}/chat/completions`;
  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.AI_API_KEY}`,
      },
      body: JSON.stringify({ model: env.AI_MODEL, messages, temperature }),
      signal: AbortSignal.timeout(20000),
    });
  } catch (err) {
    console.error(`AI request to ${url} failed: ${err.message}`);
    throw httpError(
      502,
      "Could not reach the AI service. Try again in a moment.",
    );
  }

  const text = await response.text();
  if (!response.ok) {
    console.error(
      `AI request to ${url} failed with ${response.status}: ${text.slice(0, 300)}`,
    );
    throw httpError(
      502,
      "The AI service did not answer. Try again in a moment.",
    );
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    console.error(`AI reply from ${url} was not JSON: ${text.slice(0, 300)}`);
    throw httpError(502, "The AI service sent a reply we could not read.");
  }
  return data.choices?.[0]?.message?.content?.trim() || "";
}

export function readJson(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

function cleanFilters(raw) {
  const filters = {};
  if (typeof raw.brand === "string" && raw.brand.trim())
    filters.brand = raw.brand.trim();
  for (const key of NUMBER_FILTERS) {
    const value = Number(raw[key]);
    if (
      raw[key] !== undefined &&
      raw[key] !== null &&
      Number.isFinite(value) &&
      value > 0
    ) {
      filters[key] = value;
    }
  }
  if (raw.has5G === true) filters.has5G = true;
  if (typeof raw.category === "string") filters.category = raw.category;
  if (SORTS.includes(raw.sort)) filters.sort = raw.sort;
  if (typeof raw.keywords === "string" && raw.keywords.trim())
    filters.q = raw.keywords.trim();
  return filters;
}

export async function parseSearchQuery(query) {
  const reply = await askModel(
    [
      { role: "system", content: SEARCH_PROMPT },
      { role: "user", content: query },
    ],
    { temperature: 0 },
  );
  return cleanFilters(readJson(reply) || {});
}

const CATEGORIES = ["budget", "midrange", "flagship", "gaming", "camera"];

const LOOKUP_PROMPT = `You are a phone specifications reference. The user names a phone.
If it is a real phone model that you know well, reply with one JSON object and nothing else, in exactly this shape:
{"found":true,"brand":"Samsung","model":"Galaxy S24","category":"flagship","releaseYear":2024,"price":699,"summary":"A compact flagship with a bright 120Hz screen and a strong main camera. Battery is average for the size.","specs":{"processor":"Exynos 2400","ram":8,"storage":256,"mainCamera":50,"frontCamera":12,"battery":4000,"displaySize":6.2,"displayType":"AMOLED","refreshRate":120,"os":"Android 14","has5G":true}}
brand is the maker only. model is the name without the brand.
category is one of budget, midrange, flagship, gaming, camera.
price is a typical guide price in US dollars, as a whole number.
ram and storage are in GB, cameras in megapixels, battery in mAh, displaySize in inches, refreshRate in Hz.
summary is one or two plain sentences about who the phone suits.
If you are not sure the phone exists, or it is not a phone, reply {"found":false}.`;

function cleanNumber(value, min, max) {
  const number = Number(value);
  return Number.isFinite(number) && number >= min && number <= max
    ? number
    : undefined;
}

function cleanText(value, max = 80) {
  return typeof value === "string" && value.trim()
    ? value.trim().slice(0, max)
    : undefined;
}

export async function lookUpPhone(name) {
  const reply = await askModel(
    [
      { role: "system", content: LOOKUP_PROMPT },
      { role: "user", content: name },
    ],
    { temperature: 0 },
  );
  const raw = readJson(reply);
  if (!raw || raw.found !== true) return null;

  const brand = cleanText(raw.brand, 40);
  const model = cleanText(raw.model, 60);
  const price = cleanNumber(raw.price, 20, 5000);
  if (!brand || !model || !price) return null;

  const specs = raw.specs || {};
  const thisYear = new Date().getFullYear();

  return {
    brand,
    model,
    category: CATEGORIES.includes(raw.category) ? raw.category : "midrange",
    releaseYear: cleanNumber(raw.releaseYear, 2000, thisYear + 1),
    price: Math.round(price),
    summary: cleanText(raw.summary, 400) || "",
    specs: {
      processor: cleanText(specs.processor),
      ram: cleanNumber(specs.ram, 1, 32),
      storage: cleanNumber(specs.storage, 8, 2048),
      mainCamera: cleanNumber(specs.mainCamera, 2, 300),
      frontCamera: cleanNumber(specs.frontCamera, 1, 100),
      battery: cleanNumber(specs.battery, 1000, 10000),
      displaySize: cleanNumber(specs.displaySize, 3, 9),
      displayType: cleanText(specs.displayType, 30),
      refreshRate: cleanNumber(specs.refreshRate, 30, 240),
      os: cleanText(specs.os, 30),
      has5G: specs.has5G === true,
    },
  };
}

const CHAT_RULES = `You are the CellSense AI assistant on a phone information website run by ASKME Ltd.
Answer questions about phones, specs, prices, comparisons and what to buy.
Use only the phone data below for specs and prices. Never invent a spec or a price.
Prices are guide prices in US dollars with the date they were checked. Say "guide price" when you give one.
A phone marked estimated has specs and a price that are estimates. Say so when you mention it.
If the data does not cover what the person asks, say so plainly and suggest they search the site for that phone.
If the question is not about phones, say politely that you can only help with phones.
Keep the answer short: at most four sentences, and at most three phones.
Write plain text only: no markdown, no asterisks, no bullet points, no headings, no tables.
When you name a phone, write its full name exactly as it appears in the data.`;

function phoneLine(phone) {
  const s = phone.specs || {};
  const parts = [
    s.ram && `${s.ram} GB RAM`,
    s.storage && `${s.storage} GB storage`,
    s.mainCamera && `${s.mainCamera} MP main camera`,
    s.frontCamera && `${s.frontCamera} MP front camera`,
    s.battery && `${s.battery} mAh battery`,
    s.displaySize && `${s.displaySize} inch screen`,
    s.displayType,
    s.refreshRate && `${s.refreshRate}Hz`,
    s.processor,
    s.os,
    s.has5G ? "5G" : "no 5G",
  ].filter(Boolean);
  const checked = phone.price?.updatedAt
    ? new Date(phone.price.updatedAt).toISOString().slice(0, 10)
    : "unknown";
  const estimated = phone.source === "ai" ? " (estimated)" : "";
  return `${phone.brand} ${phone.model}: guide price $${phone.price.current}${estimated}, checked ${checked}. ${phone.category}, released ${phone.releaseYear || "unknown"}. ${parts.join(", ")}.`;
}

export async function answerChat(messages, phones) {
  const data = phones.length
    ? phones.map(phoneLine).join("\n")
    : "No phones matched this conversation.";
  return askModel(
    [
      { role: "system", content: `${CHAT_RULES}\n\nPhone data:\n${data}` },
      ...messages,
    ],
    {
      temperature: 0.4,
    },
  );
}

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

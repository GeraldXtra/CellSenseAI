import { Phone } from "../models/Phone.js";
import { User } from "../models/User.js";
import { SearchLog } from "../models/SearchLog.js";
import { ok, httpError } from "../utils/http.js";
import { Slugify } from "../utils/slug.js";
import {
  buildPhoneFilter,
  buildSort,
  escapeRegex,
} from "../services/phoneQuery.js";
import {
  isAIConfigured,
  parseSearchQuery,
  lookUpPhone,
  answerChat,
  rankShortlist,
} from "../services/ai.service.js";
import {
  readNeeds,
  buildShortlist,
  describeNeeds,
  ruleReason,
} from "../services/recommend.service.js";

// Smart search

const SENTENCE_WORDS =
  /\b(under|below|over|above|less|more|than|with|without|best|good|great|cheap|cheapest|budget|around|between|for|long|big|fast|gaming|camera|battery|selfie|selfies)\b/i;

function looksLikeSentence(query) {
  return (
    query.split(/\s+/).length >= 4 ||
    SENTENCE_WORDS.test(query) ||
    /\$|\d{3,}/.test(query)
  );
}

function findPhones(filters) {
  return Phone.find(buildPhoneFilter(filters))
    .sort(buildSort(filters.sort))
    .limit(24)
    .lean();
}

async function addMissingPhone(filters) {
  const name = [filters.brand, filters.q].filter(Boolean).join(" ");
  const found = await lookUpPhone(name);
  if (!found) return null;

  const slug = Slugify(`${found.brand} ${found.model}`);
  const existing = await Phone.findOne({ slug }).lean();
  if (existing) return existing;

  const now = new Date();
  try {
    const phone = await Phone.create({
      slug,
      brand: found.brand,
      model: found.model,
      category: found.category,
      releaseYear: found.releaseYear,
      specs: found.specs,
      price: { current: found.price, currency: "USD", updatedAt: now },
      priceHistory: [{ price: found.price, date: now, source: "ai" }],
      aiSummary: found.summary,
      source: "ai",
    });
    return phone.toObject();
  } catch (err) {
    if (err.code === 11000) return Phone.findOne({ slug }).lean();
    throw err;
  }
}

export async function search(req, res) {
  const query = String(req.body?.query || "")
    .trim()
    .slice(0, 200);
  if (!query) throw httpError(400, "Type what you are looking for");

  const aiReady = isAIConfigured();
  let filters = { q: query };
  let source = "direct";
  let items =
    aiReady && looksLikeSentence(query) ? [] : await findPhones(filters);

  if (!items.length && aiReady) {
    filters = await parseSearchQuery(query);
    source = "ai";
    items = Object.keys(filters).length ? await findPhones(filters) : [];

    if (!items.length && filters.q) {
      const added = await addMissingPhone(filters);
      if (added) items = [added];
    }
  }

  await SearchLog.create({
    query,
    filters,
    source,
    resultCount: items.length,
    user: req.user?._id,
  });

  if (req.user) {
    await User.updateOne(
      { _id: req.user._id },
      {
        $push: {
          searchHistory: {
            $each: [{ query, filters, at: new Date() }],
            $position: 0,
            $slice: 50,
          },
        },
      },
    );
  }

  return ok(res, { items, filters, source });
}

// Assistant chat

const CHAT_LIMIT = 12;

const FOCUS = [
  {
    words: /\b(camera|cameras|photo|photos|picture|pictures|selfie|selfies)\b/i,
    sort: (a, b) => (b.specs?.mainCamera ?? 0) - (a.specs?.mainCamera ?? 0),
  },
  {
    words: /\b(battery|batteries|charge|charging|lasts)\b/i,
    sort: (a, b) => (b.specs?.battery ?? 0) - (a.specs?.battery ?? 0),
  },
  {
    words: /\b(cheap|cheapest|budget|affordable|price|cost)\b/i,
    sort: (a, b) => a.price.current - b.price.current,
  },
];

function namesOf(phone) {
  const full = `${phone.brand} ${phone.model}`.toLowerCase();
  const model = phone.model.toLowerCase();
  const names = [full];
  if (model.length >= 3 && /[a-z]/.test(model) && /\d/.test(model))
    names.push(model);
  return names;
}

function findMentioned(text, phones) {
  let rest = text.toLowerCase();
  const names = phones
    .flatMap((phone) => namesOf(phone).map((name) => ({ name, phone })))
    .sort((a, b) => b.name.length - a.name.length);
  const found = new Map();
  for (const { name, phone } of names) {
    const pattern = new RegExp(
      `(^|[^a-z0-9])(${escapeRegex(name)})(?![a-z0-9])`,
      "g",
    );
    rest = rest.replace(pattern, (match, before, word, offset) => {
      const at = offset + before.length;
      const seen = found.get(phone.slug);
      if (!seen || at < seen.at) found.set(phone.slug, { phone, at });
      return before + " ".repeat(word.length);
    });
  }
  return [...found.values()]
    .sort((a, b) => a.at - b.at)
    .map((entry) => entry.phone);
}

function readBudget(text) {
  const match = text.match(
    /\$\s?(\d{2,5})|\b(?:under|below|less than|up to|max|maximum|around|about|budget of|budget is)\s*\$?\s?(\d{2,5})\b/i,
  );
  return match ? Number(match[1] || match[2]) : null;
}

function cleanMessages(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim(),
    )
    .slice(-CHAT_LIMIT)
    .map((m) => ({ role: m.role, content: m.content.trim().slice(0, 1000) }));
}

function relatedPhones(messages, all) {
  const recent = messages
    .slice(-4)
    .map((m) => m.content)
    .join(" ");
  const last = messages[messages.length - 1].content;

  const named = findMentioned(recent, all);
  const budget = readBudget(last);
  const focus = FOCUS.find((f) => f.words.test(last));

  const pool = budget
    ? all.filter((phone) => phone.price.current <= budget)
    : [...all];
  pool.sort(
    focus ? focus.sort : (a, b) => (b.releaseYear ?? 0) - (a.releaseYear ?? 0),
  );

  const picked = [...named];
  for (const phone of pool) {
    if (picked.length >= 10) break;
    if (!picked.includes(phone)) picked.push(phone);
  }
  return picked;
}

export async function chat(req, res) {
  const messages = cleanMessages(req.body?.messages);
  if (!messages.length || messages[messages.length - 1].role !== "user") {
    throw httpError(400, "Send a question to the assistant");
  }

  const all = await Phone.find()
    .select("slug brand model category releaseYear specs price source imageUrl")
    .lean();
  const candidates = relatedPhones(messages, all);
  const reply =
    (await answerChat(messages, candidates)) ||
    "I could not answer that. Try asking another way.";

  const offered = new Set(candidates.map((phone) => phone.slug));
  const phones = findMentioned(reply, all)
    .filter((phone) => offered.has(phone.slug))
    .slice(0, 3);

  return ok(res, { reply, phones });
}

// Recommendations

export async function recommend(req, res) {
  const needs = readNeeds(req.body);
  const { shortlist, widened, budget } = await buildShortlist(needs);

  let items = shortlist
    .slice(0, 3)
    .map((phone) => ({ phone, reason: ruleReason(phone, needs) }));

  if (shortlist.length && isAIConfigured()) {
    try {
      const picks = await rankShortlist(
        shortlist,
        describeNeeds(needs, widened, budget),
      );
      const chosen = [];
      for (const pick of picks) {
        const phone = shortlist.find((p) => p.slug === pick.slug);
        if (phone && !chosen.some((c) => c.phone.slug === phone.slug))
          chosen.push({ phone, reason: pick.reason });
        if (chosen.length === 3) break;
      }
      for (const item of items) {
        if (chosen.length === 3) break;
        if (!chosen.some((c) => c.phone.slug === item.phone.slug))
          chosen.push(item);
      }
      if (chosen.length) items = chosen;
    } catch (err) {
      console.error(`Ranking fell back to our own order: ${err.message}`);
    }
  }

  if (req.user && items.length) {
    const at = new Date();
    await User.updateOne(
      { _id: req.user._id },
      {
        $set: {
          recommendations: items.map((item) => ({
            phone: item.phone._id,
            reason: item.reason,
            at,
          })),
        },
      },
    );
  }

  return ok(res, { items, widened });
}

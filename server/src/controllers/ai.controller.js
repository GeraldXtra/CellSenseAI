import { Phone } from "../models/Phone.js";
import { User } from "../models/User.js";
import { SearchLog } from "../models/SearchLog.js";
import { ok, httpError } from "../utils/http.js";
import { buildPhoneFilter, buildSort } from "../services/phoneQuery.js";
import { isAIConfigured, parseSearchQuery } from "../services/ai.service.js";

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

// priceService: computes the price trend and the best time to buy note from priceHistory, and records checked prices. Owner: Gerald.
import { Phone } from "../models/Phone.js";

const WINDOW_DAYS = 90;
const THRESHOLD = 0.02;

const SUGGESTIONS = {
  falling: "Price has been falling. Waiting a little could save you money.",
  rising: "Price has been rising. Buying soon may cost less than waiting.",
  stable: "Price has been steady. Now is as good a time to buy as any.",
  unknown: "Not enough price checks yet to see which way the price is moving.",
};

export function priceTrend(priceHistory = []) {
  const history = [...priceHistory].sort(
    (a, b) => new Date(a.date) - new Date(b.date),
  );

  if (history.length < 2) {
    return { history, trend: "stable", suggestion: SUGGESTIONS.unknown };
  }

  const latest = history[history.length - 1];
  const windowStart =
    new Date(latest.date).getTime() - WINDOW_DAYS * 24 * 60 * 60 * 1000;
  let base = history.find(
    (point) => new Date(point.date).getTime() >= windowStart,
  );
  if (base === latest) base = history[history.length - 2];

  const change = (latest.price - base.price) / base.price;
  let trend = "stable";
  if (change <= -THRESHOLD) trend = "falling";
  if (change >= THRESHOLD) trend = "rising";

  return { history, trend, suggestion: SUGGESTIONS[trend] };
}

export async function recordPrices(checkedOn, prices = {}) {
  const slugs = Object.keys(prices);
  const phones = await Phone.find({ slug: { $in: slugs } })
    .select("slug price")
    .lean();

  let changed = 0;
  let unchanged = 0;
  let skipped = 0;

  for (const phone of phones) {
    const price = Number(prices[phone.slug]);
    if (!Number.isFinite(price) || price <= 0) {
      skipped += 1;
      continue;
    }

    const result = await Phone.updateOne(
      {
        _id: phone._id,
        $or: [
          { "price.updatedAt": { $lt: checkedOn } },
          { "price.updatedAt": null },
        ],
      },
      {
        $set: { "price.current": price, "price.updatedAt": checkedOn },
        $push: { priceHistory: { price, date: checkedOn, source: "manual" } },
      },
    );

    if (!result.modifiedCount) skipped += 1;
    else if (price !== phone.price.current) changed += 1;
    else unchanged += 1;
  }

  const missing = slugs.filter(
    (slug) => !phones.some((phone) => phone.slug === slug),
  );
  return { changed, unchanged, skipped, missing };
}

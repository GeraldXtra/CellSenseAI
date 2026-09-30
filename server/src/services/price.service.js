// priceService: computes the price trend and the best time to buy note from priceHistory. Owner: Gerald.
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

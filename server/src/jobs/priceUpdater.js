// priceUpdater: the nightly node-cron job that refreshes phone prices and appends to priceHistory. Owner: Gerald.
import fs from "node:fs/promises";
import cron from "node-cron";
import { Phone } from "../models/Phone.js";
import { env } from "../config/env.js";

const PRICE_FILE = new URL("../../data/prices.json", import.meta.url);

async function readPriceList() {
  const list = JSON.parse(await fs.readFile(PRICE_FILE, "utf8"));
  const checkedOn = new Date(list.checkedOn);
  if (Number.isNaN(checkedOn.getTime())) {
    throw new Error("prices.json needs a checkedOn date such as 2026-10-01");
  }
  return { checkedOn, prices: list.prices || {} };
}

export async function runPriceUpdate() {
  const { checkedOn, prices } = await readPriceList();
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
  if (missing.length)
    console.warn(`Not in the database, skipped: ${missing.join(", ")}`);

  const day = checkedOn.toISOString().slice(0, 10);
  console.log(
    `Price check for ${day}: ${changed} changed, ${unchanged} unchanged, ${skipped} skipped`,
  );
  return { changed, unchanged, skipped, missing };
}

export function startPriceUpdater() {
  if (!cron.validate(env.PRICE_UPDATER_CRON)) {
    console.warn(
      `PRICE_UPDATER_CRON "${env.PRICE_UPDATER_CRON}" is not a valid schedule, so the nightly price check is off.`,
    );
    return;
  }

  cron.schedule(
    env.PRICE_UPDATER_CRON,
    () => {
      runPriceUpdate().catch((err) =>
        console.error(`Price check failed: ${err.message}`),
      );
    },
    { timezone: "Africa/Lagos" },
  );
  console.log(`Nightly price check scheduled: ${env.PRICE_UPDATER_CRON}`);
}

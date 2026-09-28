// env: reads every setting from the environment once and exports a frozen object. Owner: Gerald.
import "dotenv/config";

export const env = Object.freeze({
  PORT: +process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  MONGODB_URI: process.env.MONGODB_URI || "",
  JWT_SECRET: process.env.JWT_SECRET || "",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  AI_BASE_URL: process.env.AI_BASE_URL || "",
  AI_API_KEY: process.env.AI_API_KEY || "",
  AI_MODEL: process.env.AI_MODEL || "",
  PRICE_UPDATER_CRON: process.env.PRICE_UPDATER_CRON || "0 2 * * *",
  MAIL_HOST: process.env.MAIL_HOST || "",
  MAIL_PORT: +process.env.MAIL_PORT || 587,
  MAIL_USER: process.env.MAIL_USER || "",
  MAIL_PASS: process.env.MAIL_PASS || "",
  MAIL_FROM: process.env.MAIL_FROM || "",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
});

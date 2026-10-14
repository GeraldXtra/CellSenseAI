import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { env } from "../config/env.js";

const ROUNDS = 10;

export function hashPassword(plain) {
  return bcrypt.hash(plain, ROUNDS);
}

export function checkPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

export function newPasswordProblem(password) {
  if (password.length < 8) return "Password must be at least 8 characters";
  if (Buffer.byteLength(password) > 72)
    return "Keep your password under 72 characters";
  return null;
}

export function hashResetToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function makeResetToken() {
  const token = crypto.randomBytes(32).toString("hex");
  return { token, tokenHash: hashResetToken(token) };
}

export function makeEmailCode() {
  return String(crypto.randomInt(0, 1000000)).padStart(6, "0");
}

export function hashEmailCode(email, code) {
  return crypto
    .createHmac("sha256", env.JWT_SECRET)
    .update(`${email}:${code}`)
    .digest("hex");
}

export function codesMatch(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

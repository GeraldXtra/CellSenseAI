// password: hashes and checks passwords with bcrypt. Owner: Gerald.
import crypto from "node:crypto";
import bcrypt from "bcryptjs";

const ROUNDS = 10;

export function hashPassword(plain) {
  return bcrypt.hash(plain, ROUNDS);
}

export function checkPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

export function hashResetToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function makeResetToken() {
  const token = crypto.randomBytes(32).toString("hex");
  return { token, tokenHash: hashResetToken(token) };
}

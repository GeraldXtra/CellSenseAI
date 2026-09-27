// jwt: signs and verifies the login tokens. Owner: Gerald.
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

function secret() {
  if (!env.JWT_SECRET) {
    throw new Error("JWT_SECRET is empty in server/.env and config/.env.js");
  }
  return env.JWT_SECRET;
}

export function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, secret(), {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

export function verifyToken(token) {
  return jwt.verify(token, secret());
}

// authController: the request handlers for the auth routes (register, login, me, forgot password, reset password). Owner: Gerald.

import { User } from "../models/User.js";
import { hashPassword, checkPassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";
import { ok, httpError } from "../utils/http.js";

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

export async function register(req, res) {
  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim();
  const password = String(req.body?.password || "");

  if (!name || !email || !password)
    throw httpError(400, "Name, email and password are required.");
  if (!EMAIL_PATTERN.test(email))
    throw httpError(400, "Enter a valid email address.");
  if (password.length < 8)
    throw httpError(400, "Password must be at least 8 characters.");

  const taken = await User.exists({ email });
  if (taken) throw httpError(409, "An account with that email already exists.");

  const user = await User.create({
    name,
    email,
    passwordHash: await hashPassword(password),
  });
  return ok(res, { token: signToken(user), user: user.toSafeJSON() }, 201);
}

export async function login(req, res) {
  const email = String(req.body?.email || "")
    .trim()
    .toLowerCase();
  const password = String(req.body?.password || "");

  if (!email || !password)
    throw httpError(400, "Email and password are required");

  const user = await User.findOne({ email }).select("+passwordHash");
  const valid = user && (await checkPassword(password, user.passwordHash));
  if (!valid) throw httpError(401, "Wrong email or password");

  return ok(res, { token: signToken(user), user: user.toSafeJSON() });
}
export function me(req, res) {
  return ok(res, { user: req.user.toSafeJSON() });
}

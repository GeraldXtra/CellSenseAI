// authController: the request handlers for the auth routes (register, login, me, forgot password, reset password). Owner: Gerald.

import { User } from "../models/User.js";
import { env } from "../config/env.js";
import {
  hashPassword,
  checkPassword,
  makeResetToken,
  hashResetToken,
} from "../utils/password.js";
import { signToken } from "../utils/jwt.js";
import { ok, httpError } from "../utils/http.js";
import { sendPasswordResetEmail } from "../services/mail.service.js";

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const RESET_MINUTES = 60;

export async function register(req, res) {
  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "")
    .trim()
    .toLowerCase();
  const password = String(req.body?.password || "");

  if (!name || !email || !password)
    throw httpError(400, "Name, email and password are required");
  if (!EMAIL_PATTERN.test(email))
    throw httpError(400, "Enter a valid email address");
  if (password.length < 8)
    throw httpError(400, "Password must be at least 8 characters");

  const taken = await User.exists({ email });
  if (taken) throw httpError(409, "An account with that email already exists");

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

export async function forgotPassword(req, res) {
  const email = String(req.body?.email || "")
    .trim()
    .toLowerCase();
  if (!EMAIL_PATTERN.test(email))
    throw httpError(400, "Enter a valid email address");

  const user = await User.findOne({ email });
  if (user) {
    const { token, tokenHash } = makeResetToken();
    const expiresAt = new Date(Date.now() + RESET_MINUTES * 60 * 1000);
    await User.updateOne(
      { _id: user._id },
      { $set: { passwordReset: { tokenHash, expiresAt } } },
    );

    const link = `${env.CLIENT_URL.replace(/\/+$/, "")}/reset-password/${token}`;
    sendPasswordResetEmail({ to: user.email, name: user.name, link }).catch(
      (err) => {
        console.error(`Could not send the reset email: ${err.message}`);
      },
    );
  }

  return ok(res, { sent: true });
}

export async function resetPassword(req, res) {
  const token = String(req.body?.token || "").trim();
  const password = String(req.body?.password || "");

  if (!token)
    throw httpError(
      400,
      "This reset link is not complete. Open the link from the email again.",
    );
  if (password.length < 8)
    throw httpError(400, "Password must be at least 8 characters");

  const user = await User.findOne({
    "passwordReset.tokenHash": hashResetToken(token),
    "passwordReset.expiresAt": { $gt: new Date() },
  });
  if (!user)
    throw httpError(
      400,
      "This reset link is invalid or has expired. Ask for a new one.",
    );

  await User.updateOne(
    { _id: user._id },
    {
      $set: { passwordHash: await hashPassword(password) },
      $unset: { passwordReset: 1 },
    },
  );
  return ok(res, { ok: true });
}

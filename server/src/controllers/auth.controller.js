import { User } from "../models/User.js";
import { PendingSignup } from "../models/PendingSignup.js";
import { env } from "../config/env.js";
import {
  hashPassword,
  checkPassword,
  makeResetToken,
  hashResetToken,
  newPasswordProblem,
  makeEmailCode,
  hashEmailCode,
  codesMatch,
} from "../utils/password.js";
import { nameProblem } from "../utils/name.js";
import { signToken } from "../utils/jwt.js";
import { ok, httpError } from "../utils/http.js";
import {
  sendPasswordResetEmail,
  sendVerificationCode,
} from "../services/mail.service.js";
import { verifyTurnstile } from "../services/turnstile.service.js";

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const RESET_MINUTES = 60;
const CODE_MINUTES = 10;
const PENDING_MINUTES = 60;
const MAX_TRIES = 5;
const RESEND_SECONDS = 60;

function readEmail(body) {
  return String(body?.email || "")
    .trim()
    .toLowerCase();
}

function minutesFrom(now, minutes) {
  return new Date(now + minutes * 60 * 1000);
}

function checkResendWait(lastSentAt) {
  const left =
    RESEND_SECONDS * 1000 - (Date.now() - new Date(lastSentAt).getTime());
  if (left > 0) {
    const seconds = Math.max(1, Math.ceil(left / 1000));
    throw httpError(
      429,
      `Wait ${seconds} seconds before asking for another code.`,
    );
  }
}

async function sendCodeOrDrop({ email, name, code }) {
  try {
    await sendVerificationCode({ to: email, name, code });
  } catch (err) {
    await PendingSignup.deleteOne({ email });
    if (err.status === 503) throw err;
    throw httpError(502, "We could not send the code. Try again in a moment.");
  }
}

export async function register(req, res) {
  const name = String(req.body?.name || "").trim();
  const email = readEmail(req.body);
  const password = String(req.body?.password || "");

  if (!name || !email || !password)
    throw httpError(400, "Name, email and password are required");
  const badName = nameProblem(name);
  if (badName) throw httpError(400, badName);
  if (!EMAIL_PATTERN.test(email))
    throw httpError(400, "Enter a valid email address");
  const badPassword = newPasswordProblem(password);
  if (badPassword) throw httpError(400, badPassword);

  await verifyTurnstile(req.body?.turnstileToken, req.ip);

  const taken = await User.exists({ email });
  if (taken) throw httpError(409, "An account with that email already exists");

  const pending = await PendingSignup.findOne({ email })
    .select("lastSentAt")
    .lean();
  if (pending) checkResendWait(pending.lastSentAt);

  const passwordHash = await hashPassword(password);
  const code = makeEmailCode();
  const now = Date.now();
  await PendingSignup.findOneAndUpdate(
    { email },
    {
      $set: {
        name,
        passwordHash,
        codeHash: hashEmailCode(email, code),
        attempts: 0,
        codeExpiresAt: minutesFrom(now, CODE_MINUTES),
        lastSentAt: new Date(now),
        expiresAt: minutesFrom(now, PENDING_MINUTES),
      },
    },
    { upsert: true, setDefaultsOnInsert: true },
  );

  await sendCodeOrDrop({ email, name, code });
  return ok(res, {
    email,
    expiresInMinutes: CODE_MINUTES,
    resendAfterSeconds: RESEND_SECONDS,
  });
}

export async function verifyEmail(req, res) {
  const email = readEmail(req.body);
  const code = String(req.body?.code ?? "").trim();

  if (!/^\d{6}$/.test(code))
    throw httpError(400, "Enter the 6 digit code from the email");

  const pending = await PendingSignup.findOneAndUpdate(
    { email, attempts: { $lt: MAX_TRIES } },
    { $inc: { attempts: 1 } },
    { new: true },
  );
  if (!pending) {
    const stillThere = await PendingSignup.exists({ email });
    if (stillThere)
      throw httpError(429, "Too many wrong codes. Ask for a new code.");
    throw httpError(
      400,
      "This sign up has expired. Create your account again.",
    );
  }

  if (pending.codeExpiresAt.getTime() <= Date.now())
    throw httpError(400, "This code has expired. Ask for a new one.");

  if (!codesMatch(hashEmailCode(email, code), pending.codeHash)) {
    const left = MAX_TRIES - pending.attempts;
    if (left > 0)
      throw httpError(
        400,
        `That code is not right. You have ${left} ${left === 1 ? "try" : "tries"} left.`,
      );
    throw httpError(429, "Too many wrong codes. Ask for a new code.");
  }

  const taken = await User.exists({ email });
  if (taken) {
    await PendingSignup.deleteOne({ _id: pending._id });
    throw httpError(409, "An account with that email already exists");
  }

  let user;
  try {
    user = await User.create({
      name: pending.name,
      email,
      passwordHash: pending.passwordHash,
      emailVerifiedAt: new Date(),
    });
  } catch (err) {
    if (err.code !== 11000) throw err;
    await PendingSignup.deleteOne({ _id: pending._id });
    throw httpError(409, "An account with that email already exists");
  }

  await PendingSignup.deleteOne({ _id: pending._id });
  return ok(res, { token: signToken(user), user: user.toSafeJSON() }, 201);
}

export async function resendCode(req, res) {
  const email = readEmail(req.body);
  if (!EMAIL_PATTERN.test(email))
    throw httpError(400, "Enter a valid email address");

  const pending = await PendingSignup.findOne({ email });
  if (!pending)
    throw httpError(
      400,
      "This sign up has expired. Create your account again.",
    );
  checkResendWait(pending.lastSentAt);

  const code = makeEmailCode();
  const now = Date.now();
  await PendingSignup.updateOne(
    { _id: pending._id },
    {
      $set: {
        codeHash: hashEmailCode(email, code),
        attempts: 0,
        codeExpiresAt: minutesFrom(now, CODE_MINUTES),
        lastSentAt: new Date(now),
        expiresAt: minutesFrom(now, PENDING_MINUTES),
      },
    },
  );

  await sendCodeOrDrop({ email, name: pending.name, code });
  return ok(res, {
    sent: true,
    expiresInMinutes: CODE_MINUTES,
    resendAfterSeconds: RESEND_SECONDS,
  });
}

export async function login(req, res) {
  const email = String(req.body?.email || "")
    .trim()
    .toLowerCase();
  const password = String(req.body?.password || "");

  if (!email || !password)
    throw httpError(400, "Email and password are required");

  await verifyTurnstile(req.body?.turnstileToken, req.ip);

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
  const problem = newPasswordProblem(password);
  if (problem) throw httpError(400, problem);

  const user = await User.findOne({
    "passwordReset.tokenHash": hashResetToken(token),
    "passwordReset.expiresAt": { $gt: new Date() },
  });
  if (!user)
    throw httpError(
      400,
      "This reset link is invalid or has expired. Ask for a new one.",
    );

  const now = new Date();
  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        passwordHash: await hashPassword(password),
        passwordChangedAt: now,
        ...(user.emailVerifiedAt ? {} : { emailVerifiedAt: now }),
      },
      $inc: { tokenVersion: 1 },
      $unset: { passwordReset: 1 },
    },
  );
  return ok(res, { ok: true });
}

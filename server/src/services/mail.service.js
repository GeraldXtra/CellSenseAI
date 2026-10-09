import { Resend } from "resend";
import { env } from "../config/env.js";
import { httpError } from "../utils/http.js";

const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const HTML_ESCAPES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

let client = null;

export function isMailConfigured() {
  return Boolean(env.RESEND_API_KEY && env.MAIL_FROM);
}

function getClient() {
  if (!client) client = new Resend(env.RESEND_API_KEY);
  return client;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

function codeHtml(code) {
  return `<span style="font-size:28px;font-weight:700;letter-spacing:6px">${escapeHtml(code)}</span>`;
}

function linkHtml(link) {
  return `<a href="${escapeHtml(link)}" style="color:#1d1d1f">${escapeHtml(link)}</a>`;
}

function layout(paragraphs) {
  const body = paragraphs
    .map((paragraph) => `<p style="margin:0 0 16px">${paragraph}</p>`)
    .join("");
  return `<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:24px;background-color:#ffffff;color:#1d1d1f;font-family:${FONT_STACK};font-size:16px;line-height:1.5">${body}</body></html>`;
}

async function sendEmail({ to, subject, text, html }) {
  let result;
  try {
    result = await getClient().emails.send({
      from: env.MAIL_FROM,
      to: [to],
      subject,
      text,
      html,
    });
  } catch (err) {
    const message = `Resend could not send to ${to}: ${err.name}: ${err.message}`;
    console.error(message);
    throw new Error(message);
  }

  if (result?.error) {
    const message = `Resend could not send to ${to}: ${result.error.name}: ${result.error.message}`;
    console.error(message);
    throw new Error(message);
  }
  return result?.data;
}

export async function sendPasswordResetEmail({ to, name, link }) {
  if (!isMailConfigured()) {
    if (env.NODE_ENV === "production") {
      console.error("Mail is not set up, so the reset email was not sent.");
    } else {
      console.log(`Mail is not set up. Reset link for ${to}: ${link}`);
    }
    return;
  }

  return sendEmail({
    to,
    subject: "Reset your CellSense AI password",
    text: [
      `Hello ${name},`,
      "",
      "Someone asked to reset the password for your CellSense AI account.",
      `Open this link within one hour to choose a new password: ${link}`,
      "",
      "If it was not you, ignore this email. Your password stays the same.",
    ].join("\n"),
    html: layout([
      `Hello ${escapeHtml(name)},`,
      "Someone asked to reset the password for your CellSense AI account.",
      `Open this link within one hour to choose a new password: ${linkHtml(link)}`,
      "If it was not you, ignore this email. Your password stays the same.",
    ]),
  });
}

export async function sendVerificationCode({ to, name, code }) {
  if (!isMailConfigured()) {
    if (env.NODE_ENV === "production")
      throw httpError(
        503,
        "Email is not set up yet, so we cannot send the code.",
      );
    console.log(`Mail is not set up. Verification code for ${to}: ${code}`);
    return;
  }

  return sendEmail({
    to,
    subject: "Your CellSense AI verification code",
    text: [
      `Hello ${name},`,
      "",
      `Your code is ${code}.`,
      "It works for 10 minutes.",
      "",
      "If you did not try to create a CellSense AI account, ignore this email.",
    ].join("\n"),
    html: layout([
      `Hello ${escapeHtml(name)},`,
      `Your code is ${codeHtml(code)}.`,
      "It works for 10 minutes.",
      "If you did not try to create a CellSense AI account, ignore this email.",
    ]),
  });
}

export async function sendPasswordChangedEmail({ to, name }) {
  if (!isMailConfigured()) return;

  return sendEmail({
    to,
    subject: "Your CellSense AI password was changed",
    text: [
      `Hello ${name},`,
      "",
      "The password for your CellSense AI account was just changed.",
      "",
      "If this was not you, reset your password now.",
    ].join("\n"),
    html: layout([
      `Hello ${escapeHtml(name)},`,
      "The password for your CellSense AI account was just changed.",
      "If this was not you, reset your password now.",
    ]),
  });
}

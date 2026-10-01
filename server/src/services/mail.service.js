// mailService: sends the password reset email with Nodemailer. Owner: Gerald.
import nodemailer from "nodemailer";
import { env } from "../config/env.js";

let transporter = null;

function isMailConfigured() {
  return Boolean(env.MAIL_HOST && env.MAIL_USER && env.MAIL_PASS);
}

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.MAIL_HOST,
      port: env.MAIL_PORT,
      secure: env.MAIL_PORT === 465,
      auth: { user: env.MAIL_USER, pass: env.MAIL_PASS },
    });
  }
  return transporter;
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

  await getTransporter().sendMail({
    from: env.MAIL_FROM || env.MAIL_USER,
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
  });
}

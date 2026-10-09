import { env } from "../config/env.js";
import { httpError } from "../utils/http.js";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const MAX_TOKEN_LENGTH = 2048;
const TIMEOUT_MS = 10000;

export function isTurnstileConfigured() {
  return Boolean(env.TURNSTILE_SECRET_KEY);
}

export async function verifyTurnstile(token, ip) {
  const response = typeof token === "string" ? token : "";
  if (!response || response.length > MAX_TOKEN_LENGTH)
    throw httpError(400, "Complete the security check");
  if (!isTurnstileConfigured())
    throw httpError(503, "The security check is not set up yet");

  const form = new FormData();
  form.append("secret", env.TURNSTILE_SECRET_KEY);
  form.append("response", response);
  if (ip) form.append("remoteip", ip);

  let result;
  try {
    const reply = await fetch(VERIFY_URL, {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    result = await reply.json();
  } catch (err) {
    console.error(`Could not reach the security check: ${err.message}`);
    throw httpError(
      502,
      "Could not reach the security check. Try again in a moment.",
    );
  }

  if (result?.success !== true) {
    const codes = Array.isArray(result?.["error-codes"])
      ? result["error-codes"].join(", ")
      : "none";
    console.error(`The security check failed: ${codes}`);
    throw httpError(400, "The security check failed. Tick it again.");
  }
}

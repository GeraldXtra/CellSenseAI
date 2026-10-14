import api from "./api.js";

export function register({ name, email, password, turnstileToken }) {
  return api.post("/auth/register", { name, email, password, turnstileToken });
}

export function verifyEmail({ email, code }) {
  return api.post("/auth/verify-email", { email, code });
}

export function resendCode(email) {
  return api.post("/auth/resend-code", { email });
}

export function login({ email, password, turnstileToken }) {
  return api.post("/auth/login", { email, password, turnstileToken });
}

export function me() {
  return api.get("/auth/me");
}

export function forgotPassword(email) {
  return api.post("/auth/forgot-password", { email });
}

export function resetPassword(token, password) {
  return api.post("/auth/reset-password", { token, password });
}

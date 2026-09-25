// authService: register, login, me, forgotPassword and resetPassword. Owner: Gerald.
import { api } from "./api.js";

export function register(body) {
  return api.post("/auth/register", body);
}

export function login(body) {
  return api.post("/auth/login", body);
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

import axios from "axios";

const TOKEN_KEY = "cs_token";
const OFFLINE_MESSAGE = "Could not reach the server. Check that it is running.";
const GATEWAY_STATUSES = [502, 503, 504];

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    return;
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    return;
  }
}

function fail(message, status) {
  const error = new Error(message);
  error.status = status;
  return Promise.reject(error);
}

function envelopeMessage(body) {
  if (body && typeof body === "object" && body.ok === false) {
    return body.error?.message || "Request failed";
  }
  return null;
}

const API_BASE = (import.meta.env.VITE_API_URL || "/api").replace(/\/+$/, "");
const PUBLIC_BASE = import.meta.env.BASE_URL;

export function assetUrl(path) {
  if (typeof path !== "string" || !path.startsWith("/") || path.startsWith("//")) {
    return path;
  }
  if (path === "/api" || path.startsWith("/api/")) {
    return `${API_BASE}${path.slice(4)}`;
  }
  return `${PUBLIC_BASE}${path.slice(1)}`;
}

export const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    const body = response.data;
    const message = envelopeMessage(body);
    if (message) {
      return fail(message, response.status);
    }
    return body && body.data !== undefined ? body.data : body;
  },
  (error) => {
    const response = error.response;
    if (!response) {
      return fail(OFFLINE_MESSAGE);
    }
    const message = envelopeMessage(response.data);
    if (!message && GATEWAY_STATUSES.includes(response.status)) {
      return fail(OFFLINE_MESSAGE, response.status);
    }
    return fail(message || `Request failed with status ${response.status}`, response.status);
  },
);

export default api;

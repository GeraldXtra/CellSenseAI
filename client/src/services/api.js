// api: the axios instance with the token storage, the auth header and the envelope unwrapping. Owner: Gerald.
import axios from "axios";

const TOKEN_KEY = "cs_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body && body.ok === false) {
      throw new Error(body.error?.message || "Request failed");
    }
    return body && body.data !== undefined ? body.data : body;
  },
  (error) => {
    const message =
      error.response?.data?.error?.message || "Could not reach the server";
    return Promise.reject(new Error(message));
  },
);

export const api = {
  get: (path, params) => client.get(path, { params }),
  post: (path, body) => client.post(path, body),
  del: (path) => client.delete(path),
};

import api from "./api.js";

export function getDashboard() {
  return api.get("/users/me/dashboard");
}

export function addFavourite(slug) {
  return api.post(`/users/me/favourites/${encodeURIComponent(slug)}`);
}

export function removeFavourite(slug) {
  return api.delete(`/users/me/favourites/${encodeURIComponent(slug)}`);
}

export function getProfile() {
  return api.get("/users/me/profile");
}

export function updateProfile({ name }) {
  return api.patch("/users/me/profile", { name });
}

export function changePassword({ currentPassword, newPassword }) {
  return api.patch("/users/me/password", { currentPassword, newPassword });
}

export function signOutOthers() {
  return api.post("/users/me/sign-out-others");
}

export function clearSearchHistory() {
  return api.delete("/users/me/search-history");
}

export function clearRecentlyViewed() {
  return api.delete("/users/me/recently-viewed");
}

export function deleteAccount(password) {
  return api.delete("/users/me", { data: { password } });
}

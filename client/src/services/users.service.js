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

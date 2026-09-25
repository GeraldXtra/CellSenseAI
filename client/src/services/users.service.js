// usersService: getDashboard, addFavourite and removeFavourite. Owner: Gerald.
import { api } from "./api.js";

export function getDashboard() {
  return api.get("/users/me/dashboard");
}

export function addFavourite(slug) {
  return api.post(`/users/me/favourites/${slug}`);
}

export function removeFavourite(slug) {
  return api.del(`/users/me/favourites/${slug}`);
}

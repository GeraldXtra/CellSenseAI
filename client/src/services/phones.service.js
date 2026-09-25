// phonesService: listPhones, getPhone, comparePhones, getPriceTrend, getReviews, addReview and getReviewSummary. Owner: Gerald.
import { api } from "./api.js";

export function listPhones(params) {
  return api.get("/phones", params);
}

export function getPhone(slug) {
  return api.get(`/phones/${slug}`);
}

export function comparePhones(slugs) {
  return api.get("/phones/compare", { ids: slugs.join(",") });
}

export function getPriceTrend(slug) {
  return api.get(`/phones/${slug}/price-trend`);
}

export function getReviews(slug) {
  return api.get(`/phones/${slug}/reviews`);
}

export function addReview(slug, body) {
  return api.post(`/phones/${slug}/reviews`, body);
}

export function getReviewSummary(slug) {
  return api.get(`/phones/${slug}/review-summary`);
}

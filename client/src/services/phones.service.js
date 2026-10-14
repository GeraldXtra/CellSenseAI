import api from "./api.js";

function cleanParams(values = {}) {
  const params = {};
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== null && value !== "" && value !== false) {
      params[key] = value;
    }
  }
  return params;
}

export function listPhones(params) {
  return api.get("/phones", { params: cleanParams(params) });
}

export function getPhone(slug) {
  return api.get(`/phones/${encodeURIComponent(slug)}`);
}

export function comparePhones(slugs) {
  return api.get("/phones/compare", { params: { ids: slugs.join(",") } });
}

export function getPriceTrend(slug) {
  return api.get(`/phones/${encodeURIComponent(slug)}/price-trend`);
}

export function getReviews(slug) {
  return api.get(`/phones/${encodeURIComponent(slug)}/reviews`);
}

export function addReview(slug, body) {
  return api.post(`/phones/${encodeURIComponent(slug)}/reviews`, body);
}

export function getReviewSummary(slug) {
  return api.get(`/phones/${encodeURIComponent(slug)}/review-summary`);
}

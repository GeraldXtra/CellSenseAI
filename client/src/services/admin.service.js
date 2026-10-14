import api from "./api.js";

function cleanParams(values = {}) {
  const params = {};
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== null && value !== "") {
      params[key] = value;
    }
  }
  return params;
}

export function getAdminPhones(params) {
  return api.get("/admin/phones", { params: cleanParams(params) });
}

export function getAdminPhone(slug) {
  return api.get(`/admin/phones/${encodeURIComponent(slug)}`);
}

export function createPhone(body) {
  return api.post("/admin/phones", body);
}

export function updatePhone(slug, body) {
  return api.patch(`/admin/phones/${encodeURIComponent(slug)}`, body);
}

export function uploadPhonePicture(slug, file) {
  const form = new FormData();
  form.append("picture", file);
  return api.post(`/admin/phones/${encodeURIComponent(slug)}/picture`, form);
}

export function recordPrices(body) {
  return api.post("/admin/prices", body);
}

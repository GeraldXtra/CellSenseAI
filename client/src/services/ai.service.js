// aiService: searchPhones, chat and recommend. Owner: Gerald.
import { api } from "./api.js";

export function searchPhones(query) {
  return api.post("/ai/search", { query });
}

export function chat(messages) {
  return api.post("/ai/chat", { messages });
}

export function recommend(needs) {
  return api.post("/ai/recommend", needs);
}

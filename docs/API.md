# CellSense AI API

We list here every endpoint of the CellSense AI backend: the ones we have built and the ones still planned. The frontend pages call these endpoints through the shared api service and nothing else. The shape of a phone, a user and a review is in [DATA-MODEL.md](DATA-MODEL.md). How a request travels through the site is in [ARCHITECTURE.md](ARCHITECTURE.md).

## Base URL

Every path below sits under `/api`. The backend runs on port 5000, so the full address of the health check is `http://localhost:5000/api/health`. The frontend runs on port 5173. The Vite proxy in `client/vite.config.js` forwards every `/api` request to port 5000. The client leaves `VITE_API_URL` empty (see `client/.env.example`) and calls the short paths through `client/src/services/api.js`.

`GET /health` returns `{ "ok": true, "data": { "status": "up" } }`. We open it to check that the backend is running.

## Status

Every table below has a Status column with two values. Built means the endpoint works today. Planned means the endpoint is designed but not written yet. A planned endpoint answers 404 with the message "No route for ..." until it is built. Until then, pages use the mock data file `client/src/data/mockPhones.js`, which has the exact shape the API returns.

## Login and the token

`POST /auth/register` and `POST /auth/login` return a JWT token. The token carries the user's id and role, and it expires after seven days. The shared api service keeps it in the browser and adds it to every request:

```
Authorization: Bearer <token>
```

The Login column has three values. Yes means the route needs the token and answers 401 without it. No means the route never uses it. Optional means the route works either way and does a little more when the token is there.

## Response envelope and errors

Every response uses the same envelope. On success the payload sits in `data`:

```json
{ "ok": true, "data": {} }
```

On failure the reason sits in `error.message`:

```json
{ "ok": false, "error": { "message": "..." } }
```

The Returns column in the tables below shows the fields inside `data`.

The status codes we use:

| Code | Meaning                                                                                                             |
| ---- | ------------------------------------------------------------------------------------------------------------------- |
| 200  | It worked.                                                                                                          |
| 201  | Something was created, such as an account or a review.                                                              |
| 400  | The request is wrong, such as a missing field or a rating of 7.                                                     |
| 401  | Not logged in, or the email and password do not match.                                                              |
| 404  | No such phone, or no such route.                                                                                    |
| 409  | It already exists, such as an email that has an account, or a second review of the same phone.                      |
| 429  | Too many requests. One address can send 300 requests every 15 minutes, and 20 requests every minute to the AI routes. |
| 500  | Something broke on the server. In production the message stays general, so it does not reveal how the server works. |
| 502  | The model could not be reached, or it sent a reply the server could not read. Only `POST /ai/search` can answer this today. |

## Auth

| Method | Path                    | Login | Request body                | Returns           | Status  |
| ------ | ----------------------- | ----- | --------------------------- | ----------------- | ------- |
| POST   | `/auth/register`        | No    | `{ name, email, password }` | `{ token, user }` | Built   |
| POST   | `/auth/login`           | No    | `{ email, password }`       | `{ token, user }` | Built   |
| GET    | `/auth/me`              | Yes   | none                        | `{ user }`        | Built   |
| POST   | `/auth/forgot-password` | No    | `{ email }`                 | `{ sent: true }`  | Planned |
| POST   | `/auth/reset-password`  | No    | `{ token, password }`       | `{ ok: true }`    | Planned |

Notes:

- `user` is always `{ _id, name, email, role }`. The password hash never leaves the server.
- Register needs all three fields, a valid email and a password of at least 8 characters, otherwise it answers 400. An email that already has an account answers 409. A new account answers 201.
- We store the email in lowercase, so the same person cannot sign up twice with different capitals. We never store the password itself, only a bcrypt hash of it.
- Login answers 400 when the email or the password is missing. It answers 401 with "Wrong email or password" both for an unknown email and for a wrong password, so nobody can use it to find out who has an account.
- `GET /auth/me` answers 401 with "Please log in" when the token is missing, fake or expired, or when the account no longer exists.
- Planned: `POST /auth/forgot-password` will return `{ sent: true }` whether or not the email exists. When it exists, the backend stores a hash of a reset token and an expiry one hour ahead in `passwordReset` on the user, and emails a link to `<CLIENT_URL>/reset-password/<token>`.
- Planned: `POST /auth/reset-password` will take the token from that link and the new password. It answers 400 when the token is invalid or older than one hour. On success it stores the new hash, clears `passwordReset` and returns `{ ok: true }`.

## Phones

| Method | Path                           | Login | Request body       | Returns                          | Status                    |
| ------ | ------------------------------ | ----- | ------------------ | -------------------------------- | ------------------------- |
| GET    | `/phones`                      | No    | none               | `{ items, total, page, pages }`  | Built                     |
| GET    | `/phones/compare?ids=a,b,c`    | No    | none               | `{ phones, best }`               | Built                     |
| GET    | `/phones/:slug`                | No    | none               | `{ phone }`                      | Built                     |
| GET    | `/phones/:slug/price-trend`    | No    | none               | `{ history, trend, suggestion }` | Built                     |
| GET    | `/phones/:slug/reviews`        | No    | none               | `{ items, average, count }`      | Built                     |
| POST   | `/phones/:slug/reviews`        | Yes   | `{ rating, text }` | `{ review }`                     | Built                     |
| GET    | `/phones/:slug/review-summary` | No    | none               | `{ summary, sentiment }`         | Built, star based for now |

Notes:

- `:slug` is the phone's slug: brand and model in lowercase, joined with hyphens, for example `samsung-galaxy-s24`. It is the same value the page address `/phones/:slug` uses.
- `GET /phones` serves the Home page (`GET /phones?limit=8`), the Browse page and the Add a phone dialog on Compare. Its query params are listed in the next section.
- `GET /phones/:slug` answers 404 with "Phone not found" when no phone has that slug. When the dashboard is built, this route will also take an optional token and add the phone to the user's recently viewed list.
- `GET /phones/compare` takes two or three slugs in `ids`, separated by commas. Fewer than two answers 400, and anything after the third is ignored. `phones` keeps the order of `ids`. When fewer than two of the slugs exist, it answers 404.
- `best` maps each row to the list of slugs that win it. The rows are `price`, `ram`, `storage`, `mainCamera`, `frontCamera`, `battery`, `displaySize` and `refreshRate`. The lowest price wins the price row, and the highest number wins every other row. When two phones tie for the top, both are listed. A row where every phone is equal is left out, and so is a row where a phone has no number. Processor, display type and operating system are text, so they have no winner.
- `GET /phones/:slug/price-trend` returns the price history in `history`, oldest first, as `{ price, date, source }` entries, where `source` is seed, ai, api or manual. `trend` compares the latest price with the oldest price in the 90 days before it: two percent lower or more is falling, two percent higher or more is rising, and anything in between is stable. `suggestion` is one sentence about the best time to buy. With fewer than two prices, `trend` is stable and the suggestion says there is not enough history yet.
- `GET /phones/:slug/reviews` returns the reviews newest first in `items`, each with `author`, `rating`, `text`, `sentiment` and `createdAt`. `average` is rounded to one decimal and is 0 when there are no reviews. `count` is the number of reviews.
- `POST /phones/:slug/reviews` takes a `rating`, a whole number from 1 to 5, and a `text` of 3 to 1000 characters, otherwise it answers 400. A person can review a phone once, so a second review answers 409. The author name comes from the logged in account, never from the request. A new review answers 201.
- The sentiment of a review is positive, neutral or negative. For now we set it from the stars: 4 or 5 is positive, 3 is neutral, 1 or 2 is negative.
- `GET /phones/:slug/review-summary` is star based for now. It returns "No reviews yet. Be the first to write one." or a line such as "3 reviews with an average of 4.3 out of 5.", with the sentiment that matches the average rating. When the AI part is built, the model will write one or two sentences from the review texts instead, and judge the sentiment from what people wrote.

## Query params for GET /phones

All params are optional. Units follow [DATA-MODEL.md](DATA-MODEL.md): prices in USD unless currency says otherwise, RAM and storage in GB, cameras in megapixels, battery in mAh.

| Param        | Meaning                                                                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `brand`      | One brand, or several separated by commas, for example `brand=xiaomi,vivo`. Capitals do not matter, so `samsung` from a page address works. |
| `minPrice`   | Lowest price.                                                                                                                               |
| `maxPrice`   | Highest price.                                                                                                                              |
| `has5G`      | `true` keeps only phones with 5G. Any other value is ignored.                                                                               |
| `minRam`     | Lowest RAM, for example 8 for the "8GB RAM or more" filter.                                                                                 |
| `minStorage` | Lowest storage.                                                                                                                             |
| `minCamera`  | Lowest main camera resolution.                                                                                                              |
| `minBattery` | Lowest battery capacity, for example 5000 for the "5000mAh or more" filter.                                                                 |
| `minRefresh` | Lowest display refresh rate, for example 120 for the "120Hz display" filter.                                                                |
| `category`   | One of budget, midrange, flagship, gaming, camera. Any other value is ignored.                                                              |
| `q`          | Words to look for. Each word must appear in the brand or the model, so `samsung s24` finds the Galaxy S24. At most 100 characters are used. |
| `sort`       | One of newest, priceAsc, priceDesc, camera, battery. camera and battery put the biggest first. Anything else falls back to newest.          |
| `page`       | Page number, starting at 1. The default is 1.                                                                                               |
| `limit`      | Phones per page. The default is 24 and the most is 50.                                                                                      |

A number param that is not a number is ignored, so an empty price box never filters anything.

The response holds the phones for that page in `items`, the number of matching phones in `total`, the page number in `page` and the number of pages in `pages`.

## AI

`POST /ai/search` is built. The other two are not built yet, and their rows show the design the backend will follow.

The AI features integrate a pre trained language model through an OpenAI compatible chat API. The address, the key and the model name are set in `server/.env` as `AI_BASE_URL`, `AI_API_KEY` and `AI_MODEL`.

| Method | Path            | Login    | Request body                                                       | Returns                          | Status  |
| ------ | --------------- | -------- | ------------------------------------------------------------------ | -------------------------------- | ------- |
| POST   | `/ai/search`    | Optional | `{ query }`                                                        | `{ items, filters, source }`     | Built   |
| POST   | `/ai/chat`      | No       | `{ messages: [{ role, content }] }`                                | `{ reply, phones }`              | Planned |
| POST   | `/ai/recommend` | Optional | `{ budget, brand, purpose, camera, gaming, battery, performance }` | `{ items: [{ phone, reason }] }` | Planned |

Notes:

- `POST /ai/search` takes the words in `query`. Spaces at both ends are cut and at most 200 characters are used. An empty query answers 400 with "Type what you are looking for".
- Search is direct first. The backend matches each word against brand and model in MongoDB, the same way `q` works on `GET /phones`. `source` is then `direct` and `filters` is `{ q }` with the query in it.
- A query that reads like a sentence skips the direct match and goes to the model. It reads like a sentence when it has four words or more, when it holds a dollar sign or a number of three digits or more, or when it holds one of these words: under, below, over, above, less, more, than, with, without, best, good, great, cheap, cheapest, budget, around, between, for, long, big, fast, gaming, camera, battery, selfie, selfies. A short query that direct matching finds nothing for goes to the model too.
- The model returns filters as JSON: brand, minPrice, maxPrice, has5G, minRam, minStorage, minCamera, minBattery, minRefresh, category, sort and keywords. The backend keeps only those keys and drops a number that is not above zero. The keywords come back in `filters` as `q`. The same database search then runs with those filters, following the same rules as `GET /phones`, and `source` is `ai`. When the model returns no filter we can use, `items` is empty and `filters` is `{}`.
- Without the three AI settings in `server/.env`, every search stays direct. The route still answers 200, `source` is always `direct`, and a sentence finds a phone only when every word is in its brand or model.
- `items` holds at most 24 phones. They follow `sort` in the filters when the model set one, otherwise the newest come first.
- `source` is `direct` or `ai` and tells the page which layer answered. `filters` holds the filters used, so the Search results page can show chips with how the query was understood.
- Every search is written to the searchlogs collection with the query, the filters, the source and the number of phones found. When a token is present, the search also goes to the top of the user's search history, which keeps the latest 50. A token that is fake or expired is ignored and the search runs as for a visitor.
- The AI routes have their own limit of 20 requests every minute from one address. Past it the answer is 429 with "Too many questions at once. Wait a minute and try again."
- When the model cannot be reached or does not answer within 20 seconds, the route answers 502 with "Could not reach the AI service. Try again in a moment." When the model answers with an error, the message is "The AI service did not answer. Try again in a moment." When its reply cannot be read, the message is "The AI service sent a reply we could not read."
- Planned: if still nothing matches and the query names a real phone we do not have, the model will supply its specifications. We will save the phone with source `ai`, and the page will show it with a note and an "Estimated" label on the price.
- `POST /ai/chat` will take the full chat history in `messages`. Each message has a `role` of `user` or `assistant` and a `content` string. The backend pulls related phones from MongoDB, by name in the message and by budget when one is mentioned, builds a prompt with rules, that phone data and the chat history, and sends it to the model. It returns the reply plus the phones it mentioned, so the chat window and the Assistant page can show cards under the reply.
- `POST /ai/recommend` will build a shortlist from MongoDB inside the budget, with the brand and the needs from the form. When fewer than three phones fit, we widen the budget by 15 percent. The model ranks the top three and gives a one or two sentence reason for each. The result is saved to the user's dashboard when a token is present.

## Users

Not built yet. This is the design the backend will follow.

| Method | Path                         | Login | Request body | Returns                                                          | Status  |
| ------ | ---------------------------- | ----- | ------------ | ---------------------------------------------------------------- | ------- |
| GET    | `/users/me/dashboard`        | Yes   | none         | `{ recentlyViewed, favourites, searchHistory, recommendations }` | Planned |
| POST   | `/users/me/favourites/:slug` | Yes   | none         | `{ favourites }`                                                 | Planned |
| DELETE | `/users/me/favourites/:slug` | Yes   | none         | `{ favourites }`                                                 | Planned |

Notes:

- `recentlyViewed` will keep at most 20 phones. `searchHistory` keeps at most 50 searches, and `POST /ai/search` already fills it for a logged in user. `recommendations` holds the last recommendations.
- `POST /users/me/favourites/:slug` will add a phone to the favourites and `DELETE` will remove it. Both return the favourites list after the change.

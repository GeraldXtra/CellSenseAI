# CellSense AI API

We list here every endpoint the CellSense AI backend will offer. The frontend pages call these endpoints through the shared api service and nothing else. The shape of a phone, a user and a review is in [DATA-MODEL.md](DATA-MODEL.md). How a request travels through the site is in [ARCHITECTURE.md](ARCHITECTURE.md).

## Base URL

Every path below sits under `/api`. The backend runs on port 5000, so the full address of the health check is `http://localhost:5000/api/health`. The frontend runs on port 5173. The Vite proxy in `client/vite.config.js` forwards every `/api` request to port 5000. The client leaves `VITE_API_URL` empty (see `client/.env.example`) and calls the short paths through `client/src/services/api.js`.

## Login and the token

`POST /auth/register` and `POST /auth/login` return a JWT token. The token expires after seven days. Protected routes need it in the request header:

```
Authorization: Bearer <token>
```

The Login required column has three values. Yes means the route needs the token. No means the route never needs it. Optional means the route works with or without it.

## Auth

| Method | Path | Login required | Request body | Returns |
|---|---|---|---|---|
| POST | `/auth/register` | No | `{ name, email, password }` | `{ token, user }` |
| POST | `/auth/login` | No | `{ email, password }` | `{ token, user }` |
| GET | `/auth/me` | Yes | none | `{ user }` |
| POST | `/auth/forgot-password` | No | `{ email }` | `{ sent: true }` |
| POST | `/auth/reset-password` | No | `{ token, password }` | `{ ok: true }` |

Notes:

- We store the email in lowercase and it must be unique.
- We never store the password itself. We store a bcrypt hash of it.
- `POST /auth/forgot-password` returns `{ sent: true }` whether or not the email exists, so nobody can use it to find out which emails have an account. When the email exists, the backend stores a hash of a reset token and an expiry one hour ahead in `passwordReset` on the user, and sends an email with a link to `<CLIENT_URL>/reset-password/<token>`.
- `POST /auth/reset-password` takes the token from that link and the new password. It answers 400 when the token is invalid or older than one hour. On success it stores the new bcrypt hash, clears `passwordReset` and returns `{ ok: true }`.

## Phones

| Method | Path | Login required | Request body | Returns |
|---|---|---|---|---|
| GET | `/phones` | Optional | none | `{ items, total, page, pages }` |
| GET | `/phones/compare?ids=a,b,c` | No | none | `{ phones, best }` |
| GET | `/phones/:slug` | Optional | none | `{ phone }` |
| GET | `/phones/:slug/price-trend` | No | none | `{ history, trend, suggestion }` |
| GET | `/phones/:slug/reviews` | No | none | `{ items, average, count }` |
| POST | `/phones/:slug/reviews` | Yes | `{ rating, text }` | `{ review }` |
| GET | `/phones/:slug/review-summary` | No | none | `{ summary, sentiment }` |

Notes:

- `:slug` is the phone's slug: brand and model in lowercase, joined with hyphens. It is the same value the page URL `/phones/:slug` uses.
- `GET /phones` serves the Home page (`GET /phones?limit=8`) and the Browse page. Its query params are listed below.
- `GET /phones/:slug` adds the phone to the user's recently viewed list when a token is present.
- `GET /phones/compare` takes two or three slugs in `ids`, separated by commas. `phones` holds the phones. `best` marks the winning phone in each row: price, processor, RAM, storage, main camera, front camera, battery, display size, refresh rate and operating system. The lowest price wins the price row. The highest value wins every other row.
- `GET /phones/:slug/price-trend` returns the price history as a list of `{ price, date, source }` entries. `trend` is falling, rising or stable, measured against the price about 90 days earlier. `suggestion` is one line about the best time to buy.
- `POST /phones/:slug/reviews` takes a `rating` from 1 to 5 and a `text`. The sentiment of a review is positive, neutral or negative.
- `GET /phones/:slug/reviews` returns the reviews in `items`, the average rating in `average` and the number of reviews in `count`.
- `GET /phones/:slug/review-summary` returns one or two sentences the model wrote from all reviews of the phone, and a sentiment of positive, neutral or negative.

## AI

| Method | Path | Login required | Request body | Returns |
|---|---|---|---|---|
| POST | `/ai/search` | Optional | `{ query }` | `{ items, filters, source }` |
| POST | `/ai/chat` | No | `{ messages: [{ role, content }] }` | `{ reply, phones }` |
| POST | `/ai/recommend` | Optional | `{ budget, brand, purpose, camera, gaming, battery, performance }` | `{ items: [{ phone, reason }] }` |

Notes:

- `POST /ai/search` first matches the words against brand and model in MongoDB. When the query reads like a sentence, or when direct matching finds nothing, the sentence goes to the model. The model returns filters as JSON: brand, minPrice, maxPrice, has5G, minRam, minStorage, minCamera, minBattery, minRefresh, category and keywords. The same database query then runs with those filters. `source` is `direct` or `ai` and tells the page which layer answered. `filters` holds the filters used, so the Search results page can show chips with how the query was understood. If still nothing matches and the query names a real phone we do not have, the model supplies its specifications. We save the phone with source `ai` and show it with a note and an "Estimated" label on the price. Every search is written to the searchlogs collection, and to the user's search history when a token is present.
- `POST /ai/chat` takes the full chat history in `messages`. Each message has a `role` of `user` or `assistant` and a `content` string. The backend pulls related phones from MongoDB, by name in the message and by budget when one is mentioned. It builds a prompt with rules, that phone data and the chat history, and sends it to the model. It returns the reply plus the phones it mentioned, so the Assistant page can show cards under the reply.
- `POST /ai/recommend` builds a shortlist from MongoDB inside the budget, with the brand and the needs from the form. When fewer than three phones fit, we widen the budget by 15 percent. The model ranks the top three and gives a one or two sentence reason for each. The result is saved to the user's dashboard when a token is present.

## Users

| Method | Path | Login required | Request body | Returns |
|---|---|---|---|---|
| GET | `/users/me/dashboard` | Yes | none | `{ recentlyViewed, favourites, searchHistory, recommendations }` |
| POST | `/users/me/favourites/:slug` | Yes | none | `{ favourites }` |
| DELETE | `/users/me/favourites/:slug` | Yes | none | `{ favourites }` |

Notes:

- `recentlyViewed` keeps at most 20 phones. `searchHistory` keeps at most 50 searches. `recommendations` holds the last recommendations.
- `POST /users/me/favourites/:slug` adds a phone to the favourites. `DELETE` removes it. Both return the favourites list after the change.

## Response envelope

Every response uses the same envelope. On success the payload sits in `data`:

```json
{ "ok": true, "data": { } }
```

On failure the reason sits in `error.message`:

```json
{ "ok": false, "error": { "message": "..." } }
```

The Returns column in the tables above shows the fields inside `data`.

## Query params for GET /phones

All params are optional. Units follow [DATA-MODEL.md](DATA-MODEL.md): prices in USD unless currency says otherwise, RAM and storage in GB, cameras in megapixels, battery in mAh.

| Param | Meaning |
|---|---|
| `brand` | keep only phones of this brand, for example Samsung. The match ignores case, so `samsung` from a URL works too. |
| `minPrice` | lowest price |
| `maxPrice` | highest price |
| `has5G` | keep only phones with 5G |
| `minRam` | lowest RAM |
| `minStorage` | lowest storage |
| `minCamera` | lowest camera resolution |
| `minBattery` | lowest battery capacity |
| `minRefresh` | lowest display refresh rate, for example 120 for the "120Hz display" filter |
| `category` | one of budget, midrange, flagship, gaming, camera |
| `q` | words to match against brand and model |
| `sort` | one of newest, priceAsc, priceDesc |
| `page` | page number |
| `limit` | phones per page, at most 50 |

The response holds the phones for that page in `items`, the total count in `total`, the page number in `page` and the number of pages in `pages`.

## Endpoints not built yet

The backend mounts `/api/auth`, `/api/phones`, `/api/ai` and `/api/users`, but the route files hold no routes yet. Every endpoint except `GET /api/health` answers 404 for now. `GET /api/health` returns `{ "ok": true, "data": { "status": "up" } }`. We open it to check that the backend is running. Until an endpoint is ready, pages use the mock data file `client/src/data/mockPhones.js`, which has the exact shape the API returns.

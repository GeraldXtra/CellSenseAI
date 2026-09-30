# Test data

The seed phones in `server/data/phones.json` are our test data. The file holds six phones with sample prices and four price checks each: Samsung Galaxy S24, Apple iPhone 15, OnePlus 12, Xiaomi Redmi Note 13 Pro, Vivo V30 and Samsung Galaxy A15 5G. The seed script loads them into the database with `npm run seed` from the `server` folder. We run it only on a fresh database, see [INSTALLATION.md](INSTALLATION.md).

The first table below has one test case for each endpoint that is built. We worked out every expected result from the values in `phones.json` and the rules in [API.md](API.md). The Actual result and Pass columns are empty. We fill them in when we run each case.

## Before we run the cases

1. The backend runs on port 5000, so every path below starts at `http://localhost:5000`.
2. The database holds the six seed phones, and the Samsung Galaxy S24 has no reviews yet.
3. No account uses the email `test.user@example.com` yet.
4. We run the cases in order. T03 gives the token that T04 and T09 send. T12 and T13 read the review that T09 posts.
5. T15 needs the three AI settings in `server/.env`. The other cases give the same result with or without them.

Every answer uses the envelope `{ "ok": true, "data": { } }`. The Expected result column names the status code and the fields inside `data`.

## Test cases for the built endpoints

| ID | Endpoint | What it tests | Input | Expected result | Actual result | Pass |
|----|----------|---------------|-------|-----------------|---------------|------|
| T01 | `GET /api/health` | The server is up. | `GET /api/health` | 200. `data` is `{ "status": "up" }`. | | |
| T02 | `POST /api/auth/register` | A new account is created. | Body `{ "name": "Test User", "email": "test.user@example.com", "password": "secret123" }` | 201. `token` is a long string. `user` holds `_id`, `name` "Test User", `email` "test.user@example.com" and `role` "user". No password and no hash in the answer. | | |
| T03 | `POST /api/auth/login` | The right email and password log in. | Body `{ "email": "test.user@example.com", "password": "secret123" }` | 200. `token` is a long string. `user` is the same user as in T02. | | |
| T04 | `GET /api/auth/me` | The token gives the user back. | `GET /api/auth/me` with the header `Authorization: Bearer <token from T03>` | 200. `user` is the same user as in T02. | | |
| T05 | `GET /api/phones` | The list filters by brand and sorts by price. | `GET /api/phones?brand=samsung&sort=priceAsc` | 200. `total` 2, `page` 1, `pages` 1. `items` holds two phones: Galaxy A15 5G at 199 first, then Galaxy S24 at 699. | | |
| T06 | `GET /api/phones/:slug` | One phone is found by its slug. | `GET /api/phones/samsung-galaxy-s24` | 200. `phone` has `brand` "Samsung", `model` "Galaxy S24", `category` "flagship", `releaseYear` 2024, `price.current` 699 and `price.currency` "USD". Its specs are 8 GB RAM, 256 GB storage, a 50 megapixel main camera, a 4000 mAh battery, 120 Hz and 5G. `priceHistory` has four entries and `source` is "seed". | | |
| T07 | `GET /api/phones/compare` | Three phones come back in order, with the best value in each row. | `GET /api/phones/compare?ids=samsung-galaxy-s24,oneplus-12,xiaomi-redmi-note-13-pro` | 200. `phones` holds Galaxy S24, OnePlus 12 and Redmi Note 13 Pro, in that order. In `best`: `price` is `xiaomi-redmi-note-13-pro` (299 against 699 and 699), `ram` is `oneplus-12` (12), `mainCamera` is `xiaomi-redmi-note-13-pro` (200), `frontCamera` is `oneplus-12` (32), `battery` is `oneplus-12` (5400) and `displaySize` is `oneplus-12` (6.82). `best` has no `storage`, because all three have 256, and no `refreshRate`, because all three have 120. | | |
| T08 | `GET /api/phones/:slug/price-trend` | The trend of a price that went down. | `GET /api/phones/samsung-galaxy-s24/price-trend` | 200. `history` has four entries, oldest first: 749, 729, 719, 699. `trend` is "falling". The latest price is 699 on 1 September 2026. The oldest price in the 90 days before it is 729 on 1 July 2026. 699 is 4.1 percent lower, which is past the two percent threshold. `suggestion` is "Price has been falling. Waiting a little could save you money." | | |
| T09 | `POST /api/phones/:slug/reviews` | A logged in user posts a review. | `POST /api/phones/samsung-galaxy-s24/reviews` with the header `Authorization: Bearer <token from T03>` and the body `{ "rating": 5, "text": "Bright screen and a strong camera." }` | 201. `review` has `author` "Test User", `rating` 5, the same `text` and `sentiment` "positive". | | |
| T12 | `GET /api/phones/:slug/reviews` | The list of reviews after T09. | `GET /api/phones/samsung-galaxy-s24/reviews` | 200. `count` 1 and `average` 5. `items` holds one review with `author` "Test User", `rating` 5 and `sentiment` "positive". | | |
| T13 | `GET /api/phones/:slug/review-summary` | The star based summary after T09. | `GET /api/phones/samsung-galaxy-s24/review-summary` | 200. `summary` is "1 review with an average of 5.0 out of 5." and `sentiment` is "positive". | | |
| T14 | `POST /api/ai/search` | A brand name is matched directly. | Body `{ "query": "samsung" }` | 200. `source` is "direct" and `filters` is `{ "q": "samsung" }`. `items` holds two phones: Galaxy A15 5G, then Galaxy S24. Both are from 2024 and the same brand, so the model name sets the order. | | |
| T15 | `POST /api/ai/search` | A sentence goes to the model, which turns it into filters. Needs the AI settings. | Body `{ "query": "phone under $400 with a great camera" }` | 200. `source` is "ai". `filters` is `{ "maxPrice": 400, "minCamera": 48, "sort": "camera" }`. `items` holds three phones, the biggest main camera first and the lower price first on a tie: Redmi Note 13 Pro (200 megapixels, 299), Galaxy A15 5G (50 megapixels, 199), Vivo V30 (50 megapixels, 399). | | |

T15 is a second case for search, because search has two layers and each one needs its own check.

## Planned test cases

These endpoints are not built yet. We write the input and the expected result when each one is built.

| ID | Feature | Endpoint | Status |
|----|---------|----------|--------|
| T10 | Forgot password | `POST /api/auth/forgot-password` | Planned |
| T11 | Reset password | `POST /api/auth/reset-password` | Planned |
| T16 | The assistant | `POST /api/ai/chat` | Planned |
| T17 | AI recommendation | `POST /api/ai/recommend` | Planned |
| T18 | Personal dashboard | `GET /api/users/me/dashboard` | Planned |
| T19 | Favourites | `POST /api/users/me/favourites/:slug` and `DELETE /api/users/me/favourites/:slug` | Planned |

Each feature needs at least two test cases before submission.

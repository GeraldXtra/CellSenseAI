# Test data

Our test data is the 60 phones in `server/data/phones.json`, 12 each for Samsung, Apple, OnePlus, Xiaomi and Vivo, and the price list in `server/data/prices.json`, dated 1 October 2026. Six phones in the file carry four monthly price checks from 1 June to 1 September 2026: the Galaxy S24, the Galaxy A15 5G, the iPhone 15, the OnePlus 12, the Redmi Note 13 Pro and the Vivo V30. The price list holds a price dated 1 October 2026 for the same six, four of them different from 1 September. The other 54 phones carry one check dated 1 October 2026.

The tables below hold at least two test cases for every feature. We worked out every expected result from the two files and the rules in [API.md](API.md). The Actual result and Pass columns are empty. We fill them in when we run each case.

## Before we run the cases

1. We run the cases on a fresh database of our own, set up as in "A machine outside the team" in [INSTALLATION.md](INSTALLATION.md), and never on the shared database. T02 to T05 load the phones and the prices, and later cases add an account, reviews and a phone.
2. `server/.env` is filled as in Step 5 of [INSTALLATION.md](INSTALLATION.md): `CLIENT_URL=http://localhost:5173`, the mail lines empty and no `NODE_ENV`, so the reset link is printed in the backend window and every error shows its real message.
3. The AI column says what each case needs. Empty means the three `AI_` lines are empty. Filled means they hold the Groq values from "Turning on the AI features" in [INSTALLATION.md](INSTALLATION.md). Either means the result is the same both ways.
4. We run the cases in two rounds. Round one: the three `AI_` lines empty, every case marked Empty or Either, in order. Round two: fill the three lines, start the backend again, and run every case marked Filled, in order.
5. The backend runs on port 5000, so every path starts at `http://localhost:5000`. `<token>` means the token from T09, sent in the header `Authorization: Bearer <token>`.

Every answer uses the envelope `{ "ok": true, "data": { } }` or `{ "ok": false, "error": { "message": "..." } }`. The Expected result column names the status code and the fields inside `data`, or the text of `error.message`.

## Setup and health

| ID | Endpoint or command | What it tests | AI | Input | Expected result | Actual result | Pass |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T01 | `GET /api/health` | The server is up. | Either | none | 200. `data` is `{ "status": "up" }`. | | |
| T02 | `npm run seed` | The seed loads the phones into a fresh database. | Either | Run in the `server` folder. | Prints `Seed: 60 phones added, 0 updated`. | | |
| T03 | `npm run seed` | The seed is safe to run again and leaves prices alone. | Either | Run it a second time. | Prints `Seed: 0 phones added, 60 updated`. `GET /api/phones/samsung-galaxy-s24` still shows `price.current` 699 and four price checks. | | |
| T04 | `npm run prices` | The price check records the price list. | Either | Run in the `server` folder. | Prints `Price check for 2026-10-01: 4 changed, 2 unchanged, 0 skipped`. The Galaxy S24 now has `price.current` 689 and a fifth `priceHistory` entry with price 689, the date 1 October 2026 and source "manual". | | |
| T05 | `npm run prices` | The same list twice changes nothing. | Either | Run it a second time. | Prints `Price check for 2026-10-01: 0 changed, 0 unchanged, 6 skipped`. | | |

## Accounts and login

| ID | Endpoint or command | What it tests | AI | Input | Expected result | Actual result | Pass |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T06 | `POST /api/auth/register` | A new account is created. | Either | `{ "name": "Test User", "email": "test.user@example.com", "password": "secret123" }` | 201. `token` is a long string. `user` holds `_id`, `name` "Test User", `email` "test.user@example.com" and `role` "user". No password and no hash in the answer. | | |
| T07 | `POST /api/auth/register` | An email cannot sign up twice. | Either | The same body as T06, with the email written `Test.User@Example.com`. | 409. "An account with that email already exists". | | |
| T08 | `POST /api/auth/register` | A short password is refused. | Either | `{ "name": "Short Pass", "email": "short@example.com", "password": "abc" }` | 400. "Password must be at least 8 characters". | | |
| T09 | `POST /api/auth/login` | The right email and password log in. | Either | `{ "email": "test.user@example.com", "password": "secret123" }` | 200. `token` is a long string. `user` is the same user as in T06. | | |
| T10 | `POST /api/auth/login` | A wrong password is refused. | Either | `{ "email": "test.user@example.com", "password": "wrongpass1" }` | 401. "Wrong email or password". | | |
| T11 | `GET /api/auth/me` | The token gives the user back. | Either | `<token>` | 200. `user` is the same user as in T06. | | |
| T12 | `GET /api/auth/me` | No token, no user. | Either | No header. | 401. "Please log in". | | |

## Password reset

| ID | Endpoint or command | What it tests | AI | Input | Expected result | Actual result | Pass |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T13 | `POST /api/auth/forgot-password` | A reset link is made for an account. | Either | `{ "email": "test.user@example.com" }` | 200. `data` is `{ "sent": true }`. The backend window prints "Mail is not set up. Reset link for test.user@example.com: http://localhost:5173/reset-password/" followed by 64 letters and digits. | | |
| T14 | `POST /api/auth/forgot-password` | An unknown email gets the same answer. | Either | `{ "email": "nobody@example.com" }` | 200. `data` is `{ "sent": true }`. The backend window prints no link. | | |
| T15 | `POST /api/auth/reset-password` | The link from T13 sets a new password. | Either | `{ "token": "<the 64 characters from T13>", "password": "newsecret123" }` | 200. `data` is `{ "ok": true }`. Login with "newsecret123" then answers 200, and login with "secret123" answers 401. | | |
| T16 | `POST /api/auth/reset-password` | A link works once. | Either | The same body as T15. | 400. "This reset link is invalid or has expired. Ask for a new one." | | |
| T17 | `POST /api/auth/forgot-password` | One address can ask five times in 15 minutes. | Either | `{ "email": "nobody@example.com" }` four more times within 15 minutes of T13. | The first three answer 200. The fourth answers 429 with "Too many reset requests. Try again in 15 minutes." | | |

## Phone list

| ID | Endpoint or command | What it tests | AI | Input | Expected result | Actual result | Pass |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T18 | `GET /api/phones` | The first page with the defaults. | Either | none | 200. `total` 60, `page` 1, `pages` 3, and 24 phones in `items`, newest first: the iPhone 16, the iPhone 16 Plus and the iPhone 16 Pro lead, because the 2024 phones come first, sorted by brand and then model. | | |
| T19 | `GET /api/phones` | A brand, a highest price and the price sort. | Either | `?brand=samsung&maxPrice=300&sort=priceAsc` | 200. `total` 3, `pages` 1. `items`: Galaxy A05s at 139, Galaxy A15 5G at 199, Galaxy A25 5G at 249. | | |
| T20 | `GET /api/phones` | The feature filters together. | Either | `?has5G=true&minBattery=5000&minRefresh=120&maxPrice=300&sort=priceAsc` | 200. `total` 6. The OnePlus Nord CE 3 Lite at 229 first, then the Galaxy A25 5G and the OnePlus Nord N30 5G at 249 in either order, the Redmi Note 13 Pro at 289, and the OnePlus Nord CE 3 and Nord CE 4 at 299 in either order. | | |
| T21 | `GET /api/phones` | Pages and the page size. | Either | `?limit=50&page=2` | 200. `total` 60, `page` 2, `pages` 2, and 10 phones in `items`. | | |
| T22 | `GET /api/phones` | Words match brand and model. | Either | `?q=galaxy%20s24` | 200. `total` 3: Galaxy S24, Galaxy S24 Ultra and Galaxy S24+. | | |
| T23 | `GET /api/phones` | Values that cannot filter are ignored. | Either | `?maxPrice=abc&category=tablet` | 200. `total` 60. | | |

## Phone detail

| ID | Endpoint or command | What it tests | AI | Input | Expected result | Actual result | Pass |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T24 | `GET /api/phones/:slug` | One phone is found by its slug. | Either | `/api/phones/samsung-galaxy-s24`, no token | 200. `phone` has `brand` "Samsung", `model` "Galaxy S24", `category` "flagship", `releaseYear` 2024, `imageUrl` "/phones/samsung-galaxy-s24.png", `price.current` 689, `price.currency` "USD", five `priceHistory` entries, `source` "seed" and the summary from the file in `aiSummary`. `isFavourite` is false. | | |
| T25 | `GET /api/phones/:slug` | A slug that does not exist. | Either | `/api/phones/apple-iphone-17` | 404. "Phone not found". | | |
| T26 | `GET /api/phones/:slug` | The model writes a missing summary once. | Filled | `/api/phones/samsung-galaxy-s24-ultra`, twice | 200 both times. The first answer holds one or two sentences in `aiSummary`, without the price. The second answer holds the same text, read from the database. | | |

## Comparison

| ID | Endpoint or command | What it tests | AI | Input | Expected result | Actual result | Pass |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T27 | `GET /api/phones/compare` | Three phones come back in order, with the best value in each row. | Either | `?ids=samsung-galaxy-s24,oneplus-12,xiaomi-redmi-note-13-pro` | 200. `phones` holds the Galaxy S24, the OnePlus 12 and the Redmi Note 13 Pro, in that order. Each row in `best` holds a list of the winning slugs: `price` is `["xiaomi-redmi-note-13-pro"]` (289 against 689 and 679), `ram` is `["oneplus-12"]` (12), `mainCamera` is `["xiaomi-redmi-note-13-pro"]` (200), `frontCamera` is `["oneplus-12"]` (32), `battery` is `["oneplus-12"]` (5400) and `displaySize` is `["oneplus-12"]` (6.82). `best` has no `storage`, because all three have 256, and no `refreshRate`, because all three have 120. | | |
| T28 | `GET /api/phones/compare` | One slug is not enough. | Either | `?ids=samsung-galaxy-s24` | 400. "Choose at least two phones to compare". | | |
| T29 | `GET /api/phones/compare` | A slug that does not exist. | Either | `?ids=samsung-galaxy-s24,apple-iphone-17` | 404. "Could not find at least two of those phones". | | |

## Price trend

| ID | Endpoint or command | What it tests | AI | Input | Expected result | Actual result | Pass |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T30 | `GET /api/phones/:slug/price-trend` | A price that went down. | Either | `/api/phones/samsung-galaxy-s24/price-trend` | 200. `history` has five entries, oldest first: 749, 729, 719, 699, 689. The latest price is 689 on 1 October 2026, and the oldest price in the 90 days before it is 719 on 1 August 2026. 689 is 4.2 percent lower, so `trend` is "falling" and `suggestion` is "Price has been falling. Waiting a little could save you money." | | |
| T31 | `GET /api/phones/:slug/price-trend` | A price that went up. | Either | `/api/phones/vivo-v30/price-trend` | 200. `history` ends 399, 399, 409. 409 is 2.5 percent above 399 on 1 August 2026, so `trend` is "rising" and `suggestion` is "Price has been rising. Buying soon may cost less than waiting." | | |
| T32 | `GET /api/phones/:slug/price-trend` | A price that held. | Either | `/api/phones/apple-iphone-15/price-trend` | 200. The latest price, 699, equals the price on 1 August 2026, so `trend` is "stable" and `suggestion` is "Price has been steady. Now is as good a time to buy as any." | | |
| T33 | `GET /api/phones/:slug/price-trend` | One price check only. | Either | `/api/phones/samsung-galaxy-s24-ultra/price-trend` | 200. `history` has one entry, 1199. `trend` is "stable" and `suggestion` is "Not enough price checks yet to see which way the price is moving." | | |

## Reviews

| ID | Endpoint or command | What it tests | AI | Input | Expected result | Actual result | Pass |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T34 | `POST /api/phones/:slug/reviews` | A logged in user posts a review. | Either | `/api/phones/samsung-galaxy-s24/reviews` with `<token>` and `{ "rating": 5, "text": "Bright screen and a strong camera." }` | 201. `review` has `author` "Test User", `rating` 5, the same `text` and `sentiment` "positive". | | |
| T35 | `POST /api/phones/:slug/reviews` | One review per person per phone. | Either | The same request as T34. | 409. "You have already reviewed this phone". | | |
| T36 | `POST /api/phones/:slug/reviews` | Posting needs login. | Either | The body of T34 with no header. | 401. "Please log in". | | |
| T37 | `POST /api/phones/:slug/reviews` | A rating outside 1 to 5. | Either | `/api/phones/oneplus-12/reviews` with `<token>` and `{ "rating": 7, "text": "Great phone overall." }` | 400. "Choose a rating from 1 to 5". | | |
| T38 | `GET /api/phones/:slug/reviews` | The list of reviews after T34. | Either | `/api/phones/samsung-galaxy-s24/reviews` | 200. `count` 1 and `average` 5. `items` holds one review with `author` "Test User", `rating` 5 and `sentiment` "positive". | | |
| T39 | `GET /api/phones/:slug/review-summary` | The star based summary. | Empty | `/api/phones/samsung-galaxy-s24/review-summary` | 200. `summary` is "1 review with an average of 5.0 out of 5." and `sentiment` is "positive". | | |
| T40 | `GET /api/phones/:slug/review-summary` | The model writes the summary and it is saved. | Filled | The same request as T39, twice | 200 both times. `summary` is one or two sentences about the bright screen and the camera, and `sentiment` is "positive". The second answer holds the same text, read from the phone. | | |

T39 runs in round one and T40 in round two. In the other order, T39 would also get the saved summary from the model, because the backend reuses it while the number of reviews stays the same.

## Search

| ID | Endpoint or command | What it tests | AI | Input | Expected result | Actual result | Pass |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T41 | `POST /api/ai/search` | A brand name is matched directly and saved to the history. | Either | `{ "query": "samsung" }` with `<token>` | 200. `source` is "direct" and `filters` is `{ "q": "samsung" }`. `items` holds the 12 Samsung phones, newest first: the Galaxy A15 5G, A25 5G, A35 5G, A55 5G, S24, S24 Ultra and S24+ from 2024, then the five from 2023. | | |
| T42 | `POST /api/ai/search` | Without the model, a sentence stays direct. | Empty | `{ "query": "phone under $400 with a great camera" }`, no token | 200. `source` is "direct", `filters` is `{ "q": "phone under $400 with a great camera" }` and `items` is empty. | | |
| T43 | `POST /api/ai/search` | A sentence goes to the model, which turns it into filters. | Filled | The same body as T42, no token | 200. `source` is "ai" and `filters` is `{ "maxPrice": 400, "minCamera": 48, "sort": "camera" }`. `items` holds 23 phones, all at 400 or less with a main camera of 48 MP or more, the biggest camera first and the lower price first on a tie: the Redmi Note 13 Pro (200 MP, 289) and the Redmi Note 13 Pro+ (200 MP, 399), then the Redmi Note 13 (108 MP, 199), the OnePlus Nord CE 3 Lite (108 MP, 229) and the OnePlus Nord N30 5G (108 MP, 249). | | |
| T44 | `POST /api/ai/search` | An empty query is refused. | Either | `{ "query": "  " }` | 400. "Type what you are looking for". | | |
| T45 | `POST /api/ai/search` | The model adds a phone we do not have. | Filled | `{ "query": "Google Pixel 8" }`, no token | 200. `source` is "ai". `items` holds one phone, the Google Pixel 8, with `slug` `google-pixel-8`, `source` "ai", one `priceHistory` entry with source "ai", a summary in `aiSummary` and an empty `imageUrl`. | | |
| T46 | `POST /api/ai/search` | The added phone is found directly next time. | Filled | The same body as T45 | 200. `source` is "direct", and `items` holds the same phone as T45. `GET /api/phones?q=pixel` shows `total` 1, so no second copy was saved. | | |

## Assistant

| ID | Endpoint or command | What it tests | AI | Input | Expected result | Actual result | Pass |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T47 | `POST /api/ai/chat` | Without the model the assistant says so. | Empty | `{ "messages": [{ "role": "user", "content": "Which phone has the longest battery?" }] }` | 503. "The AI features are not set up yet". | | |
| T48 | `POST /api/ai/chat` | The model answers from our data. | Filled | The same body as T47 | 200. `reply` is plain text of at most four sentences that names up to three of the four phones with the biggest battery in our data, 5500 mAh: the OnePlus 12R, the OnePlus Nord 4, the OnePlus Nord CE 4 and the Vivo V40. `phones` holds the phones the reply names, in the order it names them, at most three, all from the phones the model was given. | | |
| T49 | `POST /api/ai/chat` | No question, no answer. | Either | `{ "messages": [] }` | 400. "Send a question to the assistant". | | |
| T50 | `POST /api/ai/chat` | The last message must be from the user. | Either | `{ "messages": [{ "role": "assistant", "content": "Hello" }] }` | 400. "Send a question to the assistant". | | |

## Recommendations

| ID | Endpoint or command | What it tests | AI | Input | Expected result | Actual result | Pass |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T51 | `POST /api/ai/recommend` | Our own rules pick and explain three phones. | Empty | `{ "budget": 400, "brand": "any", "purpose": "photos", "performance": "balanced", "camera": true, "gaming": false, "battery": false }` with `<token>` | 200. `widened` is false. `items` in order: the Redmi Note 13 Pro with "Guide price $289, with a 200 MP main camera.", the Redmi Note 13 Pro+ with "Guide price $399, with a 200 MP main camera." and the OnePlus Nord CE 3 Lite with "Guide price $229, with a 108 MP main camera." | | |
| T52 | `POST /api/ai/recommend` | A small budget is raised by 15 percent. | Empty | `{ "budget": 130, "brand": "any", "purpose": "everyday", "performance": "basic", "camera": false, "gaming": false, "battery": false }`, no token | 200. `widened` is true, because only two phones cost 130 or less and the budget rose to 150. `items` in order: the Galaxy A05s with "Guide price $139, with a 50 MP main camera and a 5000 mAh battery.", then the Redmi 13C at 119 and the Vivo Y17s at 129 with the same kind of reason. | | |
| T53 | `POST /api/ai/recommend` | A budget outside the range. | Either | `{ "budget": 20 }` | 400. "Enter a budget between 50 and 5000 US dollars". | | |
| T54 | `POST /api/ai/recommend` | The model ranks the shortlist and writes the reasons. | Filled | The same body as T51, no token | 200. `widened` is false. `items` holds three phones from our shortlist of six (Redmi Note 13 Pro, Redmi Note 13 Pro+, OnePlus Nord CE 3 Lite, OnePlus Nord N30 5G, Redmi Note 13, Poco X6 Pro), each with a reason of one or two sentences written by the model. | | |

## Favourites and the dashboard

| ID | Endpoint or command | What it tests | AI | Input | Expected result | Actual result | Pass |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T55 | `POST /api/users/me/favourites/:slug` | A phone is saved to the favourites. | Either | `/api/users/me/favourites/samsung-galaxy-s24` with `<token>` | 200. `favourites` holds one phone, the Galaxy S24. | | |
| T56 | `GET /api/phones/:slug` | The detail knows the favourite and records the visit. | Either | `/api/phones/samsung-galaxy-s24` with `<token>` | 200. `isFavourite` is true. | | |
| T57 | `POST /api/users/me/favourites/:slug` | A slug that does not exist. | Either | `/api/users/me/favourites/apple-iphone-17` with `<token>` | 404. "Phone not found". | | |
| T58 | `GET /api/users/me/dashboard` | The four lists after the cases above. | Either | `<token>` | 200. `recentlyViewed` holds the Galaxy S24 from T56. `favourites` holds the Galaxy S24. `searchHistory` holds one entry with `query` "samsung" and `filters` `{ "q": "samsung" }` from T41. `recommendations` holds the three picks of T51 with their reasons. | | |
| T59 | `DELETE /api/users/me/favourites/:slug` | A favourite is removed. | Either | `/api/users/me/favourites/samsung-galaxy-s24` with `<token>` | 200. `favourites` is empty. | | |
| T60 | `GET /api/users/me/dashboard` | The dashboard needs login. | Either | No header. | 401. "Please log in". | | |

## Rate limit

| ID | Endpoint or command | What it tests | AI | Input | Expected result | Actual result | Pass |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T61 | `POST /api/ai/search` | One address can send 20 AI requests a minute. | Either | `{ "query": "samsung" }` 21 times within one minute, with no other AI request in that minute | The first 20 answer 200. The 21st answers 429 with "Too many questions at once. Wait a minute and try again." | | |

T61 runs last in round one, because it blocks the AI routes for a minute. Starting the backend again for round two clears the counter.

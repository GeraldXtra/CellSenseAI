# Test data

Our test data is the 60 phones in `server/data/phones.json`, 12 each for Samsung, Apple, OnePlus, Xiaomi and Vivo, and the price list in `server/data/prices.json`, dated 1 October 2026. Six phones in the file carry four monthly price checks from 1 June to 1 September 2026: the Galaxy S24, the Galaxy A15 5G, the iPhone 15, the OnePlus 12, the Redmi Note 13 Pro and the Vivo V30. The price list holds a price dated 1 October 2026 for the same six, four of them different from 1 September. The other 54 phones carry one check dated 1 October 2026.

The tables below hold at least two test cases for every feature, and a case for every message of the email code, the security check and the Profile page. We worked out every expected result from the two files and the rules in [API.md](API.md). The Actual result and Pass columns are empty. We fill them in when we run each case.

## Before we run the cases

1. We run the cases on a fresh database of our own, set up as in "A machine outside the team" in [INSTALLATION.md](INSTALLATION.md), and never on the shared database. T02 to T05 load the phones and the prices, and later cases add two accounts, reviews and a phone.
2. `server/.env` is filled as in Step 5 of [INSTALLATION.md](INSTALLATION.md): `CLIENT_URL=http://localhost:5173`, `TURNSTILE_SECRET_KEY` with Cloudflare's test secret, `RESEND_API_KEY` empty and no `NODE_ENV`, so the email codes and the reset link are printed in the backend window and every error shows its real message. Every register body carries Cloudflare's test token `XXXX.DUMMY.TOKEN.XXXX`, which the test secret accepts.
3. The AI column says what each case needs. Empty means the three `AI_` lines are empty. Filled means they hold the Groq values from "Turning on the AI features" in [INSTALLATION.md](INSTALLATION.md). Either means the result is the same both ways.
4. We run the cases in three rounds. Round one: the three `AI_` lines empty, every case marked Empty or Either, in order, except the cases under Changed settings. Round two: fill the three lines, start the backend again, and run every case marked Filled, in order. Round three: the cases under Changed settings, each with the one line it names changed in `server/.env`.
5. The backend runs on port 5000, so every path starts at `http://localhost:5000`. `<token>` means the token of Test User, sent in the header `Authorization: Bearer <token>`: the one from T10, and after the reset in T37 the one from T39. `<token B>` means the token of the second account, Profile Check, from T27, and after each case that hands out a new token, the newest one.

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
| T06 | `POST /api/auth/register` | A new sign up sends a code and creates no account yet. | Either | `{ "name": "Test User", "email": "test.user@example.com", "password": "secret123", "turnstileToken": "XXXX.DUMMY.TOKEN.XXXX" }` | 200. `data` is `{ "email": "test.user@example.com", "expiresInMinutes": 10, "resendAfterSeconds": 60 }`, with no token. The backend window prints "Mail is not set up. Verification code for test.user@example.com:" followed by six digits. A login with that email and password still answers 401. | | |
| T07 | `POST /api/auth/verify-email` | The right code creates the account and logs in. | Either | `{ "email": "test.user@example.com", "code": "<the six digits from T06>" }` | 201. `token` is a long string. `user` holds `_id`, `name` "Test User", `email` "test.user@example.com", `role` "user", `emailVerified` true and `createdAt`. No password and no hash in the answer. | | |
| T08 | `POST /api/auth/register` | An email cannot sign up twice. | Either | The same body as T06, with the email written `Test.User@Example.com`. | 409. "An account with that email already exists". | | |
| T09 | `POST /api/auth/register` | A short password is refused. | Either | `{ "name": "Short Pass", "email": "short@example.com", "password": "abc" }` | 400. "Password must be at least 8 characters". | | |
| T10 | `POST /api/auth/login` | The right email and password log in. | Either | `{ "email": "test.user@example.com", "password": "secret123" }` | 200. `token` is a long string. `user` is the same user as in T07. | | |
| T11 | `POST /api/auth/login` | A wrong password is refused. | Either | `{ "email": "test.user@example.com", "password": "wrongpass1" }` | 401. "Wrong email or password". | | |
| T12 | `GET /api/auth/me` | The token gives the user back. | Either | `<token>` | 200. `user` is the same user as in T07. | | |
| T13 | `GET /api/auth/me` | No token, no user. | Either | No header. | 401. "Please log in". | | |

## Sign up with a code

These cases make the second account, Profile Check, which the Profile cases use later. `<code B>` means the six digits the backend window prints after "Mail is not set up. Verification code for profile.check@example.com:".

| ID | Endpoint or command | What it tests | AI | Input | Expected result | Actual result | Pass |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T14 | `POST /api/auth/register` | A name must have 2 to 60 characters. | Either | `{ "name": "Profile Check", "email": "profile.check@example.com", "password": "profilepass1", "turnstileToken": "XXXX.DUMMY.TOKEN.XXXX" }` with the name "A" | 400. "Enter a name between 2 and 60 characters". | | |
| T15 | `POST /api/auth/register` | bcrypt reads only 72 bytes, so a longer password is refused. | Either | `{ "name": "Profile Check", "email": "profile.check@example.com", "password": "profilepass1", "turnstileToken": "XXXX.DUMMY.TOKEN.XXXX" }` with the password `a` written 73 times | 400. "Keep your password under 72 characters". | | |
| T16 | `POST /api/auth/register` | The security check is required. | Either | `{ "name": "Profile Check", "email": "profile.check@example.com", "password": "profilepass1", "turnstileToken": "XXXX.DUMMY.TOKEN.XXXX" }` without `turnstileToken` | 400. "Complete the security check". | | |
| T17 | `POST /api/auth/register` | The second sign up sends its code. | Either | `{ "name": "Profile Check", "email": "profile.check@example.com", "password": "profilepass1", "turnstileToken": "XXXX.DUMMY.TOKEN.XXXX" }` | 200. `data` is `{ "email": "profile.check@example.com", "expiresInMinutes": 10, "resendAfterSeconds": 60 }`. The backend window prints the first `<code B>`. | | |
| T18 | `POST /api/auth/register` | A second code waits 60 seconds. | Either | The same body as T17, within 60 seconds of it. | 429. "Wait N seconds before asking for another code." with N the seconds left, from 1 to 60. No new code is printed. | | |
| T19 | `POST /api/auth/resend-code` | A new code also waits 60 seconds. | Either | `{ "email": "profile.check@example.com" }`, within 60 seconds of T17 | 429. "Wait N seconds before asking for another code." | | |
| T20 | `POST /api/auth/verify-email` | The code must be 6 digits. | Either | `{ "email": "profile.check@example.com", "code": "12345" }` | 400. "Enter the 6 digit code from the email". | | |
| T21 | `POST /api/auth/verify-email` | A wrong code uses a try. | Either | `{ "email": "profile.check@example.com", "code": "<six digits that are not <code B>>" }` | 400. "That code is not right. You have 4 tries left." | | |
| T22 | `POST /api/auth/verify-email` | The tries count down. | Either | The body of T21 three more times. | 400 each time: "That code is not right. You have 3 tries left.", then "That code is not right. You have 2 tries left.", then "That code is not right. You have 1 try left." | | |
| T23 | `POST /api/auth/verify-email` | The fifth wrong code locks the sign up. | Either | The body of T21 once more. | 429. "Too many wrong codes. Ask for a new code." | | |
| T24 | `POST /api/auth/verify-email` | After five tries even the right code is refused. | Either | `{ "email": "profile.check@example.com", "code": "<code B>" }` | 429. "Too many wrong codes. Ask for a new code." | | |
| T25 | `POST /api/auth/resend-code` | A new code after 60 seconds. | Either | `{ "email": "profile.check@example.com" }`, at least 60 seconds after T17 | 200. `data` is `{ "sent": true, "expiresInMinutes": 10, "resendAfterSeconds": 60 }`. The backend window prints a new code, which is `<code B>` from now on. | | |
| T26 | `POST /api/auth/verify-email` | The new code replaces the old one, with five new tries. | Either | `{ "email": "profile.check@example.com", "code": "<the code from T17>" }` | 400. "That code is not right. You have 4 tries left." | | |
| T27 | `POST /api/auth/verify-email` | The new code creates the second account. | Either | `{ "email": "profile.check@example.com", "code": "<code B>" }` | 201. `user` has `name` "Profile Check" and `emailVerified` true. The `token` is `<token B>`. | | |
| T28 | `POST /api/auth/verify-email` | A sign up is used once. | Either | The same body as T27. | 400. "This sign up has expired. Create your account again." | | |
| T29 | `POST /api/auth/resend-code` | No new code once the account exists. | Either | `{ "email": "profile.check@example.com" }` | 400. "This sign up has expired. Create your account again." | | |
| T30 | `POST /api/auth/resend-code` | The email must look like an email. | Either | `{ "email": "not an email" }` | 400. "Enter a valid email address". | | |
| T31 | `POST /api/auth/register`, then `POST /api/auth/verify-email` | A code works for 10 minutes. | Either | `{ "name": "Late Code", "email": "late.code@example.com", "password": "latecode1", "turnstileToken": "XXXX.DUMMY.TOKEN.XXXX" }`, then after 11 minutes the code the backend printed, as `{ "email": "late.code@example.com", "code": "<that code>" }` | 200 for the register. 400 for the code: "This code has expired. Ask for a new one." | | |
| T32 | `POST /api/auth/register` | One address can start ten sign ups in 15 minutes. | Either | Start the backend again, then send the body of T14 11 times. | The first ten answer 400 with the name message. The 11th answers 429 with "Too many sign up attempts. Try again in 15 minutes." | | |
| T33 | `POST /api/auth/verify-email` | One address can try 20 codes in 15 minutes. | Either | Start the backend again, then send `{ "email": "nobody@example.com", "code": "123456" }` 21 times. | The first 20 answer 400 with "This sign up has expired. Create your account again." The 21st answers 429 with "Too many tries. Try again in 15 minutes." | | |
| T34 | `POST /api/auth/resend-code` | One address can ask for five codes in 15 minutes. | Either | Start the backend again, then send `{ "email": "nobody@example.com" }` six times. | The first five answer 400 with "This sign up has expired. Create your account again." The sixth answers 429 with "Too many new codes asked for. Try again in 15 minutes." | | |

T32 to T34 each start the backend again, because the limits count in memory. A login token survives the restart.

## Password reset

| ID | Endpoint or command | What it tests | AI | Input | Expected result | Actual result | Pass |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T35 | `POST /api/auth/forgot-password` | A reset link is made for an account. | Either | `{ "email": "test.user@example.com" }` | 200. `data` is `{ "sent": true }`. The backend window prints "Mail is not set up. Reset link for test.user@example.com: http://localhost:5173/reset-password/" followed by 64 letters and digits. | | |
| T36 | `POST /api/auth/forgot-password` | An unknown email gets the same answer. | Either | `{ "email": "nobody@example.com" }` | 200. `data` is `{ "sent": true }`. The backend window prints no link. | | |
| T37 | `POST /api/auth/reset-password` | The link from T35 sets a new password. | Either | `{ "token": "<the 64 characters from T35>", "password": "newsecret123" }` | 200. `data` is `{ "ok": true }`. Login with "newsecret123" then answers 200, and login with "secret123" answers 401. | | |
| T38 | `GET /api/auth/me` | A reset ends every older login. | Either | The token from T10 | 401. "Please log in". | | |
| T39 | `POST /api/auth/login` | Test User logs in again after the reset. | Either | `{ "email": "test.user@example.com", "password": "newsecret123" }` | 200 with a new `token`, which is `<token>` from now on. `GET /api/auth/me` with it answers 200. | | |
| T40 | `POST /api/auth/reset-password` | A link works once. | Either | The same body as T37. | 400. "This reset link is invalid or has expired. Ask for a new one." | | |
| T41 | `POST /api/auth/reset-password` | A new password over 72 bytes is refused. | Either | `{ "token": "abc", "password": "<the letter a written 73 times>" }` | 400. "Keep your password under 72 characters". | | |
| T42 | `POST /api/auth/forgot-password` | One address can ask five times in 15 minutes. | Either | `{ "email": "nobody@example.com" }` four more times within 15 minutes of T35. | The first three answer 200. The fourth answers 429 with "Too many reset requests. Try again in 15 minutes." | | |

## Phone list

| ID | Endpoint or command | What it tests | AI | Input | Expected result | Actual result | Pass |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T43 | `GET /api/phones` | The first page with the defaults. | Either | none | 200. `total` 60, `page` 1, `pages` 3, and 24 phones in `items`, newest first: the iPhone 16, the iPhone 16 Plus and the iPhone 16 Pro lead, because the 2024 phones come first, sorted by brand and then model. | | |
| T44 | `GET /api/phones` | A brand, a highest price and the price sort. | Either | `?brand=samsung&maxPrice=300&sort=priceAsc` | 200. `total` 3, `pages` 1. `items`: Galaxy A05s at 139, Galaxy A15 5G at 199, Galaxy A25 5G at 249. | | |
| T45 | `GET /api/phones` | The feature filters together. | Either | `?has5G=true&minBattery=5000&minRefresh=120&maxPrice=300&sort=priceAsc` | 200. `total` 6. The OnePlus Nord CE 3 Lite at 229 first, then the Galaxy A25 5G and the OnePlus Nord N30 5G at 249 in either order, the Redmi Note 13 Pro at 289, and the OnePlus Nord CE 3 and Nord CE 4 at 299 in either order. | | |
| T46 | `GET /api/phones` | Pages and the page size. | Either | `?limit=50&page=2` | 200. `total` 60, `page` 2, `pages` 2, and 10 phones in `items`. | | |
| T47 | `GET /api/phones` | Words match brand and model. | Either | `?q=galaxy%20s24` | 200. `total` 3: Galaxy S24, Galaxy S24 Ultra and Galaxy S24+. | | |
| T48 | `GET /api/phones` | Values that cannot filter are ignored. | Either | `?maxPrice=abc&category=tablet` | 200. `total` 60. | | |

## Phone detail

| ID | Endpoint or command | What it tests | AI | Input | Expected result | Actual result | Pass |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T49 | `GET /api/phones/:slug` | One phone is found by its slug. | Either | `/api/phones/samsung-galaxy-s24`, no token | 200. `phone` has `brand` "Samsung", `model` "Galaxy S24", `category` "flagship", `releaseYear` 2024, `imageUrl` "/phones/samsung-galaxy-s24.png", `price.current` 689, `price.currency` "USD", five `priceHistory` entries, `source` "seed" and the summary from the file in `aiSummary`. `isFavourite` is false. | | |
| T50 | `GET /api/phones/:slug` | A slug that does not exist. | Either | `/api/phones/apple-iphone-17` | 404. "Phone not found". | | |
| T51 | `GET /api/phones/:slug` | The model writes a missing summary once. | Filled | `/api/phones/samsung-galaxy-s24-ultra`, twice | 200 both times. The first answer holds one or two sentences in `aiSummary`, without the price. The second answer holds the same text, read from the database. | | |

## Comparison

| ID | Endpoint or command | What it tests | AI | Input | Expected result | Actual result | Pass |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T52 | `GET /api/phones/compare` | Three phones come back in order, with the best value in each row. | Either | `?ids=samsung-galaxy-s24,oneplus-12,xiaomi-redmi-note-13-pro` | 200. `phones` holds the Galaxy S24, the OnePlus 12 and the Redmi Note 13 Pro, in that order. Each row in `best` holds a list of the winning slugs: `price` is `["xiaomi-redmi-note-13-pro"]` (289 against 689 and 679), `ram` is `["oneplus-12"]` (12), `mainCamera` is `["xiaomi-redmi-note-13-pro"]` (200), `frontCamera` is `["oneplus-12"]` (32), `battery` is `["oneplus-12"]` (5400) and `displaySize` is `["oneplus-12"]` (6.82). `best` has no `storage`, because all three have 256, and no `refreshRate`, because all three have 120. | | |
| T53 | `GET /api/phones/compare` | One slug is not enough. | Either | `?ids=samsung-galaxy-s24` | 400. "Choose at least two phones to compare". | | |
| T54 | `GET /api/phones/compare` | A slug that does not exist. | Either | `?ids=samsung-galaxy-s24,apple-iphone-17` | 404. "Could not find at least two of those phones". | | |

## Price trend

| ID | Endpoint or command | What it tests | AI | Input | Expected result | Actual result | Pass |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T55 | `GET /api/phones/:slug/price-trend` | A price that went down. | Either | `/api/phones/samsung-galaxy-s24/price-trend` | 200. `history` has five entries, oldest first: 749, 729, 719, 699, 689. The latest price is 689 on 1 October 2026, and the oldest price in the 90 days before it is 719 on 1 August 2026. 689 is 4.2 percent lower, so `trend` is "falling" and `suggestion` is "Price has been falling. Waiting a little could save you money." | | |
| T56 | `GET /api/phones/:slug/price-trend` | A price that went up. | Either | `/api/phones/vivo-v30/price-trend` | 200. `history` ends 399, 399, 409. 409 is 2.5 percent above 399 on 1 August 2026, so `trend` is "rising" and `suggestion` is "Price has been rising. Buying soon may cost less than waiting." | | |
| T57 | `GET /api/phones/:slug/price-trend` | A price that held. | Either | `/api/phones/apple-iphone-15/price-trend` | 200. The latest price, 699, equals the price on 1 August 2026, so `trend` is "stable" and `suggestion` is "Price has been steady. Now is as good a time to buy as any." | | |
| T58 | `GET /api/phones/:slug/price-trend` | One price check only. | Either | `/api/phones/samsung-galaxy-s24-ultra/price-trend` | 200. `history` has one entry, 1199. `trend` is "stable" and `suggestion` is "Not enough price checks yet to see which way the price is moving." | | |

## Reviews

| ID | Endpoint or command | What it tests | AI | Input | Expected result | Actual result | Pass |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T59 | `POST /api/phones/:slug/reviews` | A logged in user posts a review. | Either | `/api/phones/samsung-galaxy-s24/reviews` with `<token>` and `{ "rating": 5, "text": "Bright screen and a strong camera." }` | 201. `review` has `author` "Test User", `rating` 5, the same `text` and `sentiment` "positive". | | |
| T60 | `POST /api/phones/:slug/reviews` | One review per person per phone. | Either | The same request as T59. | 409. "You have already reviewed this phone". | | |
| T61 | `POST /api/phones/:slug/reviews` | Posting needs login. | Either | The body of T59 with no header. | 401. "Please log in". | | |
| T62 | `POST /api/phones/:slug/reviews` | A rating outside 1 to 5. | Either | `/api/phones/oneplus-12/reviews` with `<token>` and `{ "rating": 7, "text": "Great phone overall." }` | 400. "Choose a rating from 1 to 5". | | |
| T63 | `GET /api/phones/:slug/reviews` | The list of reviews after T59. | Either | `/api/phones/samsung-galaxy-s24/reviews` | 200. `count` 1 and `average` 5. `items` holds one review with `author` "Test User", `rating` 5 and `sentiment` "positive". | | |
| T64 | `GET /api/phones/:slug/review-summary` | The star based summary. | Empty | `/api/phones/samsung-galaxy-s24/review-summary` | 200. `summary` is "1 review with an average of 5.0 out of 5." and `sentiment` is "positive". | | |
| T65 | `GET /api/phones/:slug/review-summary` | The model writes the summary and it is saved. | Filled | The same request as T64, twice | 200 both times. `summary` is one or two sentences about the bright screen and the camera, and `sentiment` is "positive". The second answer holds the same text, read from the phone. | | |

T64 runs in round one and T65 in round two. In the other order, T64 would also get the saved summary from the model, because the backend reuses it while the number of reviews stays the same.

## Search

| ID | Endpoint or command | What it tests | AI | Input | Expected result | Actual result | Pass |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T66 | `POST /api/ai/search` | A brand name is matched directly and saved to the history. | Either | `{ "query": "samsung" }` with `<token>` | 200. `source` is "direct" and `filters` is `{ "q": "samsung" }`. `items` holds the 12 Samsung phones, newest first: the Galaxy A15 5G, A25 5G, A35 5G, A55 5G, S24, S24 Ultra and S24+ from 2024, then the five from 2023. | | |
| T67 | `POST /api/ai/search` | Without the model, a sentence stays direct. | Empty | `{ "query": "phone under $400 with a great camera" }`, no token | 200. `source` is "direct", `filters` is `{ "q": "phone under $400 with a great camera" }` and `items` is empty. | | |
| T68 | `POST /api/ai/search` | A sentence goes to the model, which turns it into filters. | Filled | The same body as T67, no token | 200. `source` is "ai" and `filters` is `{ "maxPrice": 400, "minCamera": 48, "sort": "camera" }`. `items` holds 23 phones, all at 400 or less with a main camera of 48 MP or more, the biggest camera first and the lower price first on a tie: the Redmi Note 13 Pro (200 MP, 289) and the Redmi Note 13 Pro+ (200 MP, 399), then the Redmi Note 13 (108 MP, 199), the OnePlus Nord CE 3 Lite (108 MP, 229) and the OnePlus Nord N30 5G (108 MP, 249). | | |
| T69 | `POST /api/ai/search` | An empty query is refused. | Either | `{ "query": "  " }` | 400. "Type what you are looking for". | | |
| T70 | `POST /api/ai/search` | The model adds a phone we do not have. | Filled | `{ "query": "Google Pixel 8" }`, no token | 200. `source` is "ai". `items` holds one phone, the Google Pixel 8, with `slug` `google-pixel-8`, `source` "ai", one `priceHistory` entry with source "ai", a summary in `aiSummary` and an empty `imageUrl`. | | |
| T71 | `POST /api/ai/search` | The added phone is found directly next time. | Filled | The same body as T70 | 200. `source` is "direct", and `items` holds the same phone as T70. `GET /api/phones?q=pixel` shows `total` 1, so no second copy was saved. | | |

## Assistant

| ID | Endpoint or command | What it tests | AI | Input | Expected result | Actual result | Pass |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T72 | `POST /api/ai/chat` | Without the model the assistant says so. | Empty | `{ "messages": [{ "role": "user", "content": "Which phone has the longest battery?" }] }` | 503. "The AI features are not set up yet". | | |
| T73 | `POST /api/ai/chat` | The model answers from our data. | Filled | The same body as T72 | 200. `reply` is plain text of at most four sentences that names up to three of the four phones with the biggest battery in our data, 5500 mAh: the OnePlus 12R, the OnePlus Nord 4, the OnePlus Nord CE 4 and the Vivo V40. `phones` holds the phones the reply names, in the order it names them, at most three, all from the phones the model was given. | | |
| T74 | `POST /api/ai/chat` | No question, no answer. | Either | `{ "messages": [] }` | 400. "Send a question to the assistant". | | |
| T75 | `POST /api/ai/chat` | The last message must be from the user. | Either | `{ "messages": [{ "role": "assistant", "content": "Hello" }] }` | 400. "Send a question to the assistant". | | |

## Recommendations

| ID | Endpoint or command | What it tests | AI | Input | Expected result | Actual result | Pass |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T76 | `POST /api/ai/recommend` | Our own rules pick and explain three phones. | Empty | `{ "budget": 400, "brand": "any", "purpose": "photos", "performance": "balanced", "camera": true, "gaming": false, "battery": false }` with `<token>` | 200. `widened` is false. `items` in order: the Redmi Note 13 Pro with "Guide price $289, with a 200 MP main camera.", the Redmi Note 13 Pro+ with "Guide price $399, with a 200 MP main camera." and the OnePlus Nord CE 3 Lite with "Guide price $229, with a 108 MP main camera." | | |
| T77 | `POST /api/ai/recommend` | A small budget is raised by 15 percent. | Empty | `{ "budget": 130, "brand": "any", "purpose": "everyday", "performance": "basic", "camera": false, "gaming": false, "battery": false }`, no token | 200. `widened` is true, because only two phones cost 130 or less and the budget rose to 150. `items` in order: the Galaxy A05s with "Guide price $139, with a 50 MP main camera and a 5000 mAh battery.", then the Redmi 13C at 119 and the Vivo Y17s at 129 with the same kind of reason. | | |
| T78 | `POST /api/ai/recommend` | A budget outside the range. | Either | `{ "budget": 20 }` | 400. "Enter a budget between 50 and 5000 US dollars". | | |
| T79 | `POST /api/ai/recommend` | The model ranks the shortlist and writes the reasons. | Filled | The same body as T76, no token | 200. `widened` is false. `items` holds three phones from our shortlist of six (Redmi Note 13 Pro, Redmi Note 13 Pro+, OnePlus Nord CE 3 Lite, OnePlus Nord N30 5G, Redmi Note 13, Poco X6 Pro), each with a reason of one or two sentences written by the model. | | |

## Favourites and the dashboard

| ID | Endpoint or command | What it tests | AI | Input | Expected result | Actual result | Pass |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T80 | `POST /api/users/me/favourites/:slug` | A phone is saved to the favourites. | Either | `/api/users/me/favourites/samsung-galaxy-s24` with `<token>` | 200. `favourites` holds one phone, the Galaxy S24. | | |
| T81 | `GET /api/phones/:slug` | The detail knows the favourite and records the visit. | Either | `/api/phones/samsung-galaxy-s24` with `<token>` | 200. `isFavourite` is true. | | |
| T82 | `POST /api/users/me/favourites/:slug` | A slug that does not exist. | Either | `/api/users/me/favourites/apple-iphone-17` with `<token>` | 404. "Phone not found". | | |
| T83 | `GET /api/users/me/dashboard` | The four lists after the cases above. | Either | `<token>` | 200. `recentlyViewed` holds the Galaxy S24 from T81. `favourites` holds the Galaxy S24. `searchHistory` holds one entry with `query` "samsung" and `filters` `{ "q": "samsung" }` from T66. `recommendations` holds the three picks of T76 with their reasons. | | |
| T84 | `DELETE /api/users/me/favourites/:slug` | A favourite is removed. | Either | `/api/users/me/favourites/samsung-galaxy-s24` with `<token>` | 200. `favourites` is empty. | | |
| T85 | `GET /api/users/me/dashboard` | The dashboard needs login. | Either | No header. | 401. "Please log in". | | |

## Profile

These cases use `<token B>`, the second account from T27, so Test User and the reviews of round two stay as they are.

| ID | Endpoint or command | What it tests | AI | Input | Expected result | Actual result | Pass |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T86 | `POST /api/ai/search`, then `GET /api/phones/:slug` | Some history for the second account. | Either | `{ "query": "samsung" }` with `<token B>`, then `/api/phones/oneplus-12` with `<token B>` | 200 both times. | | |
| T87 | `GET /api/users/me/profile` | The profile and its counts. | Either | `<token B>` | 200. `user` holds `_id`, `name` "Profile Check", `email` "profile.check@example.com", `emailVerified` true, `emailVerifiedAt` and `createdAt` from today, and `passwordChangedAt` null. `counts` is `{ "favourites": 0, "recentlyViewed": 1, "searchHistory": 1, "reviews": 0 }`. | | |
| T88 | `PATCH /api/users/me/profile` | A name must have 2 to 60 characters. | Either | `{ "name": "A" }` with `<token B>` | 400. "Enter a name between 2 and 60 characters". | | |
| T89 | `PATCH /api/users/me/profile` | The email cannot change. | Either | `{ "name": "Profile Check", "email": "someone.else@example.com" }` with `<token B>` | 400. "Your email cannot be changed". | | |
| T90 | `PATCH /api/users/me/profile` | The name changes. | Either | `{ "name": "Profile Renamed" }` with `<token B>` | 200. `user` has `name` "Profile Renamed" and the same email. | | |
| T91 | `PATCH /api/users/me/password` | Both passwords are needed. | Either | `{ "currentPassword": "profilepass1" }` with `<token B>` | 400. "Enter your current password and a new password". | | |
| T92 | `PATCH /api/users/me/password` | A short new password is refused. | Either | `{ "currentPassword": "profilepass1", "newPassword": "short" }` with `<token B>` | 400. "Password must be at least 8 characters". | | |
| T93 | `PATCH /api/users/me/password` | A new password over 72 bytes is refused. | Either | `{ "currentPassword": "profilepass1", "newPassword": "<the letter a written 73 times>" }` with `<token B>` | 400. "Keep your password under 72 characters". | | |
| T94 | `PATCH /api/users/me/password` | The new password must be new. | Either | `{ "currentPassword": "profilepass1", "newPassword": "profilepass1" }` with `<token B>` | 400. "Your new password must be different from your current password". | | |
| T95 | `PATCH /api/users/me/password` | A wrong current password keeps the login. | Either | `{ "currentPassword": "wrongpass1", "newPassword": "profilepass2" }` with `<token B>` | 400, not 401. "Your current password is not right". `GET /api/auth/me` with `<token B>` still answers 200. | | |
| T96 | `PATCH /api/users/me/password` | The password changes and other logins end. | Either | `{ "currentPassword": "profilepass1", "newPassword": "profilepass2" }` with `<token B>` | 200 with a new `token` and `user`. `GET /api/auth/me` with the old `<token B>` answers 401, and with the new token 200. The profile shows `passwordChangedAt` from today. The new token is `<token B>` from now on. | | |
| T97 | `POST /api/users/me/sign-out-others` | Logging out the other devices. | Either | `<token B>` | 200 with a new `token` and `user`. The old `<token B>` answers 401 on `GET /api/auth/me`. The new token is `<token B>` from now on. | | |
| T98 | `DELETE /api/users/me/search-history` | The search history is emptied. | Either | `<token B>` | 200. `data` is `{ "cleared": true }`. The profile shows `searchHistory` 0. | | |
| T99 | `DELETE /api/users/me/recently-viewed` | The recently viewed list is emptied. | Either | `<token B>` | 200. `data` is `{ "cleared": true }`. The profile shows `recentlyViewed` 0. | | |
| T100 | `DELETE /api/users/me` | Deleting needs the password. | Either | `<token B>`, no body | 400. "Enter your password to delete your account". | | |
| T101 | `DELETE /api/users/me` | A wrong password deletes nothing. | Either | `{ "password": "profilepass1" }` with `<token B>` | 400. "Your password is not right". | | |
| T102 | `DELETE /api/users/me` | The account is deleted. | Either | `{ "password": "profilepass2" }` with `<token B>` | 200. `data` is `{ "deleted": true }`. `GET /api/auth/me` with `<token B>` answers 401, and a login as profile.check@example.com answers 401. | | |
| T103 | `PATCH /api/users/me/password` | One address can send ten requests in 15 minutes to the password, sign out and delete routes together. | Either | `<token>` and an empty body, within 15 minutes of T91 | 429. "Too many tries. Try again in 15 minutes." T91 to T102 already sent ten requests to those three routes. | | |

## Rate limit

| ID | Endpoint or command | What it tests | AI | Input | Expected result | Actual result | Pass |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T104 | `POST /api/ai/search` | One address can send 20 AI requests a minute. | Either | `{ "query": "samsung" }` 21 times within one minute, with no other AI request in that minute | The first 20 answer 200. The 21st answers 429 with "Too many questions at once. Wait a minute and try again." | | |

T104 runs last in round one, because it blocks the AI routes for a minute. Starting the backend again for round two clears the counter.

## Changed settings

Round three. Each case needs the backend started with one line of `server/.env` changed. We change that line, start the backend, send the request, put the line back and start the backend again. Every case sends the same register body, called the settings body: `{ "name": "Settings Check", "email": "settings.check@example.com", "password": "settings123", "turnstileToken": "XXXX.DUMMY.TOKEN.XXXX" }`.

| ID | Endpoint or command | What it tests | AI | Input | Expected result | Actual result | Pass |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T105 | `POST /api/auth/register` | Cloudflare refuses the token. | Either | `TURNSTILE_SECRET_KEY=2x0000000000000000000000000000000AA`, Cloudflare's test secret that always fails, and the settings body | 400. "The security check failed. Tick it again." The backend window prints "The security check failed:" with the error code `invalid-input-response`. | | |
| T106 | `POST /api/auth/register` | The security check is not set up. | Either | `TURNSTILE_SECRET_KEY=` with nothing after it, and the settings body | 503. "The security check is not set up yet". | | |
| T107 | `POST /api/auth/register` | Cloudflare cannot be reached. | Either | The usual lines, the laptop disconnected from the internet, and the settings body | 502. "Could not reach the security check. Try again in a moment." The backend window prints "Could not reach the security check:" with the reason. | | |
| T108 | `POST /api/auth/register` | In production a code needs the mail settings. | Either | `NODE_ENV=production` added, `RESEND_API_KEY` empty, and the settings body | 503. "Email is not set up yet, so we cannot send the code." No code is printed, and `POST /api/auth/resend-code` for that email answers 400, because the sign up was removed. | | |
| T109 | `POST /api/auth/register` | Resend refuses the email. | Either | `RESEND_API_KEY=re_not_a_real_key`, and the settings body | 502. "We could not send the code. Try again in a moment." The backend window prints "Resend could not send to settings.check@example.com:" with Resend's reason, and the sign up is removed. | | |

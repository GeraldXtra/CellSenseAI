# The backend

This document explains the CellSense AI backend for someone who has only written small Express apps. It maps the folders, says what each file does, follows one request from the moment it arrives to the moment the answer leaves, and describes every setting, the models, the services, the nightly price check and the scripts. Gerald builds and runs the backend. Every endpoint, with its exact replies and error messages, is in [API.md](API.md), and every field of the four models is in [DATA-MODEL.md](DATA-MODEL.md).

## The folders in server/

```
server/
  src/
    index.js        builds the app and starts the server
    config/         env.js reads the settings, db.js connects to MongoDB Atlas
    models/         one Mongoose model per collection
    routes/         one router per URL group
    controllers/    the function that runs for each route
    services/       the work behind the controllers
    middleware/     code that runs before a controller, or after an error
    jobs/           the nightly price check
    utils/          small helpers
  scripts/          seed.js and runPriceUpdate.js, run by hand
  data/             phones.json, prices.json and a README
  .env.example      every setting but NODE_ENV, most of them empty
  package.json      the packages and the scripts
```

A route file only maps a method and a path to middleware and a controller function, for example `phonesRoutes.get("/:slug", optionalAuth, getPhone)`. A controller reads the request, calls a model or a service, and sends the answer. A service holds work that more than one controller needs, or work that is easier to read on its own.

## What each file does

| File | What it does |
| --- | --- |
| `src/index.js` | Builds the Express app. Adds helmet, cors for `CLIENT_ORIGIN`, the JSON parser with a 1 MB limit, morgan, and the limit of 300 requests every 15 minutes on `/api`. Answers `GET /api/health`. Mounts the routers on `/api/auth`, `/api/phones`, `/api/ai` and `/api/users`, then `notFound` and `errorHandler`. Waits for the database, starts the nightly price check and listens on `PORT`. |
| `src/config/env.js` | Reads every setting from `server/.env` once with dotenv, fills in the defaults and exports a frozen `env` object. No other file reads `process.env`. |
| `src/config/db.js` | Connects Mongoose to `MONGODB_URI` as soon as the server loads the file. It prints "MongoDB connected:" with the database name, or "MongoDB connection failed:" with the reason, and the server keeps running either way. Its `connectDB` function prints a warning when `MONGODB_URI` is empty. |
| `src/models/Phone.js` | The phones collection, with a unique slug and an index on the brand and one on the current price. |
| `src/models/User.js` | The users collection. It leaves `passwordHash` out of every query unless the code asks for it, and `toSafeJSON` returns only `_id`, `name`, `email` and `role`. |
| `src/models/Review.js` | The reviews collection, with an index on the phone and a unique index on the phone and the user together. |
| `src/models/SearchLog.js` | The searchlogs collection. |
| `src/routes/auth.routes.js` | `POST /register`, `POST /login`, `GET /me` behind `requireAuth`, `POST /forgot-password` behind its own limit of 5 requests every 15 minutes, and `POST /reset-password`. |
| `src/routes/phones.routes.js` | The seven phone routes. `/compare` sits above `/:slug`, so the word compare is never read as a slug. The detail runs `optionalAuth` and posting a review runs `requireAuth`. |
| `src/routes/ai.routes.js` | The limit of 20 requests every minute for the whole router, `POST /search` and `POST /recommend` behind `optionalAuth`, and `POST /chat`. |
| `src/routes/users.routes.js` | `requireAuth` for the whole router, then `GET /me/dashboard`, `POST /me/favourites/:slug` and `DELETE /me/favourites/:slug`. |
| `src/controllers/auth.controller.js` | Register, login, me, forgot password and reset password. |
| `src/controllers/phones.controller.js` | The list, comparison with the best value in each row, the detail with the recently viewed record and the summary written once, the price trend, the list of reviews, posting a review with its mood, and the review summary. |
| `src/controllers/ai.controller.js` | Search with the direct match, the sentence rule, the model step, the lookup of a phone we do not have, the search log and the search history. Chat with the related phones. Recommend with the shortlist, the ranking and the save to the dashboard. |
| `src/controllers/users.controller.js` | The dashboard, adding a favourite and removing one. |
| `src/services/phoneQuery.js` | Turns filters into one MongoDB query. Shared by the phone list and search. |
| `src/services/price.service.js` | Works out the price trend and the best time to buy note. |
| `src/services/review.service.js` | The review mood from the stars and the star based summary. |
| `src/services/recommend.service.js` | Reads the needs, builds and scores the shortlist, and writes the reasons from our rules. |
| `src/services/ai.service.js` | The one file that calls the model. |
| `src/services/mail.service.js` | Sends the password reset email with Nodemailer. |
| `src/middleware/auth.js` | `requireAuth` and `optionalAuth`, which read the login token. |
| `src/middleware/error.js` | `notFound` answers paths with no route. `errorHandler` turns every thrown error into the envelope. |
| `src/middleware/validate.js` | Exports an empty `validate` function that no route uses. Each controller checks its own input. |
| `src/jobs/priceUpdater.js` | `runPriceUpdate` records the prices from `data/prices.json`, and `startPriceUpdater` schedules it every night. |
| `src/utils/http.js` | `ok` sends the success envelope. `httpError` makes an error that carries a status code. |
| `src/utils/jwt.js` | `signToken` and `verifyToken`, both with `JWT_SECRET`. |
| `src/utils/password.js` | `hashPassword` and `checkPassword` with bcrypt at 10 rounds. `makeResetToken` makes a random reset token and `hashResetToken` hashes it with `sha256`. |
| `src/utils/slug.js` | `Slugify` turns "Samsung Galaxy S24+" into `samsung-galaxy-s24-plus`. |
| `scripts/seed.js` | `npm run seed`: loads `data/phones.json` into the database. |
| `scripts/runPriceUpdate.js` | `npm run prices`: runs the price check once. |
| `data/phones.json` | The 60 phones the seed loads. |
| `data/prices.json` | The price list the price check reads. |
| `data/README.md` | One line on what `phones.json` is. |

## How a request travels

Take `GET /api/phones/samsung-galaxy-s24`, sent by the Phone detail page of a logged in user. This is what happens, in order.

1. `helmet()` in `src/index.js` adds safe HTTP headers to the answer.
2. `cors()` adds the header that lets the origin in `CLIENT_ORIGIN` read the answer from a browser. No other origin may.
3. `express.json({ limit: "1mb" })` turns a JSON body into `req.body`. A GET has no body, so nothing happens here.
4. `morgan("dev")` prints one line per request to the terminal with the method, the path, the status and the time it took.
5. The limit on `/api` counts the request. Past 300 in 15 minutes from one address it answers 429.
6. `GET /api/health` is checked first. It does not match.
7. The routers are checked in order: `/api/auth`, `/api/phones`, `/api/ai`, `/api/users`. The path starts with `/api/phones`, so `phones.routes.js` takes over. Inside it, `/` and `/compare` do not match, and `GET /:slug` matches with `slug` set to `samsung-galaxy-s24`.
8. `optionalAuth` in `middleware/auth.js` reads the `Authorization: Bearer <token>` header, verifies the token with `JWT_SECRET`, loads the user from the database and puts it on `req.user`. Without a valid token `req.user` is empty and the request goes on as a visitor.
9. `getPhone` in `phones.controller.js` runs. It asks the `Phone` model for the document with that slug and throws `httpError(404, "Phone not found")` when there is none. When the phone has no summary and the AI settings are filled, it asks `ai.service.js` to write one and stores it. It moves the phone to the top of the user's `recentlyViewed` and works out `isFavourite`.
10. The controller answers through `ok` in `utils/http.js`, which sends `{ ok: true, data: { phone, isFavourite } }` with status 200.
11. If anything throws along the way, Express 5 passes the error to `errorHandler` in `middleware/error.js`, also when it comes from an async function. `errorHandler` answers `{ ok: false, error: { message } }` with the status on the error, or 500. A value that Mongoose refuses gets 400, and a duplicate value in a unique field gets 409 with "That value is already taken". Every answer of 500 or more is printed to the terminal, and in production its message is replaced with "Something went wrong on the server."
12. If no route matches at all, `notFound` answers 404 with "No route for", the method and the path, in the same envelope. Under `/api/users`, `requireAuth` runs for every path first, so a request there without a valid token gets 401 even when the path does not exist.

A route that needs login runs `requireAuth` in place of `optionalAuth`. For `POST /api/phones/samsung-galaxy-s24/reviews`, `requireAuth` throws `httpError(401, "Please log in")` when the token is missing, fake or expired, or when its account no longer exists, and the controller never runs.

The client never sees anything but the envelope. `client/src/services/api.js` returns `data` on success and throws an error with `error.message` on failure.

## Starting the server

`npm run dev` runs `nodemon src/index.js`, which restarts the server each time a file changes. `npm start` runs `node src/index.js`. When the server starts, `db.js` connects to MongoDB, `index.js` builds the app, starts the nightly price check and listens. With a working database the terminal shows:

```
MongoDB connected: <the database name>
Nightly price check scheduled: 0 2 * * *
CellSense API running on http://localhost:5000
```

## The settings

`src/config/env.js` reads these once. `server/.env.example` lists all of them except `NODE_ENV`. Only `PORT`, `JWT_EXPIRES_IN`, `CLIENT_ORIGIN` and `PRICE_UPDATER_CRON` have values there; the rest are empty. The full file with the values we use is in [INSTALLATION.md](INSTALLATION.md).

| Setting | Default in `env.js` | What it is for | What happens when it is empty |
| --- | --- | --- | --- |
| `PORT` | `5000` | The port the server listens on. | The default is used. The client proxy expects 5000. |
| `NODE_ENV` | `development` | Development or production. Not in `.env.example`. | Development: an answer of 500 or more shows the real message, and with no mail settings the reset link is printed in the terminal. In production those answers say "Something went wrong on the server." and a missing mail setup is printed as an error without the link. |
| `MONGODB_URI` | empty | The MongoDB Atlas connection string. | The server starts and prints a warning. The health check works, and every route that touches the database waits about ten seconds and answers 500. `npm run seed` and `npm run prices` stop with a message, and the nightly price check fails when it runs. |
| `JWT_SECRET` | empty | Signs and verifies the login tokens. | Register saves the account and then answers 500, because no token can be signed. Login with the right password answers 500 for the same reason. Every route that needs login answers 401, and the optional routes run as for a visitor. |
| `JWT_EXPIRES_IN` | `7d` | How long a token lasts. | The default is used: seven days. |
| `CLIENT_ORIGIN` | `http://localhost:5174` | The one origin CORS allows. `.env.example` sets `http://localhost:5173`, the client's port. | The default 5174 is not the client's port. Through the Vite proxy nothing changes, because the browser calls the client's own address. A client that calls the backend address directly gets a CORS error on every call. |
| `AI_BASE_URL` | empty | The base address of the OpenAI compatible chat endpoint. The service adds `/chat/completions`. We use Groq at `https://api.groq.com/openai/v1`. | When any of the three AI settings is empty the model is never called. Search stays direct, chat answers 503 with "The AI features are not set up yet", recommendations use the reasons from our rules, phone summaries are not written, review moods come from the stars, and review summaries are star based unless the model saved one earlier for the same number of reviews. |
| `AI_API_KEY` | empty | The provider key, sent as `Authorization: Bearer <key>`. | As for `AI_BASE_URL`. |
| `AI_MODEL` | empty | The model name. We use `openai/gpt-oss-120b`. | As for `AI_BASE_URL`. |
| `PRICE_UPDATER_CRON` | `0 2 * * *` | When the nightly price check runs, in Lagos time. | The default is used: 02:00 every day. A value that is not a valid schedule turns the job off with a warning. |
| `MAIL_HOST` | empty | The SMTP host for the password reset email. | When `MAIL_HOST`, `MAIL_USER` or `MAIL_PASS` is empty, no email is sent. Outside production the reset link is printed in the server terminal. |
| `MAIL_PORT` | `587` | The SMTP port. Port 465 uses a secure connection from the start. | The default is used. |
| `MAIL_USER` | empty | The SMTP user name. | As for `MAIL_HOST`. |
| `MAIL_PASS` | empty | The SMTP password. | As for `MAIL_HOST`. |
| `MAIL_FROM` | empty | The sender address of the email. | `MAIL_USER` is used as the sender. |
| `CLIENT_URL` | `http://localhost:5174` | The site address at the start of the reset link. | The default 5174 is not the client's port, so the link would open the wrong address. We always set it, to `http://localhost:5173` in development. |

## The models

The backend stores four collections in MongoDB Atlas through Mongoose. All four add `createdAt` and `updatedAt` by themselves.

| Model | Collection | What it holds |
| --- | --- | --- |
| `Phone` | phones | One document per phone: the slug, brand, model, picture path, category, release year, specs, current price with the date it was checked, the price history, the summary written by the model, the saved review summary and the source (`seed`, `ai` or `admin`). |
| `User` | users | One document per account: name, email, the bcrypt hash of the password, role, favourites, recently viewed phones, search history, the last recommendations and a pending password reset. |
| `Review` | reviews | One document per review: the phone, the user, the author name, the rating, the text and the mood. One review per user per phone. |
| `SearchLog` | searchlogs | One document per search: the query, the filters, whether it was answered directly or by the model, the number of phones found and the user when logged in. |

## The services

`phoneQuery.js` has four functions. `buildPhoneFilter` turns the brand list, the category, 5G, the minimums, the price range and the words of `q` into one MongoDB filter. `buildSort` picks one of the five sort orders, newest by default. `buildPage` works out the page, the limit (24 by default, 50 at most) and how many phones to skip. `escapeRegex` makes typed words safe to use in a database pattern.

`price.service.js` has `priceTrend`. It sorts the price history oldest first, compares the latest price with the oldest one in the 90 days before it, or with the check just before it when there is no other check in those 90 days, and calls a change of two percent or more `falling` or `rising` and anything else `stable`. It returns the history, the trend and a one line suggestion. This is a calculation over stored prices, not a forecast model.

`review.service.js` has `sentimentFromRating`, which gives positive for 4 or 5 stars, neutral for 3 and negative for 1 or 2, and `summaryFromRatings`, which writes the star based summary line.

`recommend.service.js` has four functions. `readNeeds` checks the budget, fills in the defaults and answers 400 for a bad budget. `buildShortlist` takes the phones within the budget and the brand, raises the budget by 15 percent when fewer than three fit, scores the phones on camera, battery, speed and newness with weights from the needs, and keeps the best six. `describeNeeds` writes the needs as text for the model. `ruleReason` writes our own reason, such as "Guide price $289, with a 200 MP main camera."

`ai.service.js` is the only file that talks to the model. The AI features of CellSense AI integrate a pre trained language model through an OpenAI compatible chat API. We do not train or build a model.

| Function | What it does |
| --- | --- |
| `isAIConfigured()` | Says whether all three AI settings are filled. Search, recommend, the phone summary, the review mood and the review summary ask this first and fall back to our own rules. Chat does not ask: it goes straight to `askModel`, which answers 503. |
| `askModel(messages, options)` | Sends the messages to `<AI_BASE_URL>/chat/completions` with the key and the model name, waits at most 20 seconds and returns the text of the reply. It throws 503 when the AI settings are empty, and 502 when the model cannot be reached, answers with an error or sends a reply that is not JSON. |
| `readJson(text)` | Takes the JSON object out of a reply, also when the model put other words around it. |
| `parseSearchQuery(query)` | Sends our search rules and the person's words, and keeps only the filter keys we know. |
| `lookUpPhone(name)` | Asks the model for a phone we do not have, and keeps each spec only when it falls in a sensible range. |
| `answerChat(messages, phones)` | Sends our assistant rules, one line of data per phone and the conversation, and returns the reply. |
| `rankShortlist(phones, needsText)` | Sends the needs and the shortlist, and returns the picks with a reason each. |
| `writePhoneSummary(phone)` | Writes one or two sentences about who a phone suits. |
| `summariseReviews(reviews)` | Writes one or two sentences about what buyers say, with the overall mood. |
| `judgeSentiment(text)` | Answers positive, neutral or negative for one review. |

Each call gives the model only the text we choose to send. The model never reads the database itself.

`mail.service.js` has `sendPasswordResetEmail`. With `MAIL_HOST`, `MAIL_USER` and `MAIL_PASS` set it sends the email through Nodemailer, from `MAIL_FROM` or else `MAIL_USER`, with the subject "Reset your CellSense AI password" and the link that works for one hour. Without them it prints the link in the terminal outside production, and an error line in production.

## How login works

We keep no sessions on the server. A logged in user carries a token.

1. Register. `POST /api/auth/register` checks that the name, the email and the password are there, that the email looks like an email and that the password has at least 8 characters. It answers 409 when the email already has an account. Then it hashes the password with bcrypt, stores the user with `passwordHash`, signs a token and answers `{ token, user }` with status 201.
2. Log in. `POST /api/auth/login` finds the user by email and checks the password against the hash. A wrong email and a wrong password get the same 401 message, "Wrong email or password". A match gets a fresh token.
3. The token carries the user id and the role and expires after `JWT_EXPIRES_IN`, seven days. `requireAuth` reads it from the `Authorization` header, verifies it, loads the user and puts it on `req.user`, or answers 401 with "Please log in". `optionalAuth` does the same but never answers 401.
4. `GET /api/auth/me` returns the user for the token. The client calls it once when the site opens with a saved token, so a person stays logged in after a reload.
5. Forgot password. `POST /api/auth/forgot-password` answers `{ sent: true }` for every valid email, whether or not it has an account. When the email has an account, the controller makes a random token, stores its `sha256` hash with an expiry one hour ahead in `passwordReset` on the user, and hands the link `<CLIENT_URL>/reset-password/<token>` to `mail.service.js`.
6. Reset password. `POST /api/auth/reset-password` hashes the token it receives, finds the user with that hash and an expiry still in the future, stores the new bcrypt hash and removes `passwordReset`, so the link works once.

## The nightly price check

`src/jobs/priceUpdater.js` has two functions.

`startPriceUpdater` runs when the server starts. It checks `PRICE_UPDATER_CRON` with `node-cron`. A valid value schedules `runPriceUpdate` in the Africa/Lagos time zone and prints "Nightly price check scheduled:" with the schedule. The default `0 2 * * *` means 02:00 every day. A value that is not a valid schedule prints a warning and the job stays off. A failed run prints "Price check failed:" with the reason.

`runPriceUpdate` reads the price list in `server/data/prices.json`. The list holds a `checkedOn` date and a price in US dollars for each slug:

```json
{
  "checkedOn": "2026-10-01",
  "prices": {
    "samsung-galaxy-s24": 689,
    "apple-iphone-15": 699,
    "oneplus-12": 679,
    "xiaomi-redmi-note-13-pro": 289,
    "vivo-v30": 409,
    "samsung-galaxy-a15-5g": 199
  }
}
```

A missing or unreadable `checkedOn` stops the run with `prices.json needs a checkedOn date such as 2026-10-01`. For each phone in the database whose slug is on the list, the run does the following.

1. A price that is not a number above zero is skipped.
2. A phone whose `price.updatedAt` is already on or after `checkedOn` is skipped. Running the same list twice therefore changes nothing the second time.
3. Otherwise the run sets `price.current` to the new price and `price.updatedAt` to `checkedOn`, and appends `{ price, date: checkedOn, source: "manual" }` to `priceHistory`. A new price counts as changed. The same price counts as unchanged, and the check is still recorded in the history.

Slugs that are not in the database are printed as "Not in the database, skipped:" with the slugs. At the end the run prints a line such as `Price check for 2026-10-01: 4 changed, 2 unchanged, 0 skipped`. To record new prices, Gerald writes the new date and prices into `prices.json`. The next nightly run, or `npm run prices`, records them.

## The scripts

Both scripts connect with the same `MONGODB_URI` as the server and write to the database it points to. Only Gerald runs them.

`npm run seed` runs `scripts/seed.js`. It reads `data/phones.json`, and without a database connection it stops with "Seed stopped: no database connection. Check MONGODB_URI in server/.env." For each phone in the file it builds the slug from the brand and the model with `utils/slug.js`, then:

1. When no phone has that slug, it inserts the phone with `source` set to `seed`, `price.current` from the file in USD, `price.updatedAt` set to the date of the last price check in the file, and every price check from the file in `priceHistory` with source `seed`.
2. When the phone exists, it refreshes the brand, the model, the category, the release year and the specs, and the image path and the summary when the file has them. It never changes the price, the price history or the source of a phone that is already there.

It never removes a phone. At the end it prints a line such as `Seed: 60 phones added, 0 updated`. The seed is safe to run again, because it only adds phones and refreshes their descriptions.

`npm run prices` runs `scripts/runPriceUpdate.js`, which runs `runPriceUpdate` once by hand. Without a database connection it stops with "Price check stopped: no database connection. Check MONGODB_URI in server/.env." When the run fails it prints "Price check failed:" with the reason and ends with exit code 1.

## The phone file

`data/phones.json` is a JSON array of 60 phones, 12 each for Samsung, Apple, OnePlus, Xiaomi and Vivo. Each entry has `brand`, `model`, `category`, `releaseYear`, `imageUrl`, `specs`, `price`, `priceHistory` and `aiSummary`. Every `imageUrl` is `/phones/<slug>.png`, the address of the phone's picture file in `client/public/phones/`. When that file is missing, the site shows a grey placeholder with the phone name. Six phones carry four monthly price checks from 1 June to 1 September 2026: the Galaxy S24, the Galaxy A15 5G, the iPhone 15, the OnePlus 12, the Redmi Note 13 Pro and the Vivo V30. The other 54 carry one check dated 1 October 2026. Only the Galaxy S24's `aiSummary` is filled in the file, and the other 59 are empty. The model writes those the first time each phone page opens with the AI settings filled.

## The rate limits

Three limits protect the backend. All come from `express-rate-limit` and count the requests from one address.

| Limit | Where | What the person sees past it |
| --- | --- | --- |
| 300 requests every 15 minutes | Every path under `/api`, set in `src/index.js` | 429 with "Too many requests. Try again in a few minutes." |
| 20 requests every minute | Every path under `/api/ai`, set in `src/routes/ai.routes.js` | 429 with "Too many questions at once. Wait a minute and try again." |
| 5 requests every 15 minutes | `POST /api/auth/forgot-password`, set in `src/routes/auth.routes.js` | 429 with "Too many reset requests. Try again in 15 minutes." |

An AI request and a reset request also count toward the 300. The AI limit is lower because one AI request can call the model, which takes time and costs money. The counters live in memory, so they start again when the server restarts.

## The security choices

1. `helmet` sets safe HTTP headers on every answer.
2. `cors` is limited to the client origin, so other sites cannot read the API from a browser.
3. The three rate limits above cap what one address can send.
4. Passwords are stored only as bcrypt hashes. The hash is left out of every query unless the login code asks for it, and no reply holds it.
5. Log in gives the same answer for an unknown email and a wrong password, and forgot password gives the same answer whether or not the email has an account.
6. A reset token is stored only as a `sha256` hash, works once and expires after one hour. A new request replaces the old token.
7. Tokens expire after seven days. A route that needs login checks the token and loads the user on every request, so a deleted account loses access at once.
8. Secrets live only in `server/.env`, which git ignores and the submission zip leaves out. The browser never sees the model key, because only the backend calls the model.
9. Each controller checks its input, so bad input gets a 400 with a clear message. Posting a review looks the phone up first, so an unknown slug gets its 404 before the rating and the text are checked. Typed words are escaped before they go into a database pattern, and the JSON body is limited to 1 MB.
10. The author name of a review comes from the logged in account, never from the request.
11. The model only sees the text the backend sends it, and the backend keeps only the keys and value ranges it expects from each reply.

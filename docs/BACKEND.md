# The backend

This document explains the CellSense AI backend for someone who has only written small Express apps. It says what each folder is for and what each file does today. It follows one request from the moment it arrives to the moment the answer leaves. It explains login, search, the AI service, the price trend, the seed script, the rate limits, the settings and the security choices. Gerald builds the backend. The order he builds it in is at the end, with what is done and what is next.

Today the backend starts, connects to MongoDB Atlas and answers twelve endpoints: the health check, register, login, me, the phone list, the phone detail, comparison, the price trend, the list of reviews, posting a review, the review summary and search. The rest is planned: the assistant chat, recommendations, the dashboard with favourites and recently viewed phones, password reset and the nightly price updater. The files for the planned parts exist as placeholders with one line each that says what they will do. [API.md](API.md) lists every endpoint with its status.

## The folders in server/

```
server/
  src/
    index.js        starts the app
    config/         env.js reads the settings, db.js connects to Atlas
    models/         one Mongoose model per collection
    routes/         one router per URL group
    controllers/    the function that runs for each route
    services/       the work behind the controllers
    middleware/     code that runs before or after a route
    jobs/           the nightly price updater
    utils/          small helpers
  scripts/          seed.js and runPriceUpdate.js, run by hand
  data/             phones.json, the sample phones
  .env.example      the settings with empty values
  package.json      the packages and the scripts
```

A route file only maps a method and a path to a controller function, for example `phonesRoutes.get("/:slug", getPhone)`. A controller reads the request, calls a model or a service, and sends the answer. A service holds work that more than one controller needs, or work that is easier to read on its own.

## What each file does today

Built means the file does its job now. Placeholder means the file holds one comment line and an empty function.

| File | Status | What it does now |
| --- | --- | --- |
| `src/index.js` | Built | Builds the Express app. Adds helmet, cors, the JSON parser, morgan and the rate limit on `/api`. Answers `GET /api/health`. Mounts the auth, phones and AI routers. Adds the not found answer and the error handler. Waits for the database, then listens on `PORT`. The users router is not mounted yet. |
| `src/config/env.js` | Built | Reads every setting from `server/.env` once, fills in the defaults and exports a frozen object. No other file reads `process.env`. |
| `src/config/db.js` | Built | Opens the Mongoose connection with `MONGODB_URI`. It prints "MongoDB connected" with the database name, or "MongoDB connection failed" with the reason. The server keeps running either way. It prints a warning when `MONGODB_URI` is empty. |
| `src/models/Phone.js` | Built | The phones collection, with an index on the brand and one on the current price. |
| `src/models/User.js` | Built | The users collection. It keeps the password hash out of every query unless the code asks for it, and `toSafeJSON` returns only `_id`, `name`, `email` and `role`. |
| `src/models/Review.js` | Built | The reviews collection, with an index on the phone. |
| `src/models/SearchLog.js` | Built | The searchlogs collection, with the source of each search, `direct` or `ai`. |
| `src/routes/auth.routes.js` | Built | `POST /register`, `POST /login`, and `GET /me` behind `requireAuth`. |
| `src/routes/phones.routes.js` | Built | The seven phone routes. `/compare` sits above `/:slug`, so the word compare is never read as a slug. Posting a review sits behind `requireAuth`. |
| `src/routes/ai.routes.js` | Built | The limit of 20 requests every minute, and `POST /search` behind `optionalAuth`. |
| `src/routes/users.routes.js` | Placeholder | Will hold the dashboard and the favourites. |
| `src/controllers/auth.controller.js` | Built | Register, login and me. Forgot password and reset password are planned. |
| `src/controllers/phones.controller.js` | Built | The list with filters, sorting and pages, comparison with the best value in each row, the detail, the price trend, the list of reviews, posting a review and the review summary. |
| `src/controllers/ai.controller.js` | Built | Search: the direct match, the sentence rule, the model step, the search log and the search history. Chat and recommend are planned. |
| `src/controllers/users.controller.js` | Placeholder | Will hold the dashboard and the favourites. |
| `src/services/phoneQuery.js` | Built | `buildPhoneFilter` turns the filters into one MongoDB filter. `buildSort` picks the sort order. `buildPage` works out the page, the limit and how many phones to skip. The phone list and search share it. |
| `src/services/price.service.js` | Built | `priceTrend` sorts the price history, finds the trend and picks the one line suggestion. |
| `src/services/review.service.js` | Built | `sentimentFromRating` sets the sentiment from the stars. `summaryFromRatings` writes the star based summary line. |
| `src/services/ai.service.js` | Built | The only file that calls the model. Today it turns a search sentence into filters. |
| `src/services/recommend.service.js` | Placeholder | Will build the shortlist and ask the model to rank it. |
| `src/services/mail.service.js` | Placeholder | Will send the password reset email with Nodemailer. |
| `src/middleware/auth.js` | Built | `requireAuth` and `optionalAuth`, which read the login token. |
| `src/middleware/error.js` | Built | `notFound` answers unknown paths. `errorHandler` turns every thrown error into the envelope. |
| `src/middleware/validate.js` | Placeholder | Will check bodies and queries with `zod` schemas. For now each controller checks its own input. |
| `src/jobs/priceUpdater.js` | Placeholder | Will refresh the prices every night with `node-cron`. |
| `src/utils/http.js` | Built | `ok` sends the success envelope. `httpError` makes an error that carries a status code. |
| `src/utils/jwt.js` | Built | Signs and verifies the login tokens with `JWT_SECRET`. |
| `src/utils/password.js` | Built | Hashes and checks passwords with bcrypt, 10 rounds. |
| `src/utils/slug.js` | Built | `Slugify` turns "Samsung Galaxy S24" into `samsung-galaxy-s24`. The seed script uses it. |
| `scripts/seed.js` | Built | Loads `data/phones.json` into the database. |
| `scripts/runPriceUpdate.js` | Placeholder | Will run the price updater once from the command line. |
| `data/phones.json` | Built | Six sample phones with sample prices and four price checks each. |

Every field of the four models is listed in [DATA-MODEL.md](DATA-MODEL.md).

## The life of one request

Take `GET /api/phones/samsung-galaxy-s24`, sent by the Phone detail page. This is what happens in `src/index.js`, in order.

1. `helmet()` adds safe HTTP headers to the answer before anything else runs.
2. `cors()` adds the header that says which origin may read the answer from a browser. Only the origin in `CLIENT_ORIGIN` is allowed.
3. `express.json({ limit: "1mb" })` turns a JSON body into `req.body`. A GET has no body, so nothing happens here.
4. `morgan("dev")` prints one line per request to the console, so we can see traffic while we develop.
5. The rate limit on `/api` counts the requests from this address. More than 300 in 15 minutes gets a 429 answer.
6. `GET /api/health` is checked first. It does not match.
7. The routers are checked in order: `/api/auth`, `/api/phones`, `/api/ai`. The path starts with `/api/phones`, so `phones.routes.js` takes over. Inside it, `/` and `/compare` do not match, and `GET /:slug` matches with `slug` set to `samsung-galaxy-s24`.
8. `getPhone` in `phones.controller.js` runs. It asks the `Phone` model for the document with that slug. When there is none, it throws a 404 error with "Phone not found".
9. The controller sends the answer through `ok` in `utils/http.js`: `{ ok: true, data: { phone } }` with status 200.
10. If anything throws along the way, Express 5 passes the error to `errorHandler` in `middleware/error.js`, which answers `{ ok: false, error: { message } }`. The status is the one on the error, or 500. A value that Mongoose refuses gets 400, and a value that must be unique and is already taken gets 409. A 500 is printed to the console. In production the message of a 500 is replaced with "Something went wrong on the server."
11. If no route matched at all, `notFound` in `middleware/error.js` answers 404 with "No route for", the method and the path, in the same envelope shape. That is what every planned endpoint answers today.

A route that needs login has one more step. `POST /api/phones/samsung-galaxy-s24/reviews` passes steps 1 to 7 the same way. Then `requireAuth` runs before the controller. It reads the token from the `Authorization` header, verifies it and loads the user onto `req.user`. Without a valid token it throws a 401 error with "Please log in", and the controller never runs.

The client never sees anything but the envelope. `client/src/services/api.js` returns `data` on success and throws an error with `error.message` on failure.

## How login works

We keep no sessions on the server. A logged in user carries a token.

1. Register. `POST /api/auth/register` takes a name, an email and a password. The controller checks that all three are there, that the email looks like an email and that the password has at least 8 characters. Each failed check answers 400 with its own message. An email that already has an account answers 409. Then the controller hashes the password with bcrypt through `utils/password.js`, stores the user with `passwordHash`, and signs a JWT with `utils/jwt.js`. The answer is `{ token, user }` with status 201. The email is stored in lowercase and must be unique.
2. Log in. `POST /api/auth/login` finds the user by email and checks the password against the hash. A missing field answers 400. A wrong email and a wrong password get the same 401 message, "Wrong email or password", so nobody learns which one was wrong. A match gets a fresh token. The token carries the user id and the role, and expires after `JWT_EXPIRES_IN`, which is seven days.
3. `requireAuth` in `middleware/auth.js` reads the `Authorization: Bearer <token>` header, verifies the token with `JWT_SECRET`, loads the user from the database and puts it on `req.user`. A missing, wrong or expired token gets 401, and so does a token whose account no longer exists. `GET /api/auth/me` and posting a review use it today. The dashboard and the favourites will use it.
4. `optionalAuth` does the same but never fails. When there is no valid token the route runs with no user. `POST /api/ai/search` uses it, because search works for everyone but records history for a logged in user.
5. `GET /api/auth/me` returns the user for the token. The client calls it once on load, so a person stays logged in after a page reload.
6. Password reset is planned. `POST /api/auth/forgot-password` will always answer `{ sent: true }`. When the email exists, the controller will make a random token, store its hash and an expiry one hour ahead in `passwordReset` on the user, and `mail.service.js` will send the link `<CLIENT_URL>/reset-password/<token>` with Nodemailer. `POST /api/auth/reset-password` will hash the token it receives, find the user with that hash, check the expiry, store the new bcrypt hash, clear `passwordReset` and answer `{ ok: true }`. While the mail settings are empty, the link will be printed to the console instead.

## How search works

`POST /api/ai/search` takes `{ query }`. The controller cuts the query to 200 characters and answers 400 when it is empty. Then it works in this order.

1. Direct first. The controller matches each word of the query against brand and model through `phoneQuery.js`. "samsung" finds the two Samsung phones. This step needs no model.
2. The sentence rule. When the AI settings are filled and the query reads like a sentence, the controller skips the direct match. A query reads like a sentence when it has four words or more, when it holds a dollar sign or a number of three digits or more, or when it holds a word such as under, over, with, best, cheap, budget, gaming, camera or battery. The full list is in `ai.controller.js` and in [API.md](API.md).
3. The model. For a sentence, or for a short query that the direct match found nothing for, `parseSearchQuery` in `ai.service.js` sends the words to the model and gets filters back as JSON. "phone under $400 with a great camera" becomes a highest price of 400, a main camera of 48 megapixels or more, and the camera sort.
4. The same database search. The controller runs `phoneQuery.js` again with those filters, the same code that answers `GET /api/phones`. The model never sees the database and never picks the phones. It only turns words into filters.
5. The log. Every search is written to the searchlogs collection with the query, the filters, the source (`direct` or `ai`) and the number of phones found. For a logged in user the search also goes to the top of `searchHistory` on the user, which keeps the latest 50.
6. The answer is `{ items, filters, source }`, with at most 24 phones.

Without the AI settings the controller never calls the model. Every search stays direct and the route still answers 200.

Planned: when nothing matches and the query names a real phone we do not have, the model will supply its specifications, and we will save the phone with source `ai`.

## What the AI service does

`src/services/ai.service.js` is the only file that talks to the model. The AI features of CellSense AI integrate a pre trained language model through an OpenAI compatible chat API. The address, the key and the model name are set in `server/.env` as `AI_BASE_URL`, `AI_API_KEY` and `AI_MODEL`. We do not train or build a model.

| Function | What it does today |
| --- | --- |
| `isAIConfigured()` | Says whether all three AI settings are filled. Search asks this before it calls the model. |
| `askModel(messages, options)` | Sends the chat messages to `<AI_BASE_URL>/chat/completions` with the key in the `Authorization` header and the model name in the body. It waits at most 20 seconds and returns the text of the reply. It throws 502 when the model cannot be reached, answers with an error, or sends a reply that is not JSON. It throws 503 when the AI settings are empty. |
| `readJson(text)` | Takes the JSON object out of a reply, also when the model put other words around it. It returns nothing when there is no JSON. |
| `parseSearchQuery(query)` | Sends our search rules and the person's words to the model. The rules name the filter keys we accept, say what phrases such as "long battery" mean, and give two examples. From the reply it keeps only the keys we know: brand, minPrice, maxPrice, has5G, minRam, minStorage, minCamera, minBattery, minRefresh, category, sort and keywords. Numbers must be above zero. The keywords are returned as `q`. |

The other AI features are planned and will be new functions in the same file: the chat reply for the assistant, the ranking of the recommendation shortlist with a reason for each phone, the plain English summary of a phone, the summary and sentiment of reviews from their text, and the specifications of a phone we do not have.

## The price trend and the price updater

`src/services/price.service.js` is built. `GET /api/phones/:slug/price-trend` calls it with the `priceHistory` of the phone.

1. It sorts the history, oldest first.
2. With fewer than two prices it answers `stable` with "Not enough price checks yet to see which way the price is moving."
3. It takes the latest price and looks back 90 days from its date. It compares the latest price with the oldest price inside those 90 days. When the latest price is the only one inside them, it compares with the price check just before it.
4. A latest price that is two percent lower or more is `falling`. Two percent higher or more is `rising`. Anything in between is `stable`.
5. It returns the history, the trend and one sentence about the best time to buy.

This is a calculation over stored prices, not a forecast model.

The price updater is planned. `src/jobs/priceUpdater.js` will schedule one run with `node-cron` at the time in `PRICE_UPDATER_CRON`. The default `0 2 * * *` means 02:00 every day. A run will load every phone, ask the price source for today's price, append `{ price, date, source }` to `priceHistory`, update `price.current` and `price.updatedAt`, and log how many phones changed. `npm run prices` will run the same job once by hand through `scripts/runPriceUpdate.js`. Until then the price history holds only the sample prices from the seed file.

## The seed script

`scripts/seed.js` reads `data/phones.json` and connects with the same `MONGODB_URI` as the server. Without a database connection it stops with a message. For each phone in the file it does the following.

1. It builds the slug from the brand and the model with `utils/slug.js`.
2. It turns the price checks in the file into `priceHistory` entries with source `seed`.
3. It sets `price.current` to the price in the file, the currency to USD, and `price.updatedAt` to the date of the last price check.
4. It updates the phone with that slug, or inserts it when there is none.

At the end it prints "Seeded 6 phones". It does not remove phones that are not in the file. Running it again puts the six phones back to the values in the file, so prices and price history added later would be lost. That is why we run it once on a fresh database and never on the shared one. See [INSTALLATION.md](INSTALLATION.md).

The file is a JSON array with one object per phone. It holds six phones today: Samsung Galaxy S24, Apple iPhone 15, OnePlus 12, Xiaomi Redmi Note 13 Pro, Vivo V30 and Samsung Galaxy A15 5G. Their prices and price checks are sample values.

## The rate limits

Two limits protect the backend. Both come from `express-rate-limit` and both count the requests from one address.

| Limit | Where | What the person sees past it |
| --- | --- | --- |
| 300 requests every 15 minutes | Every path under `/api`, set in `src/index.js` | 429 with "Too many requests. Try again in a few minutes." |
| 20 AI requests every minute | Every path under `/api/ai`, set in `src/routes/ai.routes.js` | 429 with "Too many questions at once. Wait a minute and try again." |

An AI request counts toward both limits. The AI limit is lower because one AI request can call the model, which takes time and costs money. The counters live in memory, so they start again when the server restarts.

## The settings and what breaks without them

`src/config/env.js` reads these once. `.env.example` lists them with empty values.

| Setting | What it is for | What happens when it is missing |
| --- | --- | --- |
| `PORT` | The port the server listens on | Defaults to 5000. The client proxy expects 5000. |
| `NODE_ENV` | Says whether this is development or production. It is not in `.env.example`. | Defaults to `development`, where a 500 answer shows the real error message. |
| `MONGODB_URI` | The Atlas connection string | The server starts and prints a warning. Every route that touches the database fails with 500 after a wait of about ten seconds. Only the health check works. The seed script stops. |
| `JWT_SECRET` | Signs and verifies the login tokens | Register saves the account but cannot sign a token, so it answers 500. Log in answers 500. Every route that needs login answers 401. Nobody can log in. |
| `JWT_EXPIRES_IN` | How long a token lasts | Defaults to `7d`. |
| `CLIENT_ORIGIN` | The one origin CORS allows | `env.js` falls back to `http://localhost:5174`. `.env.example` sets `http://localhost:5173`, the port the client runs on, so we keep that line. In development the browser reaches the backend through the Vite proxy, so a wrong value shows only when the client calls the backend address directly. Then every browser call fails with a CORS error. |
| `AI_BASE_URL`, `AI_API_KEY`, `AI_MODEL` | Where the model is and how to reach it | When any of the three is empty, search stays direct: it matches the words against brand and model and never calls the model. Nothing fails. A search in a full sentence finds phones only when every word is in a brand or a model name. |
| `PRICE_UPDATER_CRON` | When the price job will run | Defaults to `0 2 * * *`. Nothing reads it until the price updater is built. |
| `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM` | The mail account for the password reset email | Nothing reads them until password reset is built. After that, the reset link will be printed to the console when they are empty. |
| `CLIENT_URL` | The site address that will go into the reset link | `env.js` falls back to `http://localhost:5174`. Nothing reads it until password reset is built. |

## The security choices

1. `helmet` sets safe HTTP headers on every answer.
2. `cors` is limited to the client origin. Other sites cannot read the API from a browser.
3. The two rate limits above cap one address at 300 requests every 15 minutes, and at 20 AI requests every minute.
4. Passwords are stored only as bcrypt hashes. The hash is left out of every query unless the login code asks for it, and no reply holds it.
5. Log in gives the same answer for an unknown email and a wrong password.
6. Tokens expire after seven days. A route that needs login checks the token and loads the user on every request.
7. Secrets live only in `.env`, which is ignored by git and left out of the submission zip. The browser never sees the model key, because only the backend uses it.
8. Each controller checks its input before it touches the database, so bad input gets a 400 with a clear message. Search words are escaped before they go into a database pattern. The JSON body is limited to 1 MB. Moving these checks into `validate.js` with `zod` schemas is planned.
9. The author name of a review comes from the logged in account, never from the request.

## The order Gerald builds it in

Done:

1. Auth: the User model, `password.js`, `jwt.js`, `auth.js`, register, login and me.
2. Phone routes: the Phone model, `phoneQuery.js`, the list with filters, sorting and pages, and the detail.
3. Compare and the price trend: `GET /phones/compare` with the best value in each row, `price.service.js` and `GET /phones/:slug/price-trend`.
4. Reviews: the Review model, `review.service.js`, posting, listing and the star based summary, with one review per person per phone.
5. Search: `ai.service.js` with `parseSearchQuery`, the direct match, the sentence rule, the model step, the search log and the search history, plus the limit of 20 AI requests every minute.
6. The seed script and the six sample phones.

Next, in this order:

1. The search fallback: the model supplies a phone we do not have, saved with source `ai`.
2. Chat: `POST /ai/chat` with the related phones from the database.
3. Recommend: `recommend.service.js`, the shortlist and the ranking by the model.
4. Dashboard: `GET /users/me/dashboard`, the favourites, and recently viewed phones recorded by `GET /phones/:slug`, capped at 20.
5. Password reset: `mail.service.js` with Nodemailer, the two endpoints and the `passwordReset` field.
6. The price updater: the job, the price source and `npm run prices`.
7. Summaries by the model: `aiSummary` for a phone, and the review summary and sentiment from the review texts.
8. Input checks moved into `validate.js`.

Each step ends with the endpoint tested from the browser or with a small script, and the matching page switched from the mock file to the real service call. The test cases are in [TEST-DATA.md](TEST-DATA.md).

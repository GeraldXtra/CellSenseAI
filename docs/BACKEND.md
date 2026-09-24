# The backend

This document explains the CellSense AI backend for someone who has only written small Express apps. It says what each folder is for, follows one request from the moment it arrives to the moment the answer leaves, and explains login, the AI service, the price updater, the seed script, the settings and the security choices. Gerald builds the backend. The order he builds it in is at the end.

Today the backend starts, connects to MongoDB Atlas when a connection string is set, and answers `GET /api/health`. The four routers are mounted but hold no endpoints yet, so every other address answers 404. The models, controllers, services and utilities exist as placeholder files with one line each that says what they will do. This document describes both what is there now and what each file will do when it is built.

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
    middleware/     code that runs before or after every route
    jobs/           the nightly price updater
    utils/          small helpers
  scripts/          seed.js and runPriceUpdate.js, run by hand
  data/             phones.json, the sample phones
  .env.example      the settings with empty values
  package.json      the packages and the scripts
```

| Folder | What it is for |
| --- | --- |
| `src/config/` | `env.js` reads every setting from `.env` once and exports a frozen object, so no other file touches `process.env`. `db.js` opens the Mongoose connection with `MONGODB_URI` and warns instead of crashing when it is empty. |
| `src/models/` | The shape of each collection: `Phone.js`, `User.js`, `Review.js` and `SearchLog.js`. A model is how the rest of the code reads and writes MongoDB. Every field is listed in [DATA-MODEL.md](DATA-MODEL.md). |
| `src/routes/` | `auth.routes.js`, `phones.routes.js`, `ai.routes.js` and `users.routes.js`. A route file only maps a method and a path to a controller function, for example `router.get("/:slug", getPhone)`. It holds no logic. |
| `src/controllers/` | One file per router. A controller reads the request, calls a service or a model, and sends the envelope. It does not build database queries or talk to the model itself. |
| `src/services/` | The real work. `phoneQuery.js` turns the query params into one MongoDB query. `ai.service.js` is the only file that calls the model. `recommend.service.js` builds the shortlist. `price.service.js` computes the trend. `review.service.js` stores reviews and asks for the sentiment and the summary. `mail.service.js` sends the password reset email. |
| `src/middleware/` | `auth.js` reads the login token. `validate.js` checks the request body and query with `zod` schemas. `error.js` answers unknown paths and thrown errors. |
| `src/jobs/` | `priceUpdater.js`, the `node-cron` job that refreshes prices every night. |
| `src/utils/` | `http.js` builds the response envelope. `jwt.js` signs and verifies tokens. `password.js` hashes and checks passwords with bcrypt. |
| `scripts/` | `seed.js` loads `data/phones.json` into the database. `runPriceUpdate.js` runs the price updater once from the command line. |
| `data/` | `phones.json`, the sample phones we seed. It is empty until we collect the phones. |

## The life of one request

Take `GET /api/phones/samsung-galaxy-s24`, sent by the Phone detail page. This is what happens in `src/index.js`, in order.

1. `helmet()` adds safe HTTP headers to the answer before anything else runs.
2. `cors()` checks where the request comes from. Only the origin in `CLIENT_ORIGIN` may call the API from a browser.
3. `morgan("dev")` prints one line per request to the console, so we can see traffic while we develop.
4. `express.json({ limit: "1mb" })` turns a JSON body into `req.body`. A GET has no body, so nothing happens here.
5. The rate limit on `/api` counts the requests from this client. More than 300 in 15 minutes gets a 429 answer.
6. `GET /api/health` is checked first. It does not match.
7. The routers are checked in order: `/api/auth`, `/api/phones`, `/api/ai`, `/api/users`. The path starts with `/api/phones`, so `phones.routes.js` takes over. Inside it, `GET /:slug` matches with `slug` set to `samsung-galaxy-s24`.
8. The route runs `optionalAuth` from `middleware/auth.js`. If a token is present, the user is loaded onto `req.user`. If not, the request continues without a user.
9. The controller in `phones.controller.js` runs. It asks the `Phone` model for the document with that slug. When a user is present it also pushes the phone onto the user's recently viewed list.
10. The controller sends the answer through the envelope helper in `utils/http.js`: `{ ok: true, data: { phone } }`.
11. If anything throws along the way, Express 5 passes the error to `errorHandler` in `middleware/error.js`, which answers `{ ok: false, error: { message } }` with the status on the error or 500.
12. If no route matched at all, `notFound` in `middleware/error.js` answers 404 with the same envelope shape. Today that is what every address except the health check gets.

The client never sees anything but the envelope. `client/src/services/api.js` unwraps `data` on success and throws the `error.message` on failure.

## How login works

We keep no sessions on the server. A logged in user carries a token.

1. Register. `POST /api/auth/register` takes a name, an email and a password. The controller checks the input with `validate.js`, hashes the password with bcrypt through `utils/password.js`, stores the user with `passwordHash`, and signs a JWT with `utils/jwt.js`. The answer is `{ token, user }`. The email is stored in lowercase and must be unique.
2. Log in. `POST /api/auth/login` finds the user by email and checks the password against the hash. A wrong email or password gets the same 401 message, so nobody learns which one was wrong. A match gets a fresh token. The token carries the user id and expires after `JWT_EXPIRES_IN`, which is seven days.
3. `requireAuth` in `middleware/auth.js` reads the `Authorization: Bearer <token>` header, verifies the token with `JWT_SECRET`, loads the user from the database and puts it on `req.user`. A missing, wrong or expired token gets 401 and the route never runs. The dashboard, favourites and posting a review use it.
4. `optionalAuth` does the same but never fails. When there is no valid token the route runs with no user. `GET /phones/:slug`, `POST /ai/search` and `POST /ai/recommend` use it, because they work for everyone but record history for a logged in user.
5. `GET /api/auth/me` returns the user for the token. The client calls it once on load, so a person stays logged in after a page reload.
6. Password reset. `POST /api/auth/forgot-password` always answers `{ sent: true }`. When the email exists, the controller makes a random token, stores its hash and an expiry one hour ahead in `passwordReset` on the user, and `mail.service.js` sends the link `<CLIENT_URL>/reset-password/<token>` with Nodemailer. `POST /api/auth/reset-password` hashes the token it receives, finds the user with that hash, checks the expiry, stores the new bcrypt hash, clears `passwordReset` and answers `{ ok: true }`. Anything else gets 400. While the mail keys are empty, the link is printed to the console instead.

## What the AI service does

`src/services/ai.service.js` is the only file that talks to the model. It builds a client for the OpenAI compatible chat endpoint from `AI_BASE_URL`, `AI_API_KEY` and `AI_MODEL`, and holds one function per feature. Every function sends a prompt made of our rules, our phone data and the person's words, and reads the answer back. We integrate a pre trained model; we do not train or build one.

| Function | Called by | What it sends | What it gets back |
| --- | --- | --- | --- |
| `sentenceToFilters(query)` | `POST /ai/search` | The search sentence and the list of filter names we accept | Filters as JSON: brand, minPrice, maxPrice, has5G, minRam, minStorage, minCamera, minBattery, minRefresh, category, keywords |
| `answerChat(messages, phones)` | `POST /ai/chat` | Our rules for the assistant, the related phones with their prices and dates, and the full chat history | The reply text and the slugs of the phones it mentioned |
| `rankShortlist(phones, needs)` | `POST /ai/recommend` | The shortlist from our own rules and the person's needs | The top three slugs, in order, with a one or two sentence reason each |
| `writeSummary(phone)` | when a phone is added | The specs and the price | One or two plain English sentences for `aiSummary` |
| `summariseReviews(reviews)` | `GET /phones/:slug/review-summary` and when a review is posted | The review texts and ratings | A one or two sentence summary, a sentiment, and the sentiment of a single review |
| `lookUpPhone(name)` | the search fallback | The name of a phone we do not have | Its specifications and a guide price as JSON, saved with source `ai` and shown with the Estimated label |

When `AI_API_KEY` is empty, each function returns a plain fallback: search uses direct matching only, the assistant answers that the model is not connected, the shortlist keeps our own order, the summary stays empty and the sentiment comes from the star rating. The site keeps working without the model, only the language parts are missing.

## The price updater

`src/jobs/priceUpdater.js` schedules one run with `node-cron` at the time in `PRICE_UPDATER_CRON`. The default `0 2 * * *` means 02:00 every day. A run loads every phone, asks the price source for today's price, appends `{ price, date, source }` to `priceHistory`, updates `price.current` and `price.updatedAt`, and logs how many phones changed. The price source will be one of three things: a lookup through the model, a price API, or a manual prices file. The `source` field on each entry records which one was used. `npm run prices` runs the same job once by hand through `scripts/runPriceUpdate.js`.

`src/services/price.service.js` reads that history for one phone, compares the current price with the price about 90 days earlier, and returns `falling`, `rising` or `stable` with a one line suggestion. This is a calculation over stored prices, not a forecast model.

## The seed script

`scripts/seed.js` reads `data/phones.json`, connects with the same `MONGODB_URI` as the server, removes the phones that are already there and inserts the file. Each phone gets `source` set to `seed` and one `priceHistory` entry with source `seed`. We run it once on a fresh database with `npm run seed`. The file is a JSON array with one object per phone in the shape from [DATA-MODEL.md](DATA-MODEL.md). It is empty until we collect the phones; until then the client runs on `client/src/data/mockPhones.js`.

## The settings and what breaks without them

`src/config/env.js` reads these once. `.env.example` lists them with empty values.

| Setting | What it is for | What happens when it is missing |
| --- | --- | --- |
| `PORT` | The port the server listens on | Defaults to 5000. The client proxy expects 5000. |
| `MONGODB_URI` | The Atlas connection string | The server starts and warns. Every route that touches the database fails, and the seed script stops. |
| `JWT_SECRET` | Signs and verifies the login tokens | Register and login cannot sign a token. Nobody can log in. |
| `JWT_EXPIRES_IN` | How long a token lasts | Defaults to `7d`. |
| `CLIENT_ORIGIN` | The one origin CORS allows | Defaults to `http://localhost:5173`. A wrong value makes every browser call fail with a CORS error. |
| `AI_BASE_URL`, `AI_API_KEY`, `AI_MODEL` | Where the model is and how to reach it | The AI service uses its plain fallbacks. Search still matches words, the assistant says it is not connected, recommendations keep our own order. |
| `PRICE_UPDATER_CRON` | When the price job runs | Defaults to `0 2 * * *`. |
| `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM` | The mail account for the password reset email | The reset link is printed to the console instead of sent. |
| `CLIENT_URL` | The site address that goes into the reset link | Defaults to `http://localhost:5173`. |

## The security choices

1. `helmet` sets safe HTTP headers on every answer.
2. `cors` is limited to the client origin. Other sites cannot call the API from a browser.
3. The rate limit caps one client at 300 requests per 15 minutes on `/api`.
4. Passwords are stored only as bcrypt hashes. Reset tokens are stored only as hashes, with a one hour expiry.
5. Tokens expire after seven days. A protected route checks the token on every request.
6. Secrets live only in `.env`, which is ignored by git and left out of the submission zip. The browser never sees the model key or the mail password, because only the backend uses them.
7. Every body and query is checked with `zod` before a controller runs, so bad input gets a 400 with a clear message instead of reaching the database.

## The order Gerald builds it in

1. Auth: the User model, `password.js`, `jwt.js`, `auth.js`, register, login and me.
2. Phone routes: the Phone model, `phoneQuery.js`, the list and the detail with recently viewed.
3. Compare and the price trend: `GET /phones/compare` with the best cell per row, `price.service.js` and `GET /phones/:slug/price-trend`.
4. Reviews: the Review model, `review.service.js`, posting, listing and the summary.
5. AI search: `ai.service.js` with `sentenceToFilters`, the direct layer, the model layer, the fallback and the search log.
6. Chat: `answerChat` with the related phones.
7. Recommend: `recommend.service.js` and `rankShortlist`.
8. Dashboard: `GET /users/me/dashboard` and the favourites.
9. Password reset: `mail.service.js` with Nodemailer, the two endpoints and the `passwordReset` field.
10. The price updater: the job, the price source and `npm run prices`.

Each step ends with the endpoint tested from the browser or with a small script, and the matching page switched from the mock file to the real service call.

# CellSense AI server

This folder holds the Express backend of CellSense AI. It runs on port 5000 and answers every address under `/api`. How the backend is put together is explained in [`docs/BACKEND.md`](../docs/BACKEND.md). Every endpoint is listed in [`docs/API.md`](../docs/API.md). Gerald builds and owns everything in this folder.

## What works today

The server starts, connects to MongoDB Atlas when `MONGODB_URI` is set, and answers `GET /api/health` with `{ "ok": true, "data": { "status": "up" } }`. The routers for `/api/auth`, `/api/phones`, `/api/ai` and `/api/users` are mounted but hold no endpoints yet, so every other address answers 404. The models, controllers, services and utilities are placeholder files with one line each that says what they will do.

## Requirements

- Node 20 or newer.
- A MongoDB Atlas connection string for the database routes.
- An API key from a provider with an OpenAI compatible chat endpoint for the AI routes.
- A mail account for the password reset email. Optional while we develop.

## Run it

From this folder:

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Fill in `server/.env` before the first run (the keys are below). Then open `http://localhost:5000/api/health` in a browser. The full setup for a fresh machine is in [`docs/INSTALLATION.md`](../docs/INSTALLATION.md).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the server with nodemon, which restarts on every file change. |
| `npm start` | Starts the server with plain `node`. |
| `npm run seed` | Loads `data/phones.json` into the phones collection. |
| `npm run prices` | Runs `scripts/runPriceUpdate.js`, the price updater, once. |

## The .env keys

`src/config/env.js` reads these once and exports them as a frozen object. No other file reads `process.env`.

| Key | What it is for |
| --- | --- |
| `PORT` | The port the server listens on. `5000`, which the client proxy expects. |
| `MONGODB_URI` | The MongoDB Atlas connection string with the real password in it. |
| `JWT_SECRET` | A long random string that signs the login tokens. |
| `JWT_EXPIRES_IN` | How long a login token lasts. `7d`. |
| `CLIENT_ORIGIN` | The one origin CORS allows. `http://localhost:5173` in development. |
| `AI_BASE_URL` | The base URL of the OpenAI compatible chat endpoint. |
| `AI_API_KEY` | The API key for that endpoint. |
| `AI_MODEL` | The model name at that provider. |
| `PRICE_UPDATER_CRON` | When the price updater runs. `0 2 * * *` is 02:00 every day. |
| `MAIL_HOST` | The SMTP host that sends the password reset email. |
| `MAIL_PORT` | The SMTP port, usually `587`. |
| `MAIL_USER` | The mail account user name. |
| `MAIL_PASS` | The mail account password. |
| `MAIL_FROM` | The sender address shown in the email. |
| `CLIENT_URL` | The site address that goes into the reset link. `http://localhost:5173` in development. |

The mail keys can stay empty while we develop. The reset link is then printed to the console instead of sent.

## Folder map

| Path | What is in it |
| --- | --- |
| `src/index.js` | Builds the Express app, adds helmet, cors, morgan, the JSON parser and the rate limit, mounts the routers and starts listening. |
| `src/config/env.js` | Reads every setting once with defaults and exports a frozen object. |
| `src/config/db.js` | Opens the Mongoose connection when `MONGODB_URI` is set. |
| `src/models/` | `Phone.js`, `User.js`, `Review.js` and `SearchLog.js`, one Mongoose model per collection. |
| `src/routes/` | `auth.routes.js`, `phones.routes.js`, `ai.routes.js` and `users.routes.js`. Each maps paths to controller functions. |
| `src/controllers/` | `auth.controller.js`, `phones.controller.js`, `ai.controller.js` and `users.controller.js`. |
| `src/services/` | `ai.service.js` (calls the model), `phoneQuery.js` (builds the phone query), `recommend.service.js`, `price.service.js`, `review.service.js` and `mail.service.js`. |
| `src/middleware/` | `auth.js` (the login token), `validate.js` (input checks with zod) and `error.js` (not found and error answers). |
| `src/jobs/priceUpdater.js` | The nightly `node-cron` price job. |
| `src/utils/` | `http.js` (the envelope), `jwt.js` (tokens) and `password.js` (bcrypt hashes). |
| `scripts/seed.js` | Loads `data/phones.json` into the database. |
| `scripts/runPriceUpdate.js` | Runs the price updater once. |
| `data/phones.json` | The sample phones we seed. Empty until we collect them. |

## The envelope

Every answer has the same shape. On success the payload sits in `data`:

```json
{ "ok": true, "data": { } }
```

On failure the reason sits in `error.message`:

```json
{ "ok": false, "error": { "message": "..." } }
```

Protected routes need the header `Authorization: Bearer <token>`.

# CellSense AI server

This folder holds the Express backend of CellSense AI. It runs on port 5000 and answers every address under `/api`. Gerald builds and owns everything in this folder.

Two documents go deeper. [`docs/BACKEND.md`](../docs/BACKEND.md) explains how the backend is put together: what each file does, the life of a request, login, search, the rate limits and what breaks when a setting is missing. [`docs/INSTALLATION.md`](../docs/INSTALLATION.md) has the full setup for a laptop, step by step. Every endpoint is listed in [`docs/API.md`](../docs/API.md).

## What works today

The server starts, connects to MongoDB Atlas and answers these endpoints:

- `GET /api/health`
- `POST /api/auth/register`, `POST /api/auth/login` and `GET /api/auth/me`
- `GET /api/phones`, `GET /api/phones/compare` and `GET /api/phones/:slug`
- `GET /api/phones/:slug/price-trend`
- `GET /api/phones/:slug/reviews`, `POST /api/phones/:slug/reviews` and `GET /api/phones/:slug/review-summary`
- `POST /api/ai/search`

The assistant chat, recommendations, the dashboard with favourites, password reset and the price updater are planned. Their files are placeholders, and their addresses answer 404.

## Requirements

- Node 20 or newer.
- A MongoDB Atlas connection string.
- A long random `JWT_SECRET`.
- Optional: the address, the key and the model name of an OpenAI compatible chat API, for the model step of search. Without them search stays direct.

## Run it

From this folder:

```powershell
npm install
Copy-Item .env.example .env
notepad .env
npm run dev
```

Fill in `server/.env` before the first start. The settings are below. When the server is up, the window shows `MongoDB connected` with the database name and `CellSense API running on http://localhost:5000`. Then open `http://localhost:5000/api/health` in a browser. It answers `{ "ok": true, "data": { "status": "up" } }`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the server with nodemon, which restarts on every file change. |
| `npm start` | Starts the server with plain `node`. |
| `npm run seed` | Loads the six phones in `data/phones.json` into the phones collection. It writes over the phones with the same slug, so we run it only on a fresh database and never on the shared one. |
| `npm run prices` | Will run the price updater once. `scripts/runPriceUpdate.js` is a placeholder and does nothing yet. |

## The settings in .env

`src/config/env.js` reads these once and exports them as a frozen object. No other file reads `process.env`. `server/.env` is ignored by git and never shared.

| Setting | What it is for |
| --- | --- |
| `PORT` | The port the server listens on. `5000`, which the client proxy expects. |
| `MONGODB_URI` | The MongoDB Atlas connection string, with the user name and the password in it. Each teammate has his own database user. Without it the server starts but every route that touches the database fails. |
| `JWT_SECRET` | A long random string that signs the login tokens. Without it nobody can log in. We make one with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`. |
| `JWT_EXPIRES_IN` | How long a login token lasts. `7d`. |
| `CLIENT_ORIGIN` | The one origin CORS allows. `http://localhost:5173` in development. |
| `AI_BASE_URL` | The base URL of the OpenAI compatible chat API. |
| `AI_API_KEY` | The key for that API. |
| `AI_MODEL` | The name of the model to use there. |
| `PRICE_UPDATER_CRON` | When the price updater will run. `0 2 * * *` is 02:00 every day. Nothing reads it until the price updater is built. |
| `MAIL_HOST` | The SMTP host that will send the password reset email. |
| `MAIL_PORT` | The SMTP port, usually `587`. |
| `MAIL_USER` | The mail account user name. |
| `MAIL_PASS` | The mail account password. |
| `MAIL_FROM` | The sender address shown in the email. |
| `CLIENT_URL` | The site address that will go into the reset link. `http://localhost:5173` in development. |

The three AI settings belong together. The AI features integrate a pre trained language model through an OpenAI compatible chat API, and these three settings say where it is and how to reach it. When any of them is empty, the server still runs and search stays direct: it matches the words against brand and model and never calls the model.

The mail settings and `CLIENT_URL` can stay empty. Nothing reads them until password reset is built.

## The envelope

Every answer has the same shape. On success the payload sits in `data`:

```json
{ "ok": true, "data": { } }
```

On failure the reason sits in `error.message`:

```json
{ "ok": false, "error": { "message": "..." } }
```

Routes that need login want the header `Authorization: Bearer <token>`. One address can send 300 requests every 15 minutes, and 20 AI requests every minute. Past that the answer is 429.

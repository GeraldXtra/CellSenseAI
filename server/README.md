# CellSense AI server

This folder holds the Express backend of CellSense AI. It runs on port 5000 and answers every address under `/api`. Gerald builds and owns everything in this folder.

Three documents go deeper. [`docs/BACKEND.md`](../docs/BACKEND.md) explains how the backend is put together: what each file does, how a request travels, every setting, the models, the services, the nightly price check and the scripts. [`docs/API.md`](../docs/API.md) lists every endpoint with its replies, its messages and the rate limits. [`docs/INSTALLATION.md`](../docs/INSTALLATION.md) has the full setup for a laptop, step by step.

## The endpoints

Every endpoint is live:

- `GET /api/health`
- `POST /api/auth/register`, `POST /api/auth/login` and `GET /api/auth/me`
- `POST /api/auth/forgot-password` and `POST /api/auth/reset-password`
- `GET /api/phones`, `GET /api/phones/compare` and `GET /api/phones/:slug`
- `GET /api/phones/:slug/price-trend`
- `GET /api/phones/:slug/reviews`, `POST /api/phones/:slug/reviews` and `GET /api/phones/:slug/review-summary`
- `POST /api/ai/search`, `POST /api/ai/chat` and `POST /api/ai/recommend`
- `GET /api/users/me/dashboard`, `POST /api/users/me/favourites/:slug` and `DELETE /api/users/me/favourites/:slug`

## Requirements

- Node 20 or newer.
- A MongoDB Atlas connection string.
- A long random `JWT_SECRET`.
- Optional: the address, the key and the model name of an OpenAI compatible chat API, for the AI features. We use Groq with the model `openai/gpt-oss-120b`. Without them the server still runs: search is direct only, the assistant answers "The AI features are not set up yet", recommendations come with reasons from our own rules, and review summaries and review moods come from the stars.
- Optional: an SMTP account for the password reset email. Without it the reset link is printed in the server window.

## Run it

From this folder:

```powershell
npm install
Copy-Item .env.example .env
notepad .env
npm run dev
```

Fill in `server/.env` before the first start. The settings are below. When the server is up, the window shows `MongoDB connected` with the database name, `Nightly price check scheduled: 0 2 * * *` and `CellSense API running on http://localhost:5000`. Then open `http://localhost:5000/api/health` in a browser. It answers `{ "ok": true, "data": { "status": "up" } }`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the server with nodemon, which restarts on every file change. |
| `npm start` | Starts the server with plain `node`. |
| `npm run seed` | Loads the 60 phones in `data/phones.json` into the phones collection. It adds the phones that are missing and refreshes the names, category, release year, specs, image paths and, where the file has one, the summary of the others. It never changes a price or a price history already in the database, and it never removes a phone. The seed is safe, but only Gerald runs it. |
| `npm run prices` | Runs the price check once by hand: it records the prices in `data/prices.json` with the date at the top of that file. The same check runs every night at 02:00 Lagos time while the server is running. Only Gerald runs it. |

## The settings in .env

`src/config/env.js` reads these once and exports them as a frozen object. No other file reads `process.env`. `server/.env` is ignored by git and never shared. `NODE_ENV` is not in the file; we leave it out, so the server runs in development mode.

| Setting | What it is for |
| --- | --- |
| `PORT` | The port the server listens on. `5000`, which the client proxy expects. |
| `MONGODB_URI` | The MongoDB Atlas connection string, with the user name and the password in it. Each teammate has their own database user. Without it the server starts but every route that touches the database fails. |
| `JWT_SECRET` | A long random string that signs the login tokens. Without it nobody can log in. We make one with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`. |
| `JWT_EXPIRES_IN` | How long a login token lasts. `7d`. |
| `CLIENT_ORIGIN` | The one origin CORS allows. `http://localhost:5173`, which is also the default. |
| `AI_BASE_URL` | The base URL of the OpenAI compatible chat API. For Groq, `https://api.groq.com/openai/v1`. |
| `AI_API_KEY` | The key for that API. |
| `AI_MODEL` | The name of the model to use there. We use `openai/gpt-oss-120b`. |
| `PRICE_UPDATER_CRON` | When the nightly price check runs, in Lagos time. `0 2 * * *` is 02:00 every day. |
| `MAIL_HOST` | The SMTP host that sends the password reset email. |
| `MAIL_PORT` | The SMTP port. `587` when it is empty. |
| `MAIL_USER` | The mail account user name. |
| `MAIL_PASS` | The mail account password. |
| `MAIL_FROM` | The sender address shown in the email. `MAIL_USER` is used when it is empty. |
| `CLIENT_URL` | The site address at the start of the reset link. `http://localhost:5173`, which is also the default. |

The three AI settings belong together. The AI features integrate a pre trained language model through an OpenAI compatible chat API, and these three settings say where it is and how to reach it. When any of them is empty, the server still runs and every AI feature falls back as listed under Requirements.

The mail settings can stay empty on a laptop. The email goes out only when `MAIL_HOST`, `MAIL_USER` and `MAIL_PASS` are all filled; until then the reset link is printed in the server window, which is enough to test the reset pages.

## The data

`data/phones.json` holds the 60 phones the seed loads, 12 each for Samsung, Apple, OnePlus, Xiaomi and Vivo. `data/prices.json` is the price list the price check reads: a check date and guide prices for the phone slugs it lists. [`data/README.md`](data/README.md) describes both files.

## The envelope

Every answer has the same shape. On success the payload sits in `data`:

```json
{ "ok": true, "data": { } }
```

On failure the reason sits in `error.message`:

```json
{ "ok": false, "error": { "message": "..." } }
```

Routes that need login want the header `Authorization: Bearer <token>`. One address can send 300 requests every 15 minutes, 20 AI requests every minute and 5 password reset requests every 15 minutes. Past that the answer is 429.

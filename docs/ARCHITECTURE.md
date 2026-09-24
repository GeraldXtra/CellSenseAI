# Architecture

This document explains how CellSense AI works. We wrote it for a reader who has never built a website. The other documents go deeper: [API.md](API.md) lists every endpoint, [DATA-MODEL.md](DATA-MODEL.md) lists every field we store, [BACKEND.md](BACKEND.md) explains the server folder by folder, and [DIAGRAMS.md](DIAGRAMS.md) lists the pictures that show the same flows.

## How the site works

CellSense AI is a single page web application. The browser loads the app once. After that it only asks the backend for data and shows what comes back.

The site is made of four parts. Each part has one job.

1. The browser. This is the React app, built with React 19, Vite, React Router, Bootstrap 5 and plain CSS. It shows the pages, takes input from the visitor and asks the backend for data.
2. The backend. This is a Node 20 server built with Express 5. It receives every request from the browser and checks who is asking. It reads and writes the database, calls the model when a feature needs it, sends the password reset email, and sends an answer back.
3. The database. This is MongoDB Atlas, a cloud database, used through Mongoose. It stores phones, users, reviews and search logs.
4. The model. This is a pre trained language model that we reach through an OpenAI compatible chat API. It reads the text the backend sends and answers with text or JSON. We integrate it, we do not train it.

We keep five rules between the parts.

1. The browser only asks the backend for things and shows what comes back. It never talks to the database or the model itself.
2. The backend is the only part that reads and writes MongoDB.
3. The backend is the only part that calls the model. It decides what to send and what to do with the reply.
4. The model never talks to the database directly. It only sees the text the backend gives it.
5. The keys and passwords for the database, the model and the mail account live only in `server/.env`. The browser never sees them.

Here is one request, step by step. A visitor types "5G phone with long battery life" and presses Enter.

1. The browser sends the sentence to the backend at `POST /api/ai/search`.
2. The backend sends the sentence to the model and asks for filters.
3. The model answers with filters as JSON, for example `has5G` set to true and a minimum battery size.
4. The backend runs a query on MongoDB with those filters.
5. The backend sends the matching phones back to the browser.
6. The browser shows the phones as cards.

The visitor only types the sentence and sees the cards. Steps 2 to 5 happen in the backend and the model.

One more part runs on a timer. The price updater is a job inside the backend, scheduled with `node-cron`. It runs every night, asks a price source for the price of every phone, and writes the result to the database. No visitor triggers it. We describe it below with the other flows.

In development the browser app runs at `http://localhost:5173` and the backend at `http://localhost:5000`. Every backend address starts with `/api`. The Vite proxy in `client/vite.config.js` forwards every `/api` request to port 5000. `client/.env.example` holds `VITE_API_URL`, which we leave empty to use that proxy.

## Feature flows

Each feature follows the same pattern: the browser asks, the backend does the work, the browser shows the result. Where we say a step happens "when the user is logged in", the browser has sent a valid login token with the request.

### Search

Search has two layers and a fallback.

1. Direct layer. The backend matches the words against brand and model in MongoDB.
2. Model layer. When the query reads like a sentence, or when direct matching finds nothing, the backend sends the sentence to the model. The model returns filters as JSON: `brand`, `minPrice`, `maxPrice`, `has5G`, `minRam`, `minStorage`, `minCamera`, `minBattery`, `minRefresh`, `category` and `keywords`. The backend runs the same database query with those filters.
3. Fallback. If there is still nothing and the query names a real phone we do not have, the model supplies its specifications as JSON. The backend saves the phone with source `ai` and the page shows it with a note and an "Estimated" label on the price.

Every search is written to the `searchlogs` collection. When the user is logged in, it is also added to that user's search history.

The Search results page calls `POST /api/ai/search` with `{ query }` and gets back `{ items, filters, source }`. The `source` is `direct` or `ai`. The page shows the filters as chips so the visitor can see how the query was understood.

### Browse

Browse needs no model. The Browse page sends `GET /api/phones` with the filters the visitor picked: brand, price range, 5G, RAM, storage, refresh rate and category, plus a sort order. The backend turns them into one MongoDB query and returns one page of phones with the total count. Brand pages at `/browse/:brand` use the same call with the brand filled in.

### Phone page

The Phone detail page asks the backend for four things.

1. `GET /api/phones/:slug` returns the phone: its specs, its price with the date the price was last checked, and its summary. The summary is written once by the model when the phone is added and stored in the `aiSummary` field. When the user is logged in, the backend also records the phone in that user's recently viewed list.
2. `GET /api/phones/:slug/price-trend` returns the price history for the chart, the trend and a one line suggestion.
3. `GET /api/phones/:slug/reviews` returns the reviews with the average rating and the count.
4. `GET /api/phones/:slug/review-summary` returns the short review summary and the overall sentiment.

The slug is the brand and model in lowercase, joined with hyphens. It is the part of the URL that names the phone.

### The compare list in the browser

The visitor collects phones to compare before opening the Compare page. Every phone card has a Compare checkbox and the phone page has an Add to compare button. Both write to a list that lives in the browser: `CompareContext` in `client/src/context/CompareContext.jsx` keeps up to three slugs in localStorage under the key `cs_compare`. Nothing is sent to the backend at this point. The list survives a page reload and stays until the visitor removes the phones.

When the visitor opens the Compare page, the page reads the slugs from that list. A shared link also works: `/compare?ids=a,b,c` puts the slugs from the URL into the same list, so a friend can open the same comparison.

### Compare

The Compare page sends the two or three slugs to `GET /api/phones/compare?ids=a,b,c`. The backend fetches the phones by slug. It builds one row for each of these: price, processor, RAM, storage, main camera, front camera, battery, display size, refresh rate and operating system. In each row it marks the best value: the lowest price, and the highest value in every other row. The answer is `{ phones, best }`. The page draws the table and marks the winning cell in each row in bold. A verdict from the model under the table is optional.

### Recommendation

The visitor fills in a budget, a brand preference, the usage purpose, and their camera, gaming, battery and performance needs on the Recommend page. The page sends them to `POST /api/ai/recommend`. The backend first builds a shortlist from MongoDB with our own rules: phones inside the budget, of the chosen brand when one is chosen, that fit the needs. When fewer than three phones fit, it widens the budget by 15 percent. It then sends the shortlist and the visitor's needs to the model. The model ranks the top three and gives a one or two sentence reason for each. The answer is `{ items: [{ phone, reason }] }`. When the user is logged in, the backend saves the result to the user's dashboard.

### The assistant

The assistant has its own page at `/assistant`. A fixed button at the bottom right of every other screen opens it, so the visitor can ask a question from wherever they are. The button is hidden on the Assistant page itself. Each time the visitor sends a message, the page sends the full message history to `POST /api/ai/chat` as `{ messages: [{ role, content }] }`.

The backend does the work in four steps.

1. It pulls related phones from MongoDB: phones named in the message, and phones inside a budget if the message mentions one.
2. It builds a prompt from three parts: our rules for the assistant, the phone data from step 1, and the chat history.
3. It sends the prompt to the model.
4. It returns the reply plus the phones the reply mentions, as `{ reply, phones }`, so the page can show phone cards under the answer.

Nobody has to use the assistant. Every feature is reachable through search, filters and buttons.

### Reviews

A logged in user writes a review with a rating from 1 to 5 and text. The page sends it to `POST /api/phones/:slug/reviews`. The backend stores the review with a sentiment of positive, neutral or negative. The model judges the sentiment. When the model is not configured, the star rating decides it.

The model summarises all reviews for a phone in one or two sentences. `GET /api/phones/:slug/review-summary` returns that summary and the overall sentiment.

### Login

Login uses email and password.

1. On register, the browser sends name, email and password to `POST /api/auth/register`. The backend stores the password as a bcrypt hash. We never store the password itself.
2. On login, the browser sends email and password to `POST /api/auth/login`. The backend checks the password against the hash and, if it matches, returns a JWT token and the user. The token expires after seven days.
3. The browser sends the token with every protected request in the header `Authorization: Bearer <token>`. The backend reads the token to know which user is asking. A protected route refuses a request without a valid token.
4. `GET /api/auth/me` returns the logged in user. The browser calls it once when the app loads with a stored token, so the visitor stays logged in after a reload.

### Password reset

A visitor who forgets their password gets a new one in three steps.

1. Request. On the Forgot password page the visitor enters their email. The browser sends it to `POST /api/auth/forgot-password`. The backend always answers `{ sent: true }`, whether or not the email exists, so nobody can use this page to find out which emails have an account.
2. Email with a one hour link. When the email belongs to a user, the backend creates a random token, stores a hash of it and an expiry one hour ahead in the `passwordReset` field of the user, and sends an email through Nodemailer. The email holds a link to `<CLIENT_URL>/reset-password/<token>`. The mail settings live in `server/.env`. While they are empty, the backend prints the link to its console instead of sending an email, so we can test the flow without a mail account.
3. New password. The link opens the Reset password page. The visitor types the new password twice. The browser sends `{ token, password }` to `POST /api/auth/reset-password`. The backend hashes the token, finds the user with that hash, checks that the expiry has not passed, stores the new bcrypt hash, clears `passwordReset` and answers `{ ok: true }`. An invalid or expired token gets a 400 answer and the page offers the Forgot password page again.

### Dashboard

The Dashboard page needs login. It calls `GET /api/users/me/dashboard` and gets four blocks back.

1. Recently viewed: the phones the user opened, capped at 20. The phone page fills this in.
2. Favourites: the phones the user saved. The browser adds one with `POST /api/users/me/favourites/:slug` and removes one with `DELETE /api/users/me/favourites/:slug`. Both return the new favourites list.
3. Search history: the user's searches, capped at 50. Search fills this in.
4. Last recommendations: the phones and reasons from the user's last recommendation. Recommendation fills this in.

### Price updater and price trend

The price updater is a `node-cron` job inside the backend. Its schedule comes from `PRICE_UPDATER_CRON` in `server/.env`. The default is `0 2 * * *`, which means 02:00 every day. Each run does the same steps.

1. Load all phones from MongoDB.
2. Ask a price source for today's price of each phone. The price source will be one of three things: a lookup through the model, a price API, or a manual prices file. We decide when we build the job, and each history entry records which one was used.
3. Append `{ price, date, source }` to the phone's `priceHistory`.
4. Update `price.current` and `price.updatedAt`.
5. Log a summary of the run.

We can also run the job once by hand with `npm run prices` from the `server` folder.

The trend is computed from the stored history. The backend compares the current price with the price about 90 days earlier. It reports `falling`, `rising` or `stable`, with a one line suggestion about the best time to buy. This is a trend calculation from stored prices, not a forecast model. `GET /api/phones/:slug/price-trend` returns the history, the trend and the suggestion.

## Folder layout

The root holds `client/`, `server/`, `docs/`, `README.md` and `.gitignore`. One line per folder:

- `client/`: the React app, a Vite project in JavaScript with `react-router-dom`, `bootstrap`, `axios`, `recharts` and `react-icons` installed.
- `client/src/styles/`: `theme.css`, the one file with every colour, spacing value, font size, corner radius and shadow the pages use, and `global.css` with the page shell, the top bar, the footer and the breakpoints.
- `client/src/services/`: `api.js` and one file per endpoint group. Pages call these functions and nothing else.
- `client/src/context/`: `AuthContext.jsx` for the logged in user and `CompareContext.jsx` for the compare list.
- `client/src/hooks/`: `useAsync.js`, which gives every page its loading, data and error state.
- `client/src/data/`: `mockPhones.js`, the sample phones, reviews and review summary used until an endpoint is ready.
- `client/src/components/shared/`: the layout, the top bar, the footer, the assistant launcher, the phone card and the other pieces every page uses.
- `client/src/components/ibrahim/` and `client/src/components/osakue/`: the components each teammate owns.
- `client/src/pages/`: one folder per page with the page file, its stylesheet and a README that says what to build.
- `client/public/brand/`: the logo files and favicons.
- `server/`: the Express backend. `src/index.js` starts the server and mounts `/api/auth`, `/api/phones`, `/api/ai`, `/api/users` and `GET /api/health`.
- `server/src/config/`: `env.js`, which reads every setting once, and `db.js`, which connects to MongoDB Atlas.
- `server/src/models/`: the Mongoose models `Phone.js`, `User.js`, `Review.js` and `SearchLog.js`, one per collection.
- `server/src/routes/`: the route files. They map each URL to a controller. They exist but hold no routes yet.
- `server/src/controllers/`: the code that runs for each route.
- `server/src/middleware/`: `auth.js` checks the login token, `validate.js` checks request input, `error.js` handles errors.
- `server/src/services/`: `ai.service.js` talks to the model, `phoneQuery.js` builds the phone query for MongoDB, `recommend.service.js` builds the shortlist, `price.service.js` computes the trend, `review.service.js` handles reviews, `mail.service.js` sends the password reset email.
- `server/src/utils/`: `http.js` for the envelope, `jwt.js` for the tokens, `password.js` for the hashes.
- `server/src/jobs/`: `priceUpdater.js`, the nightly price job.
- `server/scripts/`: `seed.js` loads the sample phones into the database. `runPriceUpdate.js` runs the price updater once.
- `server/data/`: `phones.json`, the sample phones we seed, and a `README.md` about that file.
- `docs/`: these documents. The finished designs are in `docs/ui/` and the diagrams in `docs/diagrams/`.

`server/.env.example` and `client/.env.example` list the settings each side needs. We copy `server/.env.example` to `server/.env` and fill it in.

## The envelope every response uses

Every answer from the backend has the same shape. The field `ok` says whether the request worked.

Success:

```json
{ "ok": true, "data": { } }
```

Failure:

```json
{ "ok": false, "error": { "message": "..." } }
```

`data` holds the result of the request. `error.message` says what went wrong.

Three rules go with the envelope.

1. Every address starts with `/api`. Example: `GET /api/health` returns `{ "ok": true, "data": { "status": "up" } }`.
2. Protected routes need the header `Authorization: Bearer <token>`.
3. Endpoints that are not built yet answer 404. Today that is every endpoint except `/api/health`.

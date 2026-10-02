# Architecture

This document explains how CellSense AI works. We wrote it for a reader who has never built a website. The other documents go deeper: [API.md](API.md) lists every endpoint, [DATA-MODEL.md](DATA-MODEL.md) lists every field we store, [BACKEND.md](BACKEND.md) explains the server folder by folder, and [DIAGRAMS.md](DIAGRAMS.md) lists the pictures that show the same flows.

## How the site works

CellSense AI is a single page web application. The browser loads the app once. After that it only asks the backend for data and shows what comes back.

The site is made of four parts. Each part has one job.

1. The browser. This is the React app, built with React 19, Vite, React Router, Bootstrap 5 and plain CSS. It shows the pages, takes input from the visitor and asks the backend for data.
2. The backend. This is a Node 20 server built with Express 5. It receives every request from the browser and checks who is asking. It reads and writes the database, calls the model when a feature needs it, sends the password reset email, and sends an answer back.
3. The database. This is MongoDB Atlas, a cloud database, used through Mongoose. It stores phones, users, reviews and search logs.
4. The model. This is a pre trained language model that we reach through an OpenAI compatible chat API. We use Groq with the model `openai/gpt-oss-120b`. It reads the text the backend sends and answers with text or JSON. We integrate it, we do not train it.

We keep five rules between the parts.

1. The browser only asks the backend for things and shows what comes back. It never talks to the database or the model itself.
2. The backend is the only part that reads and writes MongoDB.
3. The backend is the only part that calls the model. It decides what to send and what to do with the reply.
4. The model never talks to the database directly. It only sees the text the backend gives it.
5. The keys and passwords for the database, the model and the mail account live only in `server/.env`. The browser never sees them.

Here is one request, step by step. A visitor types "5G phone with long battery life" and presses Enter.

1. The browser sends the sentence to the backend at `POST /api/ai/search`.
2. The backend sees that the words read like a sentence, so it sends them to the model and asks for filters.
3. The model answers with filters as JSON, for example `has5G` set to true, a minimum battery of 5000 mAh and the battery sort.
4. The backend runs a query on MongoDB with those filters.
5. The backend sends the matching phones back to the browser.
6. The browser shows the phones as cards.

The visitor only types the sentence and sees the cards. Steps 2 to 5 happen in the backend and the model. A plain name such as "samsung" skips steps 2 and 3, because the backend can match it against the database directly.

One more part runs on a timer. The nightly price check is a job inside the backend, scheduled with `node-cron` at 02:00 Lagos time. It reads our price list in `server/data/prices.json` and records each new price in the database. No visitor triggers it. We describe it below with the other flows.

The site also runs without the model. When the three AI settings in `server/.env` are empty, search matches words directly, recommendations use reasons from our own rules, review summaries and review moods come from the stars, and only the assistant has nothing to answer with: it says "The AI features are not set up yet".

In development the browser app runs at `http://localhost:5173` and the backend at `http://localhost:5000`. Every backend address starts with `/api`. The Vite proxy in `client/vite.config.js` forwards every `/api` request to port 5000. `client/.env.example` holds `VITE_API_URL`, which we leave empty to use that proxy.

## Feature flows

Each feature follows the same pattern: the browser asks, the backend does the work, the browser shows the result. Where we say a step happens "when the user is logged in", the browser has sent a valid login token with the request.

### Search

Search is direct first, and it uses the model only when the words need it.

1. Direct first. The backend matches each word against brand and model in MongoDB. A query such as "samsung" or "galaxy s24" is answered here, with no model.
2. The sentence rule. The backend checks whether the query reads like a sentence. It does when it has four words or more, when it holds a dollar sign or a number of three digits or more, or when it holds a word such as under, over, with, best, cheap, budget, gaming, camera or battery. A sentence skips the direct match, because matching "phone under $400" word by word against phone names finds nothing useful.
3. The model turns the sentence into filters. The backend sends the sentence to the model, and also a short query that the direct match found nothing for. The model returns filters as JSON: `brand`, `minPrice`, `maxPrice`, `has5G`, `minRam`, `minStorage`, `minCamera`, `minBattery`, `minRefresh`, `category`, `sort` and `keywords`. The backend keeps only those keys.
4. The same database search. The backend runs the search on MongoDB again with those filters. It is the same code that answers Browse. The model never picks the phones and never sees the database. It only turns words into filters.
5. A phone we do not have. When that search finds nothing and the query names a model, the backend asks the model for the specifications of that phone. When the model knows it, the backend saves it with source `ai`, a guide price and a short summary, and returns it. The page shows it with a note and an "Estimated" label on the price, because its specs and price are estimates.

Every search is written to the `searchlogs` collection with its source, `direct` or `ai`. When the user is logged in, it is also added to that user's search history, which keeps the latest 50 searches.

The Search results page calls `POST /api/ai/search` with `{ query }` and gets back `{ items, filters, source }`. The page shows the filters as chips so the visitor can see how the query was understood. Without the AI settings every query stays direct and nothing fails.

### Browse

Browse needs no model. The Browse page sends `GET /api/phones` with the filters the visitor picked: brand, price range, 5G, RAM, battery and refresh rate, plus a sort order and a page number. The backend turns them into one MongoDB query and returns one page of phones, 24 at a time, with the total count. Brand pages at `/browse/:brand` use the same call with the brand filled in.

### Phone page

The Phone detail page asks the backend for four things.

1. `GET /api/phones/:slug` returns the phone: its specs, its price with the date the price was last checked, its summary, and whether the logged in user has saved it. When the phone has no summary yet and the AI settings are filled, the backend asks the model for one or two sentences about who the phone suits, stores them in `aiSummary` and returns them, so each summary is written once. When the user is logged in, the backend also records the phone in the user's recently viewed list.
2. `GET /api/phones/:slug/price-trend` returns the price history for the chart, the trend and a one line suggestion.
3. `GET /api/phones/:slug/reviews` returns the reviews with the average rating and the count.
4. `GET /api/phones/:slug/review-summary` returns the short review summary and the overall sentiment.

The slug is the brand and model in lowercase, joined with hyphens, with a plus sign written as the word plus. It is the part of the address that names the phone.

### The compare list in the browser

The visitor collects phones to compare before opening the Compare page. Every phone card has a Compare checkbox and the phone page has an Add to compare button. Both write to a list that lives in the browser: `CompareContext` in `client/src/context/CompareContext.jsx` keeps up to three slugs in localStorage under the key `cs_compare`. Nothing is sent to the backend at this point. The list survives a page reload and stays until the visitor removes the phones.

When the visitor opens the Compare page, the page reads the slugs from that list. A shared link also works: `/compare?ids=a,b,c` puts the slugs from the address at the front of the same list, so a friend can open the same comparison.

### Compare

The Compare page sends the two or three slugs to `GET /api/phones/compare?ids=a,b,c`. The backend fetches the phones by slug and keeps them in the order of the link. It then finds the best value in each of the eight rows that hold numbers: price, RAM, storage, main camera, front camera, battery, display size and refresh rate. The lowest price wins, and the highest value wins every other row. When phones tie for the top, all of them win. A row where every phone is equal has no winner. Processor, display type and operating system are text, so they have no winner either. The answer is `{ phones, best }`, worked out by our own code with no model. The page draws the table and marks the winning cell in each row in bold. With one phone in the list, the page shows that phone alone with `GET /api/phones/:slug`.

### Recommendation

The visitor fills in a budget, a brand preference, the usage purpose, the performance they need, and whether the camera, gaming and the battery matter, on the Recommend page. The page sends them to `POST /api/ai/recommend`.

1. The shortlist. The backend takes the phones at or under the budget, of the chosen brand when one is chosen. When fewer than three fit, it raises the budget by 15 percent and tells the page so. It scores each phone on camera, battery, speed and newness, with more weight on what the visitor said matters, and keeps the best six. These are our own rules.
2. The ranking. The backend sends the needs and the shortlist to the model. The model picks the three phones that suit the needs best and writes a one or two sentence reason for each. A pick that is not on the shortlist is dropped.
3. Without the model, or when it fails, the reply holds the top three of our own shortlist, each with a reason from our rules, such as "Guide price $289, with a 200 MP main camera."

The answer is `{ items: [{ phone, reason }], widened }`. When the user is logged in, the backend saves the picks to the user's dashboard.

### The assistant

The assistant has its own page at `/assistant`. A fixed button at the bottom right of every other page opens a small chat window over the page, so the visitor can ask a question from wherever they are. The window and the page show the same conversation, because both read it from `ChatContext` in the browser. The button and the window are hidden on the Assistant page itself. Each time the visitor sends a message, the browser sends the whole conversation to `POST /api/ai/chat` as `{ messages: [{ role, content }] }`.

The backend does the work in four steps.

1. It keeps the last 12 messages and pulls related phones from MongoDB: the phones named in the recent messages, then phones inside a budget when the question mentions one, ordered by camera, battery or price when the question asks about that.
2. It builds a prompt from three parts: our rules for the assistant, one line of data per phone with its guide price and the date it was checked, and the conversation.
3. It sends the prompt to the model.
4. It returns the reply plus the phones the reply names, at most three, as `{ reply, phones }`, so the window and the page can show the phones under the answer.

Nobody has to use the assistant. Every feature is reachable through search, filters and buttons.

### Reviews

A logged in user writes a review with a rating from 1 to 5 and text. The page sends it to `POST /api/phones/:slug/reviews`. One person can review a phone once, and a second review of the same phone is refused. The backend stores the review with a sentiment of positive, neutral or negative. With the AI settings filled, the model reads the text and judges the sentiment. Otherwise the stars set it: 4 or 5 is positive, 3 is neutral, 1 or 2 is negative.

`GET /api/phones/:slug/review-summary` returns a short summary and the overall sentiment. With the AI settings filled, the model reads the newest reviews and writes one or two sentences about what people like and dislike. The backend stores that summary on the phone and reuses it until a new review arrives. Without the model, and with no saved summary for the current number of reviews, the summary is star based: the number of reviews and the average rating.

### Login

Login uses email and password.

1. On register, the browser sends name, email and password to `POST /api/auth/register`. The backend stores the password as a bcrypt hash. We never store the password itself.
2. On login, the browser sends email and password to `POST /api/auth/login`. The backend checks the password against the hash and, if it matches, returns a JWT token and the user. The token expires after seven days.
3. The browser sends the token with every request in the header `Authorization: Bearer <token>`. The backend reads the token to know which user is asking. A protected route refuses a request without a valid token.
4. `GET /api/auth/me` returns the logged in user. The browser calls it once when the app loads with a stored token, so the visitor stays logged in after a reload.

### Password reset

A visitor who forgets their password gets a new one in three steps.

1. Request. On the Forgot password page the visitor enters their email. The browser sends it to `POST /api/auth/forgot-password`. For any valid email the backend answers `{ sent: true }`, whether or not it has an account, so nobody can use this page to find out which emails have an account. One address can ask five times every 15 minutes.
2. Email with a one hour link. When the email belongs to a user, the backend creates a random token, stores a hash of it and an expiry one hour ahead in the `passwordReset` field of the user, and sends an email through Nodemailer. The email holds a link to `<CLIENT_URL>/reset-password/<token>`. The mail settings live in `server/.env`. While they are empty, the backend prints the link in its terminal instead of sending an email, so we can test the flow without a mail account.
3. New password. The link opens the Reset password page. The visitor types the new password twice. The browser sends `{ token, password }` to `POST /api/auth/reset-password`. The backend hashes the token, finds the user with that hash, checks that the expiry has not passed, stores the new bcrypt hash, clears `passwordReset` and answers `{ ok: true }`, so the link works once. An invalid or expired token gets a 400 answer, and the page offers the Forgot password page again.

### Favourites, recently viewed and the dashboard

The Dashboard page needs login. It calls `GET /api/users/me/dashboard` and gets four blocks back.

1. Recently viewed: the phones the user opened, newest first, capped at 20. `GET /api/phones/:slug` records each one when the user is logged in.
2. Favourites: the phones the user saved, the latest first. The browser adds one with `POST /api/users/me/favourites/:slug` from the phone page and removes one with `DELETE /api/users/me/favourites/:slug` from the dashboard. Both return the new favourites list.
3. Search history: the user's searches, newest first, capped at 50. Search fills it in.
4. Last recommendations: the phones and reasons from the user's last recommendation. Recommend fills it in.

In the browser, the route `/dashboard` sits behind a login guard. A logged out visitor who opens it is sent to the Log in page and comes back after logging in.

### The nightly price check and the price trend

The price check is a `node-cron` job inside the backend. Its schedule comes from `PRICE_UPDATER_CRON` in `server/.env`. The default is `0 2 * * *`, which means 02:00 every day, Lagos time. Each run does the same steps.

1. Read the price list in `server/data/prices.json`: the date of the check and a guide price in US dollars for each phone slug on it.
2. For each phone on the list whose last check is older than that date, set `price.current` and `price.updatedAt`.
3. Append `{ price, date, source: "manual" }` to the phone's `priceHistory`.
4. Skip a phone whose last check is already on or after that date, so a second run of the same list changes nothing.
5. Print a summary of the run: how many prices changed, how many stayed the same and how many were skipped.

We can also run the job once by hand with `npm run prices` from the `server` folder. Each history entry records where its price came from: `seed` from the phone file, `manual` from the price list, and `ai` for the first price of a phone the model added.

The price trend is computed from the stored history. The backend takes the latest price and compares it with the oldest price in the 90 days before it. Two percent lower or more is `falling`, two percent higher or more is `rising`, and anything in between is `stable`. A one line suggestion about the best time to buy goes with it. With fewer than two prices the trend is `stable` and the suggestion says there are not enough price checks yet. This is a trend calculation from stored prices, not a forecast model. `GET /api/phones/:slug/price-trend` returns the history, the trend and the suggestion.

## Folder layout

The root holds `client/`, `server/`, `docs/`, `README.md`, `.gitignore` and `.github/CODEOWNERS`. One line per folder:

- `client/`: the React app, a Vite project in JavaScript with `react-router-dom`, `bootstrap`, `axios`, `recharts` and `react-icons` installed.
- `client/public/brand/`: the logo files and favicons.
- `client/public/phones/`: where the phone pictures go, one PNG per phone named after its slug.
- `client/src/styles/`: `theme.css`, the one file with every colour, spacing value, font size, corner radius and shadow the pages use, and `global.css` with the page shell, the top bar, the footer, the chat window, the phone card, the phone picture and the breakpoints.
- `client/src/services/`: `api.js` and one file per endpoint group. Pages call these functions and nothing else.
- `client/src/context/`: `AuthContext.jsx` for the logged in user, `CompareContext.jsx` for the compare list and `ChatContext.jsx` for the assistant conversation.
- `client/src/hooks/`: `useAsync.js`, which gives every page its loading, data and error state.
- `client/src/data/`: `mockPhones.js`, six sample phones, reviews and a review summary for building a page before it is connected to the backend.
- `client/src/components/shared/`: the layout, the top bar with the account menu, the footer, the assistant button, the chat window, the phone card, the phone picture and the other pieces every page uses.
- `client/src/components/ibrahim/` and `client/src/components/osakue/`: the components each teammate owns.
- `client/src/pages/`: one folder per page with the page file, its stylesheet and a README that says what to build.
- `server/`: the Express backend. `src/index.js` starts the server, mounts `/api/auth`, `/api/phones`, `/api/ai`, `/api/users` and `GET /api/health`, and starts the nightly price check.
- `server/src/config/`: `env.js`, which reads every setting once, and `db.js`, which connects to MongoDB Atlas.
- `server/src/models/`: the Mongoose models `Phone.js`, `User.js`, `Review.js` and `SearchLog.js`, one per collection.
- `server/src/routes/`: one route file per URL group. Each maps a URL to its middleware and its controller.
- `server/src/controllers/`: the code that runs for each route.
- `server/src/middleware/`: `auth.js` checks the login token and `error.js` handles errors. Each controller checks its own input.
- `server/src/services/`: `ai.service.js` talks to the model, `phoneQuery.js` builds the phone query for MongoDB, `recommend.service.js` builds and scores the recommendation shortlist, `price.service.js` computes the trend, `review.service.js` gives the star based sentiment and summary, and `mail.service.js` sends the password reset email.
- `server/src/utils/`: `http.js` for the envelope, `jwt.js` for the tokens, `password.js` for the hashes and the reset tokens, and `slug.js` for the phone slugs.
- `server/src/jobs/`: `priceUpdater.js`, the nightly price check.
- `server/scripts/`: `seed.js` loads the phones into the database and `runPriceUpdate.js` runs the price check once.
- `server/data/`: `phones.json` with our 60 phones, `prices.json` with the price list, and a `README.md` about the phone file.
- `docs/`: these documents. The finished designs are in `docs/ui/` and the diagrams go in `docs/diagrams/`.

`server/.env.example` and `client/.env.example` list the settings each side needs. We copy each to `.env` in the same folder and fill it in, as [INSTALLATION.md](INSTALLATION.md) shows.

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

`data` holds the result of the request. `error.message` says what went wrong, in words the page can show as they are.

Three rules go with the envelope.

1. Every address starts with `/api`. Example: `GET /api/health` returns `{ "ok": true, "data": { "status": "up" } }`.
2. Protected routes need the header `Authorization: Bearer <token>`.
3. An address with no route answers 404 with "No route for", the method and the path. Every endpoint and its messages are in [API.md](API.md).

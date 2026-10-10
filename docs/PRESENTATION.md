# Presentation notes

These notes explain CellSense AI from the client to the backend, then list the questions the judges are likely to ask with our answers.

## What the project is

CellSense AI is a phone information website for ASKME Ltd. People search phones in plain words, read specs and guide prices, compare up to three phones, get a recommendation for their budget and ask an assistant about phones. It replaces the five questions that fill most of ASKME's support calls. The stack is React 19 with Vite on the client, Node 20 with Express 5 on the server, and MongoDB Atlas for the data.

The sections below follow one action through the whole project, from a click in the browser to the database and back.

## The client

The client lives in `client/`. `main.jsx` loads Bootstrap and our styles and wraps the app in the router and three providers. `App.jsx` holds the route table, and every page sits inside `Layout`, which draws the top bar, the page, the footer, the chat button and the floating chat window.

- **Pages** live in `client/src/pages/`, one folder per page with its JSX, its CSS and a README. Each page reads the address, calls a service and shows a loader, an error with Try again, an empty state or the result.
- **Components** live in `client/src/components/`. The shared ones, such as `PhoneCard`, `PhoneImage`, `Loader` and `EmptyState`, are used on many pages. The `ibrahim` and `osakue` folders hold the parts of each person's pages, such as the filter strip, the spec table, the compare table and the account card.
- **Contexts** keep state that more than one page needs. `AuthContext` holds the logged in user, `CompareContext` holds up to three phones to compare and saves them in the browser, and `ChatContext` holds one conversation shared by the Assistant page and the floating chat window.
- **Services** are the only files that talk to the server. `api.js` is one axios instance that adds the login token to every request, opens the response envelope and turns any failure into a plain message. `phones.service.js`, `ai.service.js`, `auth.service.js` and `users.service.js` hold one function per endpoint.
- **Styles** come from `theme.css`, where every colour, size, spacing and radius is a `--cs-` variable, and `global.css`, which styles the shared pieces.

In development the client runs on port 5173 and Vite sends every request that starts with `/api` to the server on port 5000, so the browser only ever talks to one address.

## The trip of a request

Take a search for "phone under $400 with a great camera" as the example.

1. The search bar sends the person to `/search?q=...`. The Search results page reads `q` and calls `searchPhones` in `ai.service.js`.
2. `api.js` posts the query to `/api/ai/search` and adds the token if the person is logged in.
3. On the server, `index.js` passes the request through Helmet for security headers, CORS for the client address, the JSON reader with a 1 MB limit, the request log and a limit of 300 requests every 15 minutes.
4. The router for `/api/ai` checks its own limit of 20 requests a minute and hands the request to the controller.
5. A plain brand or model name is matched straight against the database. A sentence like this one goes to `ai.service.js`, the only file that calls the model, which turns it into filters such as a price limit and a camera need. If the search names a real phone we do not have, the model supplies its specs and the phone is saved marked as estimated. If the AI settings are empty, every search is matched directly.
6. `phoneQuery.js` turns the filters into one MongoDB query, and Mongoose runs it against the phones collection on MongoDB Atlas.
7. The controller logs the search, saves it to the person's search history when they are logged in, and answers with `{ ok: true, data }`.
8. Back in the browser, `api.js` unwraps `data`, and the page shows the "Understood as" chips and the phone cards.

Every other feature follows the same path with its own service, route and controller.

## The backend

The server lives in `server/` and runs on Node 20 with Express 5.

- **`config/`** reads every setting from `.env` once and connects to MongoDB Atlas.
- **`routes/`** maps each address to a controller and adds the login check and the limits where they are needed.
- **`controllers/`** read the request, call the services and the models, and send the answer.
- **`services/`** hold the rules: the AI calls, the database query builder, the recommendation shortlist and its reasons, the price trend, the review mood and summary, the security check and the emails.
- **`models/`** describe the five collections: phones, users, pending sign ups, reviews and search logs.
- **`middleware/`** holds `requireAuth` and `optionalAuth`, which read the JWT from the `Authorization` header, and the error handler, which turns every error into `{ ok: false, error: { message } }`.
- **`jobs/priceUpdater.js`** runs every night at 2 am. It reads `server/data/prices.json` and adds each new guide price to the phone's price history.

## Logging in

Create account posts the details and a Cloudflare Turnstile token to `/api/auth/register`. The server checks the token, keeps a pending sign up with the password hashed by bcrypt, and emails a 6 digit code through Resend. The Verify email page posts the code, and only then is the account created. Verify email and Log in get back a JWT that lasts seven days with the user. `AuthContext` saves the token in the browser and `api.js` sends it with every request after that. The Dashboard and the Profile page sit behind `ProtectedRoute`, which sends a visitor to Log in and brings them back afterwards. A forgotten password sends an email with a reset link that works once and for one hour.

## The AI features

Search, the assistant, the recommendation ranking, the phone summary and the review summary all go through `server/src/services/ai.service.js`. It calls a pre trained language model through an OpenAI compatible chat API. The assistant gets our own phone data with each question, so its answers stay on the phones we hold. When the model is not set up, each feature falls back to our own rules and the site keeps working.

## Questions the judges may ask

**Did you build or train your own AI model?**
No. We integrate a pre trained language model and call it through an OpenAI compatible chat API. All the calls sit in one file, `server/src/services/ai.service.js`, so the provider can be changed through the settings without touching the rest of the code.

**What happens if the AI service is down or not set up?**
The site keeps working. Search matches brand and model names directly, recommendations and review summaries fall back to our own rules, and the assistant says the AI features are not set up.

**How do you stop the assistant from making things up?**
Every question is sent to the model together with our own phone data, and the model is told to answer from that data only. The phones it mentions are shown as cards from our database, with real prices and links.

**What is an estimated phone?**
When someone searches for a real phone we do not hold, the model supplies its specs and a guide price. We save it with the source set to `ai` and show an Estimated label on it, so nobody mistakes it for checked data.

**Where do the phones and prices come from?**
We hold 60 phones, 12 each for Samsung, Apple, OnePlus, Xiaomi and Vivo, loaded by `npm run seed`. A price check runs every night at 2 am from `server/data/prices.json` and adds each new guide price to the phone's history. Every price is shown with the date it was checked.

**How does the price trend work?**
The server compares the latest price with the earlier ones. A drop past a set threshold reads as falling, a rise reads as rising, and anything else reads as stable. Each trend comes with a best time to buy note.

**How does the recommendation work?**
The five answers become needs. Our own rules pick a shortlist inside the budget and score each phone on the needs. If too few phones fit, the budget is stretched a little and the page says so. The model then ranks the top three and explains each one. Without the model, the reasons come from our rules.

**How does Compare decide the best value?**
The server marks the winner of each row: the lowest price and the highest RAM, storage, cameras, battery, screen size and refresh rate. The client shows that value in bold. The compare list holds up to three phones and is kept in the browser, so it survives a reload.

**How are passwords and accounts kept safe?**
Passwords are hashed with bcrypt and never stored as text. Login returns a JWT that lasts seven days and is checked on every protected request. A reset link uses a random token whose SHA 256 hash is stored, and it works once and for one hour. Forgot password has its own rate limit, so nobody can flood an inbox. A new account needs the Turnstile check and the code from its email, and the code allows five tries. Changing the password ends every other login.

**What other security measures are there?**
Helmet sets the security headers, CORS only accepts our client address, request bodies are capped at 1 MB, all `/api` requests are limited to 300 every 15 minutes, and the AI routes to 20 a minute. Mongoose validates the data, and every error goes back as a plain message without internal details.

**Why MongoDB and not a SQL database?**
A phone is one document with nested specs, a price and a price history. MongoDB stores it the way the site reads it, so one query returns everything a page needs. Atlas gives us a hosted database without running a server ourselves.

**Why React with Vite?**
React lets us build each page from small shared parts such as the phone card, and Vite gives a fast development server and a small production build. The Vite proxy sends `/api` to the server, so the browser talks to one address.

**Does it work on a phone screen?**
Yes. Every page is checked at 1280px and under 768px. The top bar collapses into a menu, the grids drop to fewer columns and wide tables scroll sideways.

**How did the team split the work?**
Gerald built the backend, the database, the AI features, the shared client files and the docs. Ibrahim built Home, Search results, Browse, Phone detail and About. Osakue built Compare, Recommend, Assistant, Dashboard and the four account pages. Every change went through a pull request that Gerald reviewed.

**How did you test it?**
The test cases with their expected results are in `docs/TEST-DATA.md`. We ran each page against the real server and checked the loading, empty and error states, the login guard on the Dashboard and the limits on the API.

**What would you add next?**
Live prices from retailers instead of a price list, more brands, phone pictures for every model, alerts when a saved phone drops in price, and automated tests that run on every pull request.

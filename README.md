# CellSense AI Portal

CellSense AI Portal, called CellSense AI, is a phone information website built for ASKME Ltd. People use it to search phones in plain words, read specs and guide prices, compare phones side by side, get a recommendation for their budget and ask an assistant questions about phones.

This is our eProject for the Advanced Diploma in Software Engineering (ADSE) at Aptech NG. The brief is the Semester 1 eProject and we are building it now that we have entered Semester 2.

## The problem

ASKME Ltd. answers customer questions over the telephone. Most of the calls are about phones, and most of them are the same five questions: which phone has a certain feature, what the specs of a phone are, what it costs today, how two phones differ, and which phone is the best for a budget. Answering thousands of those calls by hand costs support time, staff and money. CellSense AI answers the same questions on a website, so people get the answer themselves and nobody has to call.

## What the site does

1. Smart search. A brand or a model name is matched directly. A sentence such as "phone under $400 with a great camera" goes to the model, which turns it into filters for the same database search. When the search names a real phone we do not have, the model supplies its specifications and the site shows it marked as estimated.
2. Browse by brand, price range and features, sorted by date or price, 24 phones a page.
3. A page for every phone: the specs, the guide price with the date it was checked, a plain English summary written by the model, the price history chart, and Save to favourites.
4. Side by side comparison of two or three phones, with the best value marked in each row.
5. Recommendations from five quick questions: our own rules pick a shortlist inside the budget, and the model ranks the top three and explains each one.
6. The assistant: a chat page and a floating chat window on every other page, sharing one conversation, answering from our own phone data.
7. A personal dashboard with recently viewed phones, favourites, search history and the last recommendations.
8. Price history with a trend, falling, rising or stable, and a best time to buy note. A price check runs every night and adds each new guide price to the history.
9. Reviews with a mood for each review and a short summary of all of them, written by the model.

Accounts use email and password. A new account exists only after the person passes a Cloudflare Turnstile security check and types the 6 digit code we email them, and a forgotten password is reset through a link sent by email that works once and for one hour. A Profile page lets a person change their name or password, clear their history, log out their other devices and delete the account. Without the AI settings the site still runs: search is direct only, recommendations and review summaries fall back to our own rules, and the assistant says the AI features are not set up.

## How it is built

The site runs in the browser and asks our server for everything it shows. The server keeps the phones, users, pending sign ups, reviews and search logs in MongoDB and calls a pre trained language model through an OpenAI compatible chat API when a feature needs it. We integrate the model; we do not train or build one.

Stack: React 19 with Vite, React Router, Bootstrap 5 and plain CSS; Node 20 with Express 5; MongoDB Atlas with Mongoose; JWT login with bcrypt; an OpenAI compatible chat API, for which we use Groq with the model `openai/gpt-oss-120b`; `node-cron` for the nightly price check; Resend for the emails; Cloudflare Turnstile for the security check on Create account.

## How to run it

The full steps for a Windows laptop are in [`docs/INSTALLATION.md`](docs/INSTALLATION.md). In short: fill `server/.env`, run `npm install` and `npm run dev` in `server`, then `npm install` and `npm run dev` in `client`, and open `http://localhost:5173`. The backend runs on port 5000 and the client sends every `/api` request to it through the Vite proxy.

## The live site

The frontend is published on GitHub Pages at `https://geraldxtra.github.io/cellsenseai/` and the backend runs on Render.

## The docs

The finished designs are in [`docs/ui/`](docs/ui/), one image per page state, and the report diagrams go in `docs/diagrams/`.

## The team

- Gerald, project lead. The backend and the database, the AI features, the phone data and pictures, the shared client files (the routes, the theme, the services, the contexts, the hooks and the shared components, including the chat window, the security check and Page not found), the Verify email and Profile pages, the docs and the diagrams. Gerald reviews and merges every pull request.
- Ibrahim. Home, Search results, Browse, Phone detail and About, with eight components: SearchBar, UnderstoodChips, FilterStrip, BrandTabs, SortSelect, SpecTable, PriceHistoryChart and NoticeBar.
- Osakue. Compare, Recommend, Assistant, Dashboard, Log in, Create account, Forgot password and Reset password, with eight components: CompareTable, CompareSlots, AddPhoneDialog, RecommendForm, ChatThread, ChatInput, ReviewsSection and AuthCard.

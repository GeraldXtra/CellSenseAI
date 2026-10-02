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

Accounts use email and password, and a forgotten password is reset through a link sent by email that works once and for one hour. Without the AI settings the site still runs: search is direct only, recommendations and review summaries fall back to our own rules, and the assistant says the AI features are not set up.

## How it is built

The site runs in the browser and asks our server for everything it shows. The server keeps the phones, users, reviews and search logs in MongoDB and calls a pre trained language model through an OpenAI compatible chat API when a feature needs it. We integrate the model; we do not train or build one.

Stack: React 19 with Vite, React Router, Bootstrap 5 and plain CSS; Node 20 with Express 5; MongoDB Atlas with Mongoose; JWT login with bcrypt; an OpenAI compatible chat API, for which we use Groq with the model `openai/gpt-oss-120b`; `node-cron` for the nightly price check; Nodemailer for the reset email.

## How to run it

The full steps for a Windows laptop are in [`docs/INSTALLATION.md`](docs/INSTALLATION.md). In short: fill `server/.env`, run `npm install` and `npm run dev` in `server`, then `npm install` and `npm run dev` in `client`, and open `http://localhost:5173`. The backend runs on port 5000 and the client sends every `/api` request to it through the Vite proxy.

## The docs

Everything about the project is in [`docs/`](docs/):

- [`API.md`](docs/API.md): every endpoint, who can call it, what it takes and returns, its messages and the rate limits.
- [`ARCHITECTURE.md`](docs/ARCHITECTURE.md): how the parts of the site work together, flow by flow.
- [`ASSUMPTIONS.md`](docs/ASSUMPTIONS.md): the fifteen assumptions that go into the ReadMe.doc.
- [`BACKEND.md`](docs/BACKEND.md): the server folder by folder, how a request travels, every setting, the nightly price check and the scripts.
- [`COMPONENTS.md`](docs/COMPONENTS.md): every shared component, context, hook and service function, and each teammate's components.
- [`DATA-FLOW.md`](docs/DATA-FLOW.md): the contract for each page: what to call, what comes back and what to show.
- [`DATA-MODEL.md`](docs/DATA-MODEL.md): every field of the four collections, and the slug rule.
- [`DELIVERABLES.md`](docs/DELIVERABLES.md): what we hand in, who prepares it and where it comes from.
- [`DESIGN-SPECIFICATIONS.md`](docs/DESIGN-SPECIFICATIONS.md): the stack, the site map, the pages, the theme values, the AI integration and the security measures.
- [`DIAGRAMS.md`](docs/DIAGRAMS.md): the diagrams for the report, with their captions.
- [`INSTALLATION.md`](docs/INSTALLATION.md): setting up and running the site on a Windows laptop.
- [`OWNERSHIP.md`](docs/OWNERSHIP.md): who owns every file in `client/` and `server/`.
- [`PROBLEM-DEFINITION.md`](docs/PROBLEM-DEFINITION.md): the problem, the objectives, the scope and the users.
- [`REPORT-OUTLINE.md`](docs/REPORT-OUTLINE.md): the sections of the final report and where each one comes from.
- [`ROADMAP.md`](docs/ROADMAP.md): what is done and what is left, with the owner of each item.
- [`ROUTES.md`](docs/ROUTES.md): every route, every click and the endpoints each page calls.
- [`STYLING.md`](docs/STYLING.md): the theme variables, the shared classes, the breakpoints and how phone pictures are sized.
- [`TEAM-GUIDE.md`](docs/TEAM-GUIDE.md): how the team works: branches, pull requests, the rules and each page.
- [`TEST-DATA.md`](docs/TEST-DATA.md): the test cases with their expected results.

The finished designs are in [`docs/ui/`](docs/ui/), one image per page state, and the report diagrams go in `docs/diagrams/`.

## The team

- Gerald, project lead. The backend and the database, the AI features, the phone data and pictures, the shared client files (the routes, the theme, the services, the contexts, the hooks and the shared components, including the chat window and Page not found), the docs and the diagrams. Gerald reviews and merges every pull request.
- Ibrahim. Home, Search results, Browse, Phone detail and About, with eight components: SearchBar, UnderstoodChips, FilterStrip, BrandTabs, SortSelect, SpecTable, PriceHistoryChart and NoticeBar.
- Osakue. Compare, Recommend, Assistant, Dashboard, Log in, Create account, Forgot password and Reset password, with eight components: CompareTable, CompareSlots, AddPhoneDialog, RecommendForm, ChatThread, ChatInput, ReviewsSection and AuthCard.

Who owns every single file is in [`docs/OWNERSHIP.md`](docs/OWNERSHIP.md).

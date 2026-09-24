# Team guide

Ibrahim, Osakue, this guide is for the two of you. I wrote it so you can clone the repo, open your page folder and start building without asking me where anything is. It says what we are building, who builds what, how to start, the rules we work by, what to check before a pull request, and what each page must contain. The other docs are linked where they give more detail.

## What we are building

We are building CellSense AI Portal, called CellSense AI, for ASKME Ltd. It is our eProject for the Advanced Diploma in Software Engineering (ADSE) course at Aptech NG. The brief is the Semester 1 eProject and we are building it now that we have entered Semester 2.

ASKME Ltd. answers customer questions by telephone. A large share of the calls are the same five phone questions. Customers ask which model has a specific feature, what the specifications of a phone are, and what the current price is. They also ask how one phone differs from another, and which phone is best within a budget. Handling thousands of these calls by hand costs support time, staff and money. Ordinary phone websites show static specs and do not help people decide.

CellSense AI is a responsive single page web application that answers those questions itself. The site has nine features.

1. Smart search that understands plain words such as "phone under $400 with a great camera".
2. Browse by brand, price range and features.
3. Phone pages with the specs, the price with the date it was checked, a plain English summary and the price history.
4. Side by side comparison of two or three phones with the best value marked in each row.
5. Recommendations: five quick questions, then the three phones that fit with a reason each.
6. The assistant, a chat page that answers from our own phone data, and a small floating chat window that opens from every page.
7. A personal dashboard with recently viewed phones, favourites, search history and the last recommendations.
8. Price history with a trend (falling, rising or stable) and a best time to buy note.
9. Reviews with a short summary.

The AI parts work like this, and this is the only way we describe them: we integrate a pre trained language model through an OpenAI compatible API. The model does the natural language understanding for search and the assistant, ranks the recommendation shortlist and explains its choices, writes the summaries and summarises reviews. We do not train or build a model. When you write about it in a README or a pull request, say "the model", "we call the model", "we use the model".

Our stack: React 19 with Vite, React Router, Bootstrap 5 and plain CSS in `client/`; Node 20 with Express 5 in `server/`; MongoDB Atlas with Mongoose; JWT login with bcrypt; an OpenAI compatible chat API; `node-cron` for the nightly price check; Nodemailer for the password reset email. The client runs on port 5173 and the server on port 5000. The docs live in `docs/`. [ARCHITECTURE.md](ARCHITECTURE.md) explains how the parts talk to each other.

## Who builds what

I am the lead. I own the repo, the backend, the database, the AI features, the shared client files, the documentation, the diagrams, and I review and merge every pull request. I work on the branch `backend`.

| Area | Owner | Branch | Where |
| --- | --- | --- | --- |
| Backend, database, AI features, price updater, password reset | Gerald | `backend` | `server/` |
| Shared client files: routes, theme, services, contexts, hooks, sample data, shared components, Page not found | Gerald | `backend` | `client/src/App.jsx`, `client/src/main.jsx`, `client/src/styles/`, `client/src/services/`, `client/src/context/`, `client/src/hooks/`, `client/src/data/`, `client/src/components/shared/`, `client/src/pages/NotFound/` |
| Home, Search results, Browse, Phone detail, About | Ibrahim | `ibrahim` | `client/src/pages/Home/`, `SearchResults/`, `Browse/`, `PhoneDetail/`, `About/` and `client/src/components/ibrahim/` |
| Compare, Recommend, Assistant, Dashboard, Log in, Create account, Forgot password, Reset password | Osakue | `osakue` | `client/src/pages/Compare/`, `Recommend/`, `Assistant/`, `Dashboard/`, `Login/`, `Register/`, `ForgotPassword/`, `ResetPassword/` and `client/src/components/osakue/` |
| Documentation, diagrams, reviews and merges | Gerald | `backend` | `docs/` |

The split is even by weight, not by page count. Ibrahim, your five pages are the heavy browsing pages: search, filters, the spec table and the chart. Osakue, your four account pages share one AuthCard component and are small, and your weight is in Compare, Recommend, Assistant and Dashboard. Ibrahim, you own eight components. Osakue, you own nine, the ninth being ChatWindow, the floating chat window. The full list with the pages that use each one is in [COMPONENTS.md](COMPONENTS.md). The owner of every file is in [OWNERSHIP.md](OWNERSHIP.md).

## How to start

1. Clone the repo and go into it.
2. `git checkout develop` and `git pull`, so you start from the latest merged work.
3. `git checkout <your branch>`: `ibrahim` or `osakue`.
4. `cd client`, then `npm install`, then `npm run dev`. Open `http://localhost:5173`. Every page already shows with the top bar and the footer; a page that is not built yet shows only its name.
5. Open your page folder under `client/src/pages/` and read its `README.md`. It says what must be on the page, which components and services to use, what the sample data is, and what states to handle.
6. Open the matching image in `docs/ui/`. The README names it. The image is the source of truth for layout and text.
7. Read [STYLING.md](STYLING.md) (the theme variables and where you see them), [COMPONENTS.md](COMPONENTS.md) (what to reuse), [DATA-FLOW.md](DATA-FLOW.md) (how a page gets data) and [ROUTES.md](ROUTES.md) (every route and every click).
8. Build the page in `<Page>.jsx` with its styles in `<Page>.css`. Import the css file at the top of the page file.

You do not need the server running to build your pages. Every page runs on `client/src/data/mockPhones.js` until the endpoint is ready, and I tell you when to switch.

## The rules

1. A page is done when it matches its image in `docs/ui/` at 1280px. Then it must also work at 375px and 768px. The page never scrolls sideways. Wide tables scroll inside their own box.
2. Every colour, spacing, font size, corner radius and shadow comes from `client/src/styles/theme.css`. Never type a hex code or a pixel value into a component. If a value is missing, do not invent one: send me the image and the element and I add it to the theme.
3. Use the shared components in `client/src/components/shared/`: Layout, Navbar, AccountMenu, Footer, ChatLauncher, PhoneImage, PhoneCard, Loader, EmptyState and ProtectedRoute. Never make a second version of one. If a shared component needs a new prop, ask me.
4. Shared files, services and context are changed only by me. That is everything in `client/src/styles/`, `client/src/services/`, `client/src/context/`, `client/src/hooks/`, `client/src/data/`, `client/src/components/shared/`, plus `App.jsx`, `main.jsx`, `index.html` and `vite.config.js`. If you need something changed there, ask me and I do it on `backend`.
5. All data comes through the functions in `client/src/services/`. Never call fetch or axios inside a page or a component.
6. Until an endpoint is ready, use `client/src/data/mockPhones.js`. It has the exact shape the API returns.
7. Every page handles three states: loading, empty and error. `useAsync` in `client/src/hooks/useAsync.js` gives you all three.
8. Buttons use the Bootstrap classes `btn btn-primary` and `btn btn-outline-primary`, which the theme restyles, so every button has the same shape. Icons come only from `react-icons/fi`.
9. You work on your own branch and open a pull request into `develop`. I review and merge. Nobody pushes to `main`.
10. Commit small and often, with messages that say what changed, for example "Browse: brand tabs and filter strip".

## Checklist before a pull request

Go through these eight points before you open a pull request into `develop`.

1. The page works at 375px, 768px and 1280px and never scrolls sideways. Wide tables scroll inside their own box.
2. No hex codes or pixel values outside `client/src/styles/theme.css`.
3. The page sits inside the shared layout and uses the shared components.
4. The loading, empty and error states exist.
5. Data comes from `src/services` or `src/data/mockPhones.js`, never from fetch or axios inside a page.
6. No errors in the browser console.
7. Screenshots at phone size and desktop size are attached to the pull request.
8. Matches the image at 1280px.

## Page by page

All endpoints sit under `/api`, so `GET /phones` is served at `/api/phones`. Every response uses the same envelope: `{ "ok": true, "data": { } }` on success and `{ "ok": false, "error": { "message": "..." } }` on failure. `api.js` unwraps it, so the service functions give you `data` directly. Endpoints marked (login) need the token, which `api.js` adds for you. Right now the route files hold no routes, so every endpoint except `GET /api/health` answers 404. Until an endpoint is ready, a page runs on `client/src/data/mockPhones.js`. Every endpoint is described in full in [API.md](API.md) and every click on every page in [ROUTES.md](ROUTES.md). The README in each page folder repeats the part that matters for that page.

### Home (Ibrahim)

* Route: `/`
* Designs: `home-page.png`, `home-page-logged-in.png`
* Must have: the headline, the sub line, SearchBar with the three example searches, the three hero pictures, the "Compare side by side" band with the small table and "Open compare", the "Ask the assistant" band with the sample exchange and "Open the assistant", and the five brand cards.
* Calls: `listPhones({ limit: 3 })` for the hero pictures, which returns `{ items, total, page, pages }`; `comparePhones(["samsung-galaxy-s24", "xiaomi-redmi-note-13-pro"])` for the teaser table, which returns `{ phones, best }`.

### Search results (Ibrahim)

* Route: `/search?q=`
* Designs: `search-result.png`, `search-no-results.png`, `search-added-by-assistant.png`
* Must have: SearchBar with the query, "Understood as" with UnderstoodChips, the count heading, the Filters link that scrolls to FilterStrip, SortSelect, FilterStrip above the results, the PhoneCard grid, the no results card, and the NoticeBar with the Estimated label when the assistant added a phone.
* Calls: `searchPhones(query)` returns `{ items, filters, source }`. `source` is `direct` when the words matched a brand or model, `ai` when the model turned the sentence into filters. The chips show `filters`. A phone with `source` set to `ai` in its record gets the notice and the Estimated label. Apply, a chip x and the sort call `listPhones(params)`.

### Browse (Ibrahim)

* Routes: `/browse` and `/browse/:brand`
* Design: `browse.png`
* Must have: the heading, BrandTabs, FilterStrip, SortSelect, the brand heading with the count, the PhoneCard grid. The brands are Samsung, Apple, OnePlus, Xiaomi and Vivo.
* Calls: `listPhones(params)` with `brand`, `minPrice`, `maxPrice`, `has5G`, `minRam`, `minStorage`, `minCamera`, `minBattery`, `minRefresh`, `category`, `q`, `sort` (`newest`, `priceAsc` or `priceDesc`), `page` and `limit` (max 50). It returns `{ items, total, page, pages }`. On `/browse/:brand` the brand from the URL goes into `brand`. The URL is lowercase and the server matches it ignoring case.

### Phone detail (Ibrahim, with Osakue's ReviewsSection)

* Route: `/phones/:slug`
* Designs: `phone-detail.png`, `phone-detail-reviews.png`
* Must have: the breadcrumb, the picture, brand, name, price, "Guide price, checked <date>", the orange trend note when the trend is falling, the "In plain words" box, Add to compare, Save to favourites, SpecTable, PriceHistoryChart with its caption, and the reviews block. Osakue, the reviews block is yours: build it as ReviewsSection and Ibrahim places `<ReviewsSection slug={slug} />` where the design shows it.
* Calls: `getPhone(slug)` returns `{ phone }` and records the phone in recently viewed when logged in. `getPriceTrend(slug)` returns `{ history, trend, suggestion }`. `getReviews(slug)` returns `{ items, average, count }`. `getReviewSummary(slug)` returns `{ summary, sentiment }`. `addReview(slug, { rating, text })` (login) returns `{ review }`. `addFavourite(slug)` (login) returns `{ favourites }`.

### About (Ibrahim)

* Route: `/about`, with the anchors `#about`, `#askme`, `#how-prices-work` and `#contact` that the footer links to
* Design: `about.png`
* Must have: the heading, the sub line, the picture, and the four bands with their text.
* Calls: none.

### Compare (Osakue)

* Route: `/compare`, and `/compare?ids=a,b,c` for a shared link
* Designs: `compare.png`, `compare-one-phone.png`, `compare-add-phone.png`
* Must have: the heading and sub line, CompareSlots, CompareTable with the best cell bold, the Verdict card, the one phone state with "Browse phones", and AddPhoneDialog. The page reads its phones from `useCompare`, which also accepts `?ids=` in the URL. "Add a phone" opens AddPhoneDialog, which searches with `listPhones({ q })`.
* Calls: `comparePhones(slugs)` returns `{ phones, best }`. `listPhones({ q })` in the dialog.

### Recommend (Osakue)

* Route: `/recommend`
* Design: `recommend.png`
* Must have: the heading and sub line, RecommendForm, and "Your top 3" with three PhoneCards with rank, price and reason and no Compare checkbox.
* Calls: `recommend({ budget, brand, purpose, camera, gaming, battery, performance })` returns `{ items: [{ phone, reason }] }`. The result is saved to the dashboard of a logged in user.

### Assistant (Osakue)

* Route: `/assistant`
* Designs: `assistant.png`, `assistant-empty.png`, `assistant-window.png`
* Must have: the heading and sub line, ChatThread with the bubbles, the phone cards under a reply and the typing dots, ChatInput, the three suggestion links, and the empty state with the three suggestion chips. The messages come from `useChat()` in ChatContext (mine), so this page shows the same conversation as the floating chat window.
* The window: the launcher button on every other page opens ChatWindow, a small floating chat over the page, about 380 by 560, bottom right, over the page without moving it, with an x to close and an "Open full page" link to this page. It is hidden on `/assistant`. Osakue, you build it from ChatThread and ChatInput, and it reads its messages and its open state from `useChat()` too, so the conversation survives moving between pages.
* Calls: `chat(messages)` with the full history `[{ role, content }]` returns `{ reply, phones }`. ChatContext calls it inside `send(text)`; the page and the window only call `send`.

### Dashboard (Osakue)

* Route: `/dashboard` (login)
* Designs: `dashboard.png`, `dashboard-new-account.png`
* Must have: the heading and "Signed in as <name>", Recently viewed, Favourites, Search history, Recommended for you, and the empty state of each block.
* Calls: `getDashboard()` (login) returns `{ recentlyViewed, favourites, searchHistory, recommendations }`. `removeFavourite(slug)` (login) returns `{ favourites }`.

### Log in (Osakue)

* Route: `/login`, with `?next=` for the page that asked for login
* Design: `log-in.png`
* Must have: AuthCard with the email and password fields, "Forgot password?", the Log in button and "New here? Create an account".
* Calls: `login({ email, password })` from `useAuth` returns the user and stores the token. `GET /auth/me` runs on load through AuthContext, you do not call it.

### Create account (Osakue)

* Route: `/register`
* Design: `create-account.png`
* Must have: AuthCard with name, email and password (at least 8 characters), the Create account button and "Already have an account? Log in".
* Calls: `register({ name, email, password })` from `useAuth`.

### Forgot password (Osakue)

* Route: `/forgot-password`
* Designs: `forget-password.png`, `forget-password-sent.png`
* Must have: AuthCard with the email field, "Send reset link", "Back to log in", and the "Check your email" state with "Send it again".
* Calls: `forgotPassword(email)` returns `{ sent: true }` whether or not the email exists.

### Reset password (Osakue)

* Route: `/reset-password/:token`
* Designs: `reset-password.png`, `reset-password-saved.png`
* Must have: AuthCard with the new password twice, "Save new password", the "Password updated" state with the check mark and the Log in button, and the invalid link state.
* Calls: `resetPassword(token, password)` returns `{ ok: true }`, or throws with the server message when the token is invalid or older than one hour.

### Page not found (Gerald)

* Route: any other address
* Design: `page-not-found.png`
* Already built in `client/src/pages/NotFound/`. Nobody else edits it.

## The phone shape

Every phone from the API has the shape below. `getPhone(slug)` returns one phone inside `{ phone }`, and `listPhones(params)` returns a list of them inside `items`. `mockPhones.js` uses the same shape. Units: RAM and storage in GB, cameras in megapixels, battery in mAh, display size in inches, refresh rate in Hz, prices in USD unless `currency` says otherwise. The values below are placeholders, not a real phone. All four collections are described in [DATA-MODEL.md](DATA-MODEL.md).

```json
{
  "slug": "brand-model",
  "brand": "Brand",
  "model": "Model",
  "imageUrl": "https://example.com/images/brand-model.jpg",
  "category": "midrange",
  "releaseYear": 2024,
  "specs": {
    "processor": "Processor name",
    "ram": 8,
    "storage": 128,
    "mainCamera": 50,
    "frontCamera": 16,
    "battery": 5000,
    "displaySize": 6.5,
    "displayType": "Display type",
    "refreshRate": 120,
    "os": "Operating system",
    "has5G": true
  },
  "price": {
    "current": 399,
    "currency": "USD",
    "updatedAt": "2026-09-22T02:00:00.000Z"
  },
  "priceHistory": [
    { "price": 429, "date": "2026-07-22T02:00:00.000Z", "source": "seed" },
    { "price": 399, "date": "2026-09-22T02:00:00.000Z", "source": "manual" }
  ],
  "aiSummary": "One or two plain English sentences about the phone.",
  "source": "seed"
}
```

Notes on the fields:

* `slug` is the brand and model in lowercase, joined with hyphens. It is unique and it is what goes in the URL.
* `category` is one of `budget`, `midrange`, `flagship`, `gaming` or `camera`.
* `price.updatedAt` is the date the price was last checked. The phone page shows it next to the price as "Guide price, checked 22 Sep 2026".
* Each `priceHistory` entry has `source` set to `seed`, `ai`, `api` or `manual`. The price updater appends one entry a day.
* `aiSummary` is written once by the model when the phone is added. It goes in the "In plain words" box.
* `source` on the phone is `seed`, `ai` or `admin`. A phone with source `ai` was supplied by the model during a search and is shown with the notice bar and the Estimated label.
* `imageUrl` is empty in the sample data, so PhoneImage shows a grey placeholder. Real pictures come with the real data.

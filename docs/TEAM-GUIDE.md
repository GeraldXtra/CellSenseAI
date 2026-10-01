# Team guide

Ibrahim, Osakue, this guide is for the two of you. I wrote it so you can clone the repo, open your page folder and start building without asking me where anything is. It says what we are building, who builds what, how our branches and pull requests work, how to run the real backend on your laptop, the rules we work by, what to check before a pull request, and what each page must contain. The other docs are linked where they give more detail.

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

The AI parts work like this, and this is the only way we describe them: we integrate a pre trained language model through an OpenAI compatible API. The model turns a search sentence into filters, supplies the specs of a phone we do not have, answers the assistant's questions from our phone data, ranks the recommendation shortlist and explains its choices, writes the phone summaries, summarises reviews and judges their mood. We do not train or build a model. When you write about it in a README or a pull request, say "the model", "we call the model", "we use the model".

Our stack: React 19 with Vite, React Router, Bootstrap 5 and plain CSS in `client/`; Node 20 with Express 5 in `server/`; MongoDB Atlas with Mongoose; JWT login with bcrypt; an OpenAI compatible chat API, which for us is Groq with the model `openai/gpt-oss-120b`; `node-cron` for the nightly price check; Nodemailer for the password reset email. The client runs on port 5173 and the server on port 5000. The docs live in `docs/`. [ARCHITECTURE.md](ARCHITECTURE.md) explains how the parts talk to each other.

## Who builds what

I am the lead. I own the repo, the backend, the database, the AI features, the shared client files, the documentation and the diagrams, and I review and merge every pull request. The backend and the shared client files are finished. What is left is your pages and components.

| Area | Owner | Branch | Where |
| --- | --- | --- | --- |
| Backend, database, AI features, price check, password reset, phone data and pictures | Gerald | `backend` | `server/`, `client/public/phones/` |
| Shared client files: routes, theme, services, contexts, hooks, sample data, shared components including the chat window, Page not found | Gerald | `backend` | `client/src/App.jsx`, `client/src/main.jsx`, `client/src/styles/`, `client/src/services/`, `client/src/context/`, `client/src/hooks/`, `client/src/data/`, `client/src/components/shared/`, `client/src/pages/NotFound/` |
| Home, Search results, Browse, Phone detail, About | Ibrahim | `ibrahim` | `client/src/pages/Home/`, `SearchResults/`, `Browse/`, `PhoneDetail/`, `About/` and `client/src/components/ibrahim/` |
| Compare, Recommend, Assistant, Dashboard, Log in, Create account, Forgot password, Reset password | Osakue | `osakue` | `client/src/pages/Compare/`, `Recommend/`, `Assistant/`, `Dashboard/`, `Login/`, `Register/`, `ForgotPassword/`, `ResetPassword/` and `client/src/components/osakue/` |
| Documentation, diagrams, reviews and merges | Gerald | `backend` | `docs/` |

The split is even by weight, not by page count. Ibrahim, your five pages are the heavy browsing pages: search, filters, the spec table and the chart. Osakue, your four account pages share one AuthCard component and are small, and your weight is in Compare, Recommend, Assistant and Dashboard. Ibrahim, you own eight components. Osakue, you own eight too. The full list with the pages that use each one is in [COMPONENTS.md](COMPONENTS.md). The owner of every file is in [OWNERSHIP.md](OWNERSHIP.md).

## The branches

We have five branches on GitHub.

| Branch | Who writes to it | What it holds |
| --- | --- | --- |
| `main` | Nobody pushes to it. I merge `develop` into it for the submission. | The version we hand in. |
| `develop` | Nobody pushes to it. It changes only when I merge a pull request. | All merged work. Every branch starts from it and syncs with it. |
| `backend` | Gerald | My work: the server, the shared client files and the docs. |
| `ibrahim` | Ibrahim | Ibrahim's pages and components. |
| `osakue` | Osakue | Osakue's pages and components. |

You work only on your own branch, and only in your own folders. Never commit to another person's branch, never push to `develop` or `main`, and never force push.

## Pull requests

1. When a page, or a clear part of one, is ready, push your branch and open a pull request from your branch into `develop`. Never into `main`.
2. Give it a title that says what it adds, such as "Browse: brand tabs, filter strip and live list", and attach the screenshots from the checklist below.
3. I review it against the checklist. If something needs changing, I say so on the pull request; you fix it on your branch and push again, and the pull request updates by itself.
4. When it passes, I merge it with "Create a merge commit". No squash and no rebase, so every commit keeps its author and its message. You never merge a pull request yourself.

## Sync after every merge

Every time I merge a pull request into `develop`, yours or anyone's, bring your branch up to date before you go on:

```powershell
git checkout <your branch>
git pull origin develop
git push origin <your branch>
```

`<your branch>` is `ibrahim` or `osakue`. Commit or stash your own changes first, so the pull starts from a clean folder. If git reports a conflict in one of your files, fix it, commit and push. If the conflict is in a file that is not yours, stop and tell me; do not fix it by editing someone else's file.

## Commit messages

A commit message describes the change and nothing else: what changed, in plain words, such as "Browse: brand tabs and filter strip" or "Compare: one phone state". No names, no greetings, no tool names and no extra lines under it. Commit small and often, one change per commit.

## How to start

1. Clone the repo and go into it, as in [INSTALLATION.md](INSTALLATION.md).
2. `git checkout <your branch>`, then `git pull origin develop`, so you start from the latest merged work.
3. Run the real backend and the client on your laptop, as the next section says.
4. Open your page folder under `client/src/pages/` and read its `README.md`. It says what must be on the page and which components to use.
5. Open the matching image in `docs/ui/`. The README names it. The image is the source of truth for layout and text.
6. Read [STYLING.md](STYLING.md) (the theme variables and where you see them), [COMPONENTS.md](COMPONENTS.md) (what to reuse), [DATA-FLOW.md](DATA-FLOW.md) (exactly what each page calls and gets back) and [ROUTES.md](ROUTES.md) (every route and every click).
7. Build the page in `<Page>.jsx` with its styles in `<Page>.css`. Import the css file at the top of the page file.

## Running the real backend on your laptop

The backend is finished and every endpoint is live, so you build against real data from the start. [INSTALLATION.md](INSTALLATION.md) has every step and every line of the settings file. In short:

1. Ask me for your own database user. I send you the connection string privately.
2. In `server`, run `npm install`, copy `.env.example` to `.env`, and fill it as Step 5 of INSTALLATION.md shows: your connection string in `MONGODB_URI`, your own `JWT_SECRET`, and `CLIENT_URL=http://localhost:5173`. Leave the three `AI_` lines and the mail lines empty unless I give you a key.
3. Run `npm run dev` in `server` and wait for "MongoDB connected" and "CellSense API running on http://localhost:5000".
4. In a second window, run `npm install` once and then `npm run dev` in `client`, and open `http://localhost:5173`.

Without the AI lines the site still works, with four differences: search is direct only, the assistant answers "The AI features are not set up yet", recommendations come with plain reasons, and the review summary is star based. A reset link is printed in the server window, because the mail lines are empty. [DATA-FLOW.md](DATA-FLOW.md) says what each of these looks like on your pages.

Never run `npm run seed` or `npm run prices`. Both write to the database we share. Only I run them.

## Before you connect a page

Read [DATA-FLOW.md](DATA-FLOW.md) before you connect a page to the backend. It is the exact contract for each page: what to call, what comes back, what to show and what to do when something goes wrong.

`client/src/data/mockPhones.js` is only for building a page's layout before you connect it. Once a page is connected, it reads everything from the database through the functions in `client/src/services/`, and it no longer imports the mock file.

## The rules

1. A page is done when it matches its image in `docs/ui/` at 1280px. Then it must also work at 375px and 768px. The page never scrolls sideways. Wide tables scroll inside their own box.
2. Every colour, spacing, font size, corner radius and shadow comes from `client/src/styles/theme.css`. Never type a hex code or a pixel value into a component. If a value is missing, do not invent one: send me the image and the element and I add it to the theme.
3. Use the shared components in `client/src/components/shared/`: Layout, Navbar, AccountMenu, Footer, ChatLauncher, ChatWindow, PhoneImage, PhoneCard, Loader, EmptyState and ProtectedRoute. Never make a second version of one. If a shared component needs a new prop, ask me.
4. Shared files are changed only by me. That is everything in `client/src/styles/`, `client/src/services/`, `client/src/context/`, `client/src/hooks/`, `client/src/data/`, `client/src/components/shared/`, `client/src/pages/NotFound/` and `client/public/`, plus `App.jsx`, `main.jsx`, and the files at the top of `client/`: `index.html`, `vite.config.js`, `package.json`, `.env.example`, `.gitignore`, `.oxlintrc.json` and `README.md`. If you need something changed there, ask me and I do it on `backend`.
5. All data comes through the functions in `client/src/services/`. Never call `fetch` or `axios` inside a page or a component.
6. The mock data file is only for building a page before you connect it. A connected page reads from the database through the services.
7. Every page handles three states: loading, empty and error. `useAsync` in `client/src/hooks/useAsync.js` gives you all three.
8. Buttons use the Bootstrap classes `btn btn-primary` and `btn btn-outline-primary`, which the theme restyles, so every button has the same shape. Icons come only from `react-icons/fi`.
9. You work on your own branch and open a pull request into `develop`. I review and merge with a merge commit. Nobody pushes to `develop` or `main`.
10. Never run `npm run seed` or `npm run prices`.
11. Commit small and often. A commit message describes the change only.

## Checklist before a pull request

Go through these nine points before you open a pull request into `develop`.

1. Your branch is synced with `develop`, as in "Sync after every merge".
2. The page works at 375px, 768px and 1280px and never scrolls sideways. Wide tables scroll inside their own box.
3. No hex codes or pixel values outside `client/src/styles/theme.css`.
4. The page sits inside the shared layout and uses the shared components.
5. The loading, empty and error states exist.
6. Data comes from `src/services`, as [DATA-FLOW.md](DATA-FLOW.md) says for your page, never from `fetch` or `axios` inside a page, and a connected page no longer imports `mockPhones.js`.
7. No errors in the browser console.
8. Screenshots at phone size and desktop size are attached to the pull request.
9. Matches the image at 1280px.

## Page by page

All endpoints sit under `/api`, so `GET /phones` is served at `/api/phones`. Every response uses the same envelope: `{ "ok": true, "data": { } }` on success and `{ "ok": false, "error": { "message": "..." } }` on failure. `api.js` unwraps it, so the service functions give you `data` directly, and a failure reaches you as an error whose message is ready to show. Calls marked (login) need the token, which `api.js` adds for you. Every endpoint is live. Each page section in [DATA-FLOW.md](DATA-FLOW.md) gives the exact calls, fields and messages; this list is the overview. Every endpoint is described in full in [API.md](API.md) and every click in [ROUTES.md](ROUTES.md).

### Home (Ibrahim)

* Route: `/`
* Designs: `home-page.png`, `home-page-logged-in.png`
* Must have: the headline, the sub line, SearchBar with the three example searches, the three hero pictures, the "Compare side by side" band with the small table and "Open compare", the "Ask the assistant" band with the sample exchange and "Open the assistant", and the five brand cards.
* Calls: `comparePhones(['samsung-galaxy-s24', 'xiaomi-redmi-note-13-pro'])` for the teaser table, which returns `{ phones, best }`. Nothing else on the page needs the server.

### Search results (Ibrahim)

* Route: `/search?q=`
* Designs: `search-result.png`, `search-no-results.png`, `search-added-by-assistant.png`
* Must have: SearchBar with the query, "Understood as" with UnderstoodChips, the count heading, the Filters link that scrolls to FilterStrip, SortSelect, FilterStrip above the results, the PhoneCard grid, the no results card, and the NoticeBar when the model added a phone.
* Calls: `searchPhones(q)` returns `{ items, filters, source }`. `source` is `direct` when the words matched a brand or model, and `ai` when the model turned the sentence into filters; show the chips only for `ai`. A phone with `source` set to `ai` in its record brings the NoticeBar, and PhoneCard adds the Estimated label by itself. A chip x, Apply and the sort call `listPhones(params)` with the filters that are left, written into the address.

### Browse (Ibrahim)

* Routes: `/browse` and `/browse/:brand`
* Design: `browse.png`
* Must have: the heading, BrandTabs, FilterStrip, SortSelect, the brand heading with the count, the PhoneCard grid. The brands are Samsung, Apple, OnePlus, Xiaomi and Vivo.
* Calls: `listPhones(params)` with the brand from the path and the strip, the sort and the page from the address. It returns `{ items, total, page, pages }`, 24 phones a page. The address is lowercase and the server matches the brand ignoring case.

### Phone detail (Ibrahim, with Osakue's ReviewsSection)

* Route: `/phones/:slug`
* Designs: `phone-detail.png`, `phone-detail-reviews.png`
* Must have: the breadcrumb, the picture, brand, name, price, "Guide price, checked <date>", the orange trend note when the trend is falling, the "In plain words" box when the phone has a summary, Add to compare, Save to favourites, SpecTable, PriceHistoryChart with its caption, and the reviews block. Osakue, the reviews block is yours: build it as ReviewsSection and Ibrahim places `<ReviewsSection slug={slug} />` where the design shows it.
* Calls: `getPhone(slug)` returns `{ phone, isFavourite }`, and for a logged in user it also records the phone in recently viewed. `getPriceTrend(slug)` returns `{ history, trend, suggestion }`. `addFavourite(slug)` (login) returns `{ favourites }`; reload after it and the button reads "Saved". ReviewsSection calls `getReviews(slug)`, `getReviewSummary(slug)` and `addReview(slug, { rating, text })` (login) itself.

### About (Ibrahim)

* Route: `/about`, with the anchors `#about`, `#askme`, `#how-prices-work` and `#contact` that the footer links to
* Design: `about.png`
* Must have: the heading, the sub line, the picture, and the four bands with their text.
* Calls: none.

### Compare (Osakue)

* Route: `/compare`, and `/compare?ids=a,b,c` for a shared link
* Designs: `compare.png`, `compare-one-phone.png`, `compare-add-phone.png`
* Must have: the heading and sub line, CompareSlots, CompareTable with the best cell bold, the Verdict card, the one phone state with "Browse phones", the empty state, and AddPhoneDialog. The page reads its slugs from `useCompare()`, which also takes `?ids=` from the address.
* Calls: with two or three slugs, `comparePhones(slugs)` returns `{ phones, best }`. With one slug, `getPhone(slug)` gives the single column. The dialog searches with `listPhones({ q, limit: 5 })`, and `isFull` from `useCompare()` tells you when to disable Add.

### Recommend (Osakue)

* Route: `/recommend`
* Design: `recommend.png`
* Must have: the heading and sub line, RecommendForm, and "Your top 3" with three PhoneCards with rank, price and reason and no Compare checkbox.
* Calls: `recommend({ budget, brand, purpose, performance, camera, gaming, battery })` returns `{ items: [{ phone, reason }], widened }`. The values each field may send are in [DATA-FLOW.md](DATA-FLOW.md). For a logged in user the server saves the picks to the dashboard by itself.

### Assistant (Osakue)

* Route: `/assistant`, with `?q=` to put text in the input
* Designs: `assistant.png`, `assistant-empty.png`, `assistant-window.png`
* Must have: the heading and sub line, ChatThread with the bubbles, the phone cards under a reply and the typing dots, ChatInput, the three suggestion links, the empty state with the three suggestion chips, and the error bubble. The messages come from `useChat()` in ChatContext (mine), so this page shows the same conversation as the floating chat window.
* The window: the button at the bottom right of every other page opens ChatWindow, a small floating chat over the page, 380 by 560, with an x to close and an "Open full page" link to this page. It is hidden on `/assistant`. The window is mine: a shared component in `client/src/components/shared/`, finished, that Layout renders on every page. It draws its own thread and form, and reads its messages and its open state from `useChat()` too, so it shows the same conversation as your page, Osakue, and the conversation survives moving between pages. You do not build it or render it.
* Calls: `send(text)` from `useChat()`, which calls `chat(messages)` with the whole conversation and adds the reply to `messages` as `{ role: "assistant", content, phones }`. It returns `true` when the reply came back and `false` when it failed. The page never calls `chat` itself.

### Dashboard (Osakue)

* Route: `/dashboard` (login)
* Designs: `dashboard.png`, `dashboard-new-account.png`
* Must have: the heading and "Signed in as <name>", Recently viewed, Favourites, Search history, Recommended for you, and the empty state of each block. The footer links to `/dashboard#favourites` and `/dashboard#search-history`, so give those two blocks the ids `favourites` and `search-history`, and draw them while the data loads, because Layout looks for the id only once, when the page first draws.
* Calls: `getDashboard()` (login) returns `{ recentlyViewed, favourites, searchHistory, recommendations }`. `removeFavourite(slug)` (login) returns `{ favourites }`; reload after it.

### Log in (Osakue)

* Route: `/login`, with `?next=` for the page that asked for login
* Design: `log-in.png`
* Must have: AuthCard with the email and password fields, "Forgot password?", the Log in button and "New here? Create an account".
* Calls: `login({ email, password })` from `useAuth()` stores the token, sets the user and returns it. `GET /auth/me` runs on load through AuthContext; you do not call it.
* After Log in: go to the page in `next` when it is an address inside our site, otherwise to `/`, with `replace: true`.

### Create account (Osakue)

* Route: `/register`, with `?next=` when the person came from a page that asked for login
* Design: `create-account.png`
* Must have: AuthCard with name, email and password (at least 8 characters), the Create account button and "Already have an account? Log in".
* Calls: `register({ name, email, password })` from `useAuth()` stores the token and sets the user, the same way `login` does.
* After Create account: go to the page in `next` when it is an address inside our site, otherwise to `/`, with `replace: true`.

### Forgot password (Osakue)

* Route: `/forgot-password`
* Designs: `forget-password.png`, `forget-password-sent.png`
* Must have: AuthCard with the email field, "Send reset link", "Back to log in", and the "Check your email" state with "Send it again".
* Calls: `forgotPassword(email)` returns `{ sent: true }` whether or not the email has an account. On your laptop the link is printed in the server window, because the mail lines are empty.

### Reset password (Osakue)

* Route: `/reset-password/:token`
* Designs: `reset-password.png`, `reset-password-saved.png`
* Must have: AuthCard with the new password twice, "Save new password", the "Password updated" state with the check mark and the Log in button, and the invalid link state.
* Calls: `resetPassword(token, password)` returns `{ ok: true }`, or throws with the server message when the link is incomplete, invalid, already used or older than one hour. The person is not logged in automatically.

### Page not found (Gerald)

* Route: any other address
* Design: `page-not-found.png`
* Finished, in `client/src/pages/NotFound/`. Nobody else edits it.

## The phone shape

Every phone from the API has the shape below. Here is the Galaxy S24 as it looks after the price check of 1 October 2026. Units: RAM and storage in GB, cameras in megapixels, battery in mAh, display size in inches, refresh rate in Hz, prices in US dollars. All four collections are described in [DATA-MODEL.md](DATA-MODEL.md).

```json
{
  "slug": "samsung-galaxy-s24",
  "brand": "Samsung",
  "model": "Galaxy S24",
  "imageUrl": "/phones/samsung-galaxy-s24.png",
  "category": "flagship",
  "releaseYear": 2024,
  "specs": {
    "processor": "Exynos 2400",
    "ram": 8,
    "storage": 256,
    "mainCamera": 50,
    "frontCamera": 12,
    "battery": 4000,
    "displaySize": 6.2,
    "displayType": "AMOLED",
    "refreshRate": 120,
    "os": "Android 14",
    "has5G": true
  },
  "price": {
    "current": 689,
    "currency": "USD",
    "updatedAt": "2026-10-01T00:00:00.000Z"
  },
  "priceHistory": [
    { "price": 749, "date": "2026-06-01T00:00:00.000Z", "source": "seed" },
    { "price": 729, "date": "2026-07-01T00:00:00.000Z", "source": "seed" },
    { "price": 719, "date": "2026-08-01T00:00:00.000Z", "source": "seed" },
    { "price": 699, "date": "2026-09-01T00:00:00.000Z", "source": "seed" },
    { "price": 689, "date": "2026-10-01T00:00:00.000Z", "source": "manual" }
  ],
  "aiSummary": "A compact flagship with a bright 120Hz screen and a strong main camera. Battery is average for the size.",
  "source": "seed"
}
```

Phones from `listPhones`, `getPhone`, `comparePhones`, `searchPhones`, the dashboard and the favourites are whole documents: everything above, plus `_id`, `reviewSummary`, `createdAt` and `updatedAt`. Phones in a chat reply or a recommendation carry only `_id`, `slug`, `brand`, `model`, `category`, `releaseYear`, `specs`, `price`, `source` and `imageUrl`.

Notes on the fields:

* `slug` is the brand and model in lowercase, joined with hyphens, with a plus sign written as plus, such as `samsung-galaxy-s24-plus`. It is unique and it is what goes in the address.
* `category` is one of `budget`, `midrange`, `flagship`, `gaming` or `camera`.
* `price.updatedAt` is the date the price was last checked. The phone page shows it next to the price as "Guide price, checked 1 Oct 2026".
* Each `priceHistory` entry is one price check, oldest first. `seed` entries come from the phone file, `manual` entries from the price list I keep in `server/data/prices.json`, and an `ai` entry from the model when it added the phone.
* `aiSummary` goes in the "In plain words" box. The model writes it the first time the phone page opens on a server with the AI settings filled, and it is stored in the database from then on. A server without the `AI_` lines writes none, so a phone that has no summary yet shows no box.
* `source` on the phone is `seed` or `ai`. A phone with source `ai` was added by the model during a search: its specs and price are estimates, so it shows the NoticeBar on Search results and the Estimated label on its price.
* `imageUrl` is the path of the phone's picture file, which goes in `client/public/phones/`. PhoneImage shows the picture, or a grey placeholder with the phone name when the path is empty or the file is missing.

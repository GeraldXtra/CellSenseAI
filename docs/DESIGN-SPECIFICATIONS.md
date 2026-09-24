# CellSense AI Portal: design specifications

CellSense AI is a responsive single page web application we are building for ASKME Ltd. as our eProject for the Advanced Diploma in Software Engineering (ADSE) course at Aptech NG. This file records how the site is put together: the tools we use, the pages, the visual theme, the finished designs, the data, the API, the AI integration and the security measures.

## Tech stack

| Part | Where it runs | What it does for us |
|---|---|---|
| React 19 with Vite | Browser | Builds the single page application. Vite serves it on port 5173 while we develop and forwards `/api` to the backend. |
| React Router | Browser | Maps each route in the site map to a page without a full page reload. |
| Bootstrap 5 and plain CSS | Browser | Bootstrap gives us the grid, the form controls and the buttons. Our own colours, spacing, font sizes, corner radius and shadows live in `client/src/styles/theme.css`. |
| Node 20 with Express 5 | Server | Receives every request from the browser on port 5000, reads and writes the database and calls the model when a feature needs it. |
| MongoDB Atlas with Mongoose | Cloud database | Stores phones, users, reviews and search logs as documents. Mongoose defines the shape of each document. |
| JWT with bcrypt | Server | Handles login. Passwords are stored as bcrypt hashes. A logged in user carries a JWT token. |
| OpenAI compatible chat API | External service | The pre trained language model we integrate. It runs the language parts of search, the assistant, recommendations, phone summaries, comparison verdicts and review summaries. |
| `node-cron` | Server | Runs the price updater once a day. |
| Nodemailer | Server | Sends the password reset email. |

The client also has `axios`, `recharts` and `react-icons` installed. `client/.env.example` holds `VITE_API_URL=`. We leave it empty so the browser uses the Vite proxy, which passes `/api` requests to port 5000.

### Why we chose these parts

1. We already know React, Express and MongoDB. We spend our time on the features, not on learning new tools.
2. Phone specs are uneven from one model to the next. Documents in MongoDB fit this better than fixed table columns.
3. MongoDB Atlas is a shared cloud database. Three people work on the same data.
4. Any provider with an OpenAI compatible chat endpoint works. We switch provider by changing two lines in `server/.env`. The settings are `AI_BASE_URL`, `AI_API_KEY` and `AI_MODEL`.

## Site map

* Home `/`
  * Search results `/search?q=`
  * Browse `/browse`
    * Browse by brand `/browse/:brand`
  * Phone detail `/phones/:slug`
  * Compare `/compare?ids=`
  * Recommend `/recommend`
  * Assistant `/assistant`
  * Dashboard `/dashboard` (login required)
  * Log in `/login`
    * Create account `/register`
    * Forgot password `/forgot-password`
    * Reset password `/reset-password/:token`
  * About `/about`
  * Page not found (any other address)
* The assistant launcher: a fixed button at the bottom right of every page, except the Assistant page, that opens a small floating chat window over the page. The window has an "Open full page" link to `/assistant` and shows the same conversation as that page.

## Pages

| Page | Route | Owner | Purpose |
|---|---|---|---|
| Home | `/` | Ibrahim | The search bar with three example searches, a compare teaser, an assistant teaser and the brand cards. |
| Search results | `/search?q=` | Ibrahim | The search bar, the "Understood as" chips, the result count, the filter strip, the sort select and the result cards. |
| Browse | `/browse` and `/browse/:brand` | Ibrahim | Brand tabs, the filter strip, the sort select and the result cards. |
| Phone detail | `/phones/:slug` | Ibrahim | Image, brand, name, price with the date it was checked, the price trend note, the plain English summary, Add to compare, Save to favourites, the Tech specs table, the price history chart and the reviews block. |
| Compare | `/compare?ids=` | Osakue | Up to three phone slots, the spec table with the best value bold in each row, the Add a phone dialog and the verdict card. |
| Recommend | `/recommend` | Osakue | The five question form and the top three cards with a reason each. |
| Assistant | `/assistant` | Osakue | The chat thread, the phone cards under a reply, the input and the suggested questions. The floating chat window on every other page shows the same conversation. |
| Dashboard | `/dashboard` | Osakue | Recently viewed, favourites, search history and recommended for you. Login required. |
| Log in | `/login` | Osakue | Email and password, a Forgot password link and a link to create an account. |
| Create account | `/register` | Osakue | Name, email and password. |
| Forgot password | `/forgot-password` | Osakue | The email field, then the "Check your email" state. |
| Reset password | `/reset-password/:token` | Osakue | The new password twice, then the "Password updated" state. |
| About | `/about` | Ibrahim | About CellSense AI, ASKME Ltd., how prices work and contact. |
| Page not found | any other address | Gerald | A picture, "Page not found" and a Go home button. |

The routes, every click and the endpoints each page calls are listed in [`ROUTES.md`](ROUTES.md). What each page must contain is in the README inside its folder under `client/src/pages/`.

## Visual theme

The look comes from the finished designs in `docs/ui/`. White pages with alternating very light grey sections. Centred headings. Near black buttons with 10px corners, never pills. White cards with 16px corners and no shadows. Hairline dividers. One warm orange used only for the price falling note. No gradients, no purple, no navy, no blue, no green, no emoji. Icons come only from `react-icons/fi`.

All values live in `client/src/styles/theme.css`. Nobody types a hex code or a pixel value into a component. When a page needs a value that is not in the theme, we ask the lead to add it there. What each variable is for and where it shows in the designs is explained in [`STYLING.md`](STYLING.md).

### Colours

| Variable | Value |
|---|---|
| `--cs-page-bg` | `#ffffff` |
| `--cs-band-bg` | `#f5f5f7` |
| `--cs-card-bg` | `#ffffff` |
| `--cs-field-bg` | `#ffffff` |
| `--cs-line` | `#e5e5ea` |
| `--cs-line-strong` | `#d2d2d7` |
| `--cs-ink` | `#1d1d1f` |
| `--cs-ink-soft` | `#6e6e73` |
| `--cs-ink-faint` | `#c7c7cc` |
| `--cs-on-ink` | `#ffffff` |
| `--cs-button-bg` | `#1d1d1f` |
| `--cs-button-bg-hover` | `#000000` |
| `--cs-price-note` | `#e8632b` |
| `--cs-error` | `#c0392b` |
| `--cs-error-bg` | `#fbeae7` |
| `--cs-overlay` | `rgba(29,29,31,0.4)` |
| `--cs-focus-ring` | `0 0 0 3px rgba(29,29,31,0.25)` |
| `--cs-shadow-float` | `0 8px 24px rgba(29,29,31,0.08)` |

### Font and type sizes

| Variable | Value |
|---|---|
| `--cs-font` | `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif` |
| `--cs-size-hero` | `3.5rem` |
| `--cs-size-page-title` | `2.75rem` |
| `--cs-size-section-title` | `2rem` |
| `--cs-size-block-title` | `1.5rem` |
| `--cs-size-card-title` | `1.25rem` |
| `--cs-size-body` | `1rem` |
| `--cs-size-small` | `0.875rem` |
| `--cs-size-tiny` | `0.75rem` |

### Weights, line heights and tracking

| Variable | Value |
|---|---|
| `--cs-weight-regular` | `400` |
| `--cs-weight-medium` | `500` |
| `--cs-weight-bold` | `600` |
| `--cs-line-body` | `1.5` |
| `--cs-line-heading` | `1.15` |
| `--cs-tracking-heading` | `-0.01em` |

### Spacing

| Variable | Value |
|---|---|
| `--cs-space-1` | `4px` |
| `--cs-space-2` | `8px` |
| `--cs-space-3` | `12px` |
| `--cs-space-4` | `16px` |
| `--cs-space-5` | `20px` |
| `--cs-space-6` | `24px` |
| `--cs-space-8` | `32px` |
| `--cs-space-10` | `40px` |
| `--cs-space-12` | `48px` |
| `--cs-space-16` | `64px` |
| `--cs-space-20` | `80px` |

### Corner radius

| Variable | Value |
|---|---|
| `--cs-radius-chip` | `6px` |
| `--cs-radius-control` | `10px` |
| `--cs-radius-card` | `16px` |

### Sizes

| Variable | Value |
|---|---|
| `--cs-container` | `1200px` |
| `--cs-topbar-h` | `56px` |
| `--cs-control-h` | `44px` |
| `--cs-search-h` | `48px` |
| `--cs-card-image-h` | `220px` |
| `--cs-auth-card-w` | `440px` |
| `--cs-dialog-w` | `640px` |
| `--cs-launcher-size` | `56px` |
| `--cs-icon` | `18px` |

### Layers and transition

| Variable | Value |
|---|---|
| `--cs-z-topbar` | `100` |
| `--cs-z-menu` | `200` |
| `--cs-z-launcher` | `300` |
| `--cs-z-dialog` | `400` |
| `--cs-transition` | `150ms ease` |

### Aliases

| Variable | Value |
|---|---|
| `--cs-bubble-user-bg` | `var(--cs-button-bg)` |
| `--cs-bubble-user-text` | `var(--cs-on-ink)` |
| `--cs-bubble-reply-bg` | `var(--cs-band-bg)` |
| `--cs-chart-line` | `var(--cs-ink)` |
| `--cs-chart-grid` | `var(--cs-line)` |
| `--cs-cell-best-bg` | `var(--cs-band-bg)` |

### Layout rules

1. Every page sits inside the shared layout: the top bar, the page content, the footer, the assistant launcher and the floating chat window.
2. We use the shared components: Layout, Navbar, AccountMenu, Footer, ChatLauncher, PhoneImage, PhoneCard, Loader, EmptyState and ProtectedRoute. We never make a second version of one.
3. Buttons use the shared button classes, so every button has the same shape.
4. Every page works at 375px, 768px and 1280px. The page never scrolls sideways. Wide tables scroll inside their own box. Under 768px the top bar collapses to the logo mark, a search icon and a menu icon.
5. Every page handles three states: loading, empty and error.
6. A page is done when it matches its image in `docs/ui/` at 1280px.

## Screenshots

The finished designs live in `docs/ui/`, 26 images. The pages are built against them. One desktop and one phone screenshot of each built page are added here after the build.

| File | What it shows |
|---|---|
| `home-page.png` | Home, logged out. |
| `home-page-logged-in.png` | Home with the account menu open (Dashboard, Log out). |
| `search-result.png` | Search results with three phones. |
| `search-no-results.png` | Search with nothing found. |
| `search-added-by-assistant.png` | Search where the assistant added a phone, with the notice bar and the Estimated label. |
| `browse.png` | Browse with the Samsung tab active. |
| `phone-detail.png` | Phone detail, no reviews yet. |
| `phone-detail-reviews.png` | Phone detail with the summary and three reviews. |
| `compare.png` | Compare with three phones. |
| `compare-one-phone.png` | Compare with one phone. |
| `compare-add-phone.png` | Compare with the Add a phone dialog open. |
| `recommend.png` | Recommend with results. |
| `assistant.png` | Assistant mid conversation. |
| `assistant-empty.png` | Assistant before any message. |
| `assistant-window.png` | The floating chat window opened from the launcher, over a page. |
| `dashboard.png` | Dashboard with history. |
| `dashboard-new-account.png` | Dashboard for a new account. |
| `log-in.png` | Log in. |
| `create-account.png` | Create account. |
| `forget-password.png` | Forgot password. |
| `forget-password-sent.png` | Forgot password after the link was sent. |
| `reset-password.png` | Reset password. |
| `reset-password-saved.png` | Reset password after the new password was saved. |
| `about.png` | About. |
| `page-not-found.png` | Page not found. |
| `mobile-topbar.png` | The top bar under 768px: the logo mark on the left, a search icon and a menu icon on the right. |

## Data model

The full field list is in [`DATA-MODEL.md`](DATA-MODEL.md). We have four collections in MongoDB Atlas.

| Collection | What it holds |
|---|---|
| phones | One document per phone: slug, brand, model, image, category, release year, specs, current price, price history, summary and source. |
| users | Name, email, password hash, role, favourites, recently viewed phones, search history, recommendations and the pending password reset. |
| reviews | A rating from 1 to 5, the text, the author, an optional user id and the sentiment for one phone. |
| searchlogs | The query, the filters, the result count and the user when logged in. |

Units: RAM and storage in GB, cameras in megapixels, battery in mAh, display size in inches, refresh rate in Hz, prices in USD unless the currency field says otherwise.

## API

The full endpoint list is in [API.md](API.md). The base URL is `/api`. Every response uses the same envelope.

Success:

```json
{ "ok": true, "data": { } }
```

Failure:

```json
{ "ok": false, "error": { "message": "..." } }
```

The endpoints sit in four groups: Auth (`/api/auth`, including the two password reset endpoints), Phones (`/api/phones`), AI (`/api/ai`) and Users (`/api/users`), plus `GET /api/health`. Protected routes need `Authorization: Bearer <token>`. Endpoints not built yet answer 404. Right now only `GET /api/health` works.

## AI integration

We integrate a pre trained language model through an OpenAI compatible API. The model does the natural language understanding for smart search and the assistant, ranks the recommendation shortlist and explains its choices, writes the plain English spec summaries and summarises reviews. The recommendation system is our own shortlist rules (budget, brand, needs) plus that ranking. Price prediction is a trend calculation from stored price history (falling, rising or stable, with a best time to buy note), not a forecast model. We do not train, build or design any machine learning or NLP model.

| Term in the brief | Where it lives in the site | How we implement it |
| --- | --- | --- |
| Artificial Intelligence | Smart search, the assistant, recommendations, the plain English summary on each phone page, the review summary | We integrate a pre trained language model through an OpenAI compatible API. The backend calls the model with our phone data and the person's words. We do not build or train a model. |
| Machine Learning | The ranking inside recommendations, the summaries, the review sentiment | We use the pre trained model for the parts that need learning from language. We do not train, build or design any machine learning model. |
| NLP | Smart search and the assistant | The model does the natural language understanding. It turns a sentence into filters for search and answers the assistant's questions from our phone data. We do not build an NLP model. |
| Recommendation Systems | The Recommend page and the dashboard | Our own shortlist rules (budget, brand, needs) pick the phones that fit, then the model ranks the shortlist and explains its choices. |
| Predictive Analytics | The price trend and the best time to buy note on each phone page | A trend calculation from the stored price history: falling, rising or stable, with a best time to buy note. It is not a forecast model. |

## Security

1. Login uses email and password. A successful login returns a JWT token that expires after seven days (`JWT_EXPIRES_IN=7d`). The browser sends it as `Authorization: Bearer <token>`. Protected routes reject requests without a valid token.
2. Passwords are hashed with bcrypt before they are stored. The users collection holds `passwordHash`, never the plain password.
3. Password reset uses a random token that is only ever stored as a hash, with an expiry one hour ahead. The reply to a reset request is the same whether or not the email exists.
4. `helmet` sets safe HTTP headers on every response from Express.
5. CORS is limited to the client origin in `CLIENT_ORIGIN`, which is `http://localhost:5173` in development. Only pages served from that origin may call the API from a browser.
6. Rate limiting caps how many requests one client can send to `/api` in a window. The limit is 300 requests per 15 minutes.
7. API keys and mail passwords live only in `server/.env`. The repo holds `server/.env.example`, where every secret is left empty. The real `server/.env` is not in the submission zip. The browser never sees the model key, because only the backend calls the model.
8. Auth, validation and error handling middleware sit in `server/src/middleware` (`auth.js`, `validate.js` and `error.js`).

# Routes

Ibrahim, Osakue, this is the complete route map: every path in `App.jsx`, every click in the designs, and every endpoint each page calls. When a README says "copied from ROUTES.md", it means the rows below. If a click is missing here, ask me before you invent a target.

Two notes that apply everywhere:

- `?next=` on `/login`: when a logged out person opens a page that needs login, ProtectedRoute sends them to `/login?next=<the page they asked for>`. After login, the Login page sends them back to `next`. Without `next` it goes to `/dashboard`.
- Log out (in the account menu) clears the token and the user and stays on the page. If that page is `/dashboard`, ProtectedRoute then sends the person to `/login?next=/dashboard`.

## Table 1: frontend routes

All routes sit inside `<Route element={<Layout />}>`, so every page gets the top bar, the footer, the assistant launcher and the floating chat window.

| Path                     | Parameters and query                                       | Example URL                                                                                | Page                             | Owner   | Login required |
| ------------------------ | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------- | ------- | -------------- |
| `/`                      | none                                                       | `http://localhost:5173/`                                                                   | Home                             | Ibrahim | No             |
| `/search`                | `?q=` the words typed                                      | `http://localhost:5173/search?q=phone%20under%20%24400%20with%20a%20great%20camera`        | SearchResults                    | Ibrahim | No             |
| `/browse`                | none                                                       | `http://localhost:5173/browse`                                                             | Browse                           | Ibrahim | No             |
| `/browse/:brand`         | `:brand` in lowercase                                      | `http://localhost:5173/browse/samsung`                                                     | Browse                           | Ibrahim | No             |
| `/phones/:slug`          | `:slug` the phone slug                                     | `http://localhost:5173/phones/samsung-galaxy-s24`                                          | PhoneDetail                      | Ibrahim | No             |
| `/compare`               | `?ids=` two or three slugs, optional                       | `http://localhost:5173/compare?ids=samsung-galaxy-s24,oneplus-12,xiaomi-redmi-note-13-pro` | Compare                          | Osakue  | No             |
| `/recommend`             | none                                                       | `http://localhost:5173/recommend`                                                          | Recommend                        | Osakue  | No             |
| `/assistant`             | none                                                       | `http://localhost:5173/assistant`                                                          | Assistant                        | Osakue  | No             |
| `/dashboard`             | none                                                       | `http://localhost:5173/dashboard`                                                          | Dashboard, inside ProtectedRoute | Osakue  | Yes            |
| `/login`                 | `?next=` optional                                          | `http://localhost:5173/login?next=/dashboard`                                              | Login                            | Osakue  | No             |
| `/register`              | none                                                       | `http://localhost:5173/register`                                                           | Register                         | Osakue  | No             |
| `/forgot-password`       | none                                                       | `http://localhost:5173/forgot-password`                                                    | ForgotPassword                   | Osakue  | No             |
| `/reset-password/:token` | `:token` from the email link                               | `http://localhost:5173/reset-password/abc123`                                              | ResetPassword                    | Osakue  | No             |
| `/about`                 | anchors `#about`, `#askme`, `#how-prices-work`, `#contact` | `http://localhost:5173/about#how-prices-work`                                              | About                            | Ibrahim | No             |
| `*`                      | any other path                                             | `http://localhost:5173/nothing`                                                            | NotFound                         | Gerald  | No             |

## Table 2: clicks

### On every page

| Where               | What                                                | What it does                                             | Leads to                                                                                |
| ------------------- | --------------------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Top bar             | Logo mark and "CellSense AI"                        | Goes home                                                | `/`                                                                                     |
| Top bar             | Browse                                              | Opens Browse                                             | `/browse`                                                                               |
| Top bar             | Compare                                             | Opens Compare                                            | `/compare`                                                                              |
| Top bar             | Recommend                                           | Opens Recommend                                          | `/recommend`                                                                            |
| Top bar             | Assistant                                           | Opens the assistant                                      | `/assistant`                                                                            |
| Top bar             | Dashboard                                           | Opens the dashboard                                      | `/dashboard`, or `/login?next=/dashboard` when logged out                               |
| Top bar             | Log in (logged out)                                 | Opens Log in                                             | `/login`                                                                                |
| Top bar             | The user's name with the chevron (logged in)        | Opens the account menu                                   | AccountMenu                                                                             |
| Account menu        | Dashboard                                           | Opens the dashboard                                      | `/dashboard`                                                                            |
| Account menu        | Log out                                             | Clears the token and the user, stays on the page         | no navigation                                                                           |
| Top bar under 768px | Search icon                                         | Opens the search page                                    | `/search`                                                                               |
| Top bar under 768px | Menu icon                                           | Opens a panel with the same links plus Log in or Log out | the panel                                                                               |
| Footer, Explore     | Browse phones                                       |                                                          | `/browse`                                                                               |
| Footer, Explore     | Compare                                             |                                                          | `/compare`                                                                              |
| Footer, Explore     | Recommend                                           |                                                          | `/recommend`                                                                            |
| Footer, Explore     | Assistant                                           |                                                          | `/assistant`                                                                            |
| Footer, Explore     | Dashboard                                           |                                                          | `/dashboard`                                                                            |
| Footer, Account     | Log in                                              |                                                          | `/login`                                                                                |
| Footer, Account     | Create account                                      |                                                          | `/register`                                                                             |
| Footer, Account     | Favourites                                          | The favourites block on the dashboard                    | `/dashboard#favourites`                                                                 |
| Footer, Account     | Search history                                      | The search history block on the dashboard                | `/dashboard#search-history`                                                             |
| Footer, Brands      | Samsung, Apple, OnePlus, Xiaomi, Vivo               | Browse by that brand                                     | `/browse/samsung`, `/browse/apple`, `/browse/oneplus`, `/browse/xiaomi`, `/browse/vivo` |
| Footer, About       | About CellSense AI                                  |                                                          | `/about#about`                                                                          |
| Footer, About       | How prices work                                     |                                                          | `/about#how-prices-work`                                                                |
| Footer, About       | ASKME Ltd.                                          |                                                          | `/about#askme`                                                                          |
| Footer, About       | Contact                                             |                                                          | `/about#contact`                                                                        |
| Footer, Built by    | Gerald, Ibrahim, Osakue, Aptech semester 1 eProject | Plain text                                               | no link                                                                                 |
| Footer              | Nigeria / English                                   | Plain text                                               | no link                                                                                 |
| Bottom right        | The assistant launcher                              | Opens ChatWindow, the small floating chat, over the page. Hidden on `/assistant` and while the window is open. | `openWindow()` from `useChat` |
| Chat window         | The x in the header                                 | Closes the window                                        | `closeWindow()` from `useChat` |
| Chat window         | "Open full page"                                    | Opens the Assistant page with the same messages and closes the window | `/assistant` |
| Chat window         | Send button, or Enter                               | Sends the message with the full history                  | `send(text)` from `useChat`, which calls `POST /ai/chat` |
| Chat window         | "See details" on a phone row                        | Opens the phone page                                     | `/phones/<slug>` |

### Home (Ibrahim)

| What                                             | What it does                             | Leads to                                                   |
| ------------------------------------------------ | ---------------------------------------- | ---------------------------------------------------------- |
| Search button, or Enter in the search field      | Searches the typed words                 | `/search?q=<words>`                                        |
| "Best battery under $300"                        | Runs that search                         | `/search?q=Best battery under $300`                        |
| "Gaming phone with 12GB RAM"                     | Runs that search                         | `/search?q=Gaming phone with 12GB RAM`                     |
| "Cheapest 5G phone"                              | Runs that search                         | `/search?q=Cheapest 5G phone`                              |
| "Open compare"                                   | Opens Compare with the two teaser phones | `/compare?ids=samsung-galaxy-s24,xiaomi-redmi-note-13-pro` |
| "Open the assistant"                             | Opens the assistant                      | `/assistant`                                               |
| Brand card Samsung, Apple, OnePlus, Xiaomi, Vivo | Browse by that brand                     | `/browse/samsung` and so on                                |

### Search results (Ibrahim)

| What                                                    | What it does                                              | Leads to                                                                                                                          |
| ------------------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Search button, or Enter                                 | Searches the typed words                                  | `/search?q=<words>`, then `searchPhones(q)`                                                                                       |
| A chip's x                                              | Removes that filter and runs the list again               | `listPhones(remaining filters)`                                                                                                   |
| "Filters"                                               | Scrolls to the filter strip, which sits above the results | the strip                                                                                                                         |
| "Sort by" select                                        | Sorts the results                                         | `listPhones({ ...filters, sort })`                                                                                                |
| Brand checkboxes, price min and max, feature checkboxes | Change the strip values, nothing runs yet                 | the strip                                                                                                                         |
| "Apply"                                                 | Runs the list with the strip values                       | `listPhones({ brand, minPrice, maxPrice, has5G, minRefresh: 120, minRam: 8, minBattery: 5000, sort })` with only the checked ones |
| "Compare" checkbox on a card                            | Adds or removes the phone in the compare list             | `useCompare.add(slug)` or `remove(slug)`                                                                                          |
| "See details" on a card                                 | Opens the phone page                                      | `/phones/<slug>`                                                                                                                  |
| "Clear filters" (no results state)                      | Empties the chips and the strip, runs a word match        | `listPhones({ q })`                                                                                                               |
| "Ask the assistant" (no results state)                  | Opens the assistant                                       | `/assistant`                                                                                                                      |

### Browse (Ibrahim)

| What                                      | What it does                                                   | Leads to                                 |
| ----------------------------------------- | -------------------------------------------------------------- | ---------------------------------------- |
| Tab "All"                                 | Every brand                                                    | `/browse`                                |
| Tab Samsung, Apple, OnePlus, Xiaomi, Vivo | One brand                                                      | `/browse/samsung` and so on              |
| The strip checkboxes and inputs           | Change the strip values                                        | the strip                                |
| "Apply"                                   | Runs the list with the strip values and the brand from the URL | `listPhones(params)`                     |
| "Sort by" select                          | Sorts the results                                              | `listPhones({ ...params, sort })`        |
| "Compare" checkbox on a card              | Adds or removes the phone in the compare list                  | `useCompare.add(slug)` or `remove(slug)` |
| "See details" on a card                   | Opens the phone page                                           | `/phones/<slug>`                         |

### Phone detail (Ibrahim, reviews block by Osakue)

| What                                    | What it does                                                                                                | Leads to                                                                             |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Breadcrumb "Home"                       | Goes home                                                                                                   | `/`                                                                                  |
| Breadcrumb brand, for example "Samsung" | Browse by that brand                                                                                        | `/browse/samsung`                                                                    |
| "Add to compare"                        | Adds the phone to the compare list. The button then reads "Added to compare" and a second click removes it. | `useCompare.add(slug)` or `remove(slug)`                                             |
| "Save to favourites"                    | Saves the phone when logged in                                                                              | `addFavourite(slug)`, or `/login?next=/phones/<slug>` when logged out                |
| Rating select and the review text       | The review form values                                                                                      | the form                                                                             |
| "Post review"                           | Posts the review when logged in                                                                             | `addReview(slug, { rating, text })`, or `/login?next=/phones/<slug>` when logged out |

### Compare (Osakue)

| What                               | What it does                          | Leads to                  |
| ---------------------------------- | ------------------------------------- | ------------------------- |
| "Remove" under a phone             | Removes it from the compare list      | `useCompare.remove(slug)` |
| "Add a phone" slot                 | Opens the Add a phone dialog          | AddPhoneDialog            |
| Dialog x                           | Closes the dialog                     | the page                  |
| Dialog text field                  | Searches by name as the person types  | `listPhones({ q })`       |
| Dialog "Add"                       | Adds that phone and closes the dialog | `useCompare.add(slug)`    |
| "Browse phones" (one phone state)  | Opens Browse                          | `/browse`                 |
| "Ask the assistant" (verdict card) | Opens the assistant                   | `/assistant`              |

### Recommend (Osakue)

| What                                                      | What it does                | Leads to                                                                      |
| --------------------------------------------------------- | --------------------------- | ----------------------------------------------------------------------------- |
| Budget, Brand, Purpose, Performance, the three checkboxes | The form values             | the form                                                                      |
| "Show my top 3"                                           | Asks for the recommendation | `recommend({ budget, brand, purpose, camera, gaming, battery, performance })` |
| "See details" on a result card                            | Opens the phone page        | `/phones/<slug>`                                                              |

Brand options: Any (sent as an empty string), Samsung, Apple, OnePlus, Xiaomi, Vivo. Purpose options: Everyday, Work, Gaming, Photos. Performance options: Basic, Good, Top. The checkboxes send `camera`, `gaming` and `battery` as true or false.

### Assistant (Osakue)

| What                                                                      | What it does                                  | Leads to                                 |
| ------------------------------------------------------------------------- | --------------------------------------------- | ---------------------------------------- |
| Send button, or Enter                                                     | Sends the message with the full history       | `send(text)` from `useChat`, which calls `chat(messages)` |
| A suggestion link under the card, or a suggestion chip in the empty state | Sends that text as a message                  | `send(text)` from `useChat`              |
| "Compare" checkbox on a card under a reply                                | Adds or removes the phone in the compare list | `useCompare.add(slug)` or `remove(slug)` |
| "See details" on a card under a reply                                     | Opens the phone page                          | `/phones/<slug>`                         |

### Dashboard (Osakue)

| What                                           | What it does                                  | Leads to                                 |
| ---------------------------------------------- | --------------------------------------------- | ---------------------------------------- |
| "Compare" checkbox on a recently viewed card   | Adds or removes the phone in the compare list | `useCompare.add(slug)` or `remove(slug)` |
| "See details" on any card                      | Opens the phone page                          | `/phones/<slug>`                         |
| "Remove" in Favourites                         | Removes the favourite                         | `removeFavourite(slug)`                  |
| A search history row                           | Runs that search again                        | `/search?q=<query>`                      |
| "Browse phones" (empty recently viewed)        | Opens Browse                                  | `/browse`                                |
| "Get a recommendation" (empty recommendations) | Opens Recommend                               | `/recommend`                             |

### Log in (Osakue)

| What                | What it does          | Leads to                                                  |
| ------------------- | --------------------- | --------------------------------------------------------- |
| "Log in" button     | Logs in               | `login({ email, password })`, then `next` or `/dashboard` |
| "Forgot password?"  | Opens Forgot password | `/forgot-password`                                        |
| "Create an account" | Opens Create account  | `/register`                                               |

### Create account (Osakue)

| What                    | What it does                    | Leads to                                                 |
| ----------------------- | ------------------------------- | -------------------------------------------------------- |
| "Create account" button | Creates the account and logs in | `register({ name, email, password })`, then `/dashboard` |
| "Log in"                | Opens Log in                    | `/login`                                                 |

### Forgot password (Osakue)

| What                                                      | What it does                                                | Leads to                |
| --------------------------------------------------------- | ----------------------------------------------------------- | ----------------------- |
| "Send reset link"                                         | Requests the email, then shows the "Check your email" state | `forgotPassword(email)` |
| "Back to log in" (link, and the button in the sent state) | Opens Log in                                                | `/login`                |
| "Send it again" (sent state)                              | Requests the email again                                    | `forgotPassword(email)` |

### Reset password (Osakue)

| What                                      | What it does                                                | Leads to                         |
| ----------------------------------------- | ----------------------------------------------------------- | -------------------------------- |
| "Save new password"                       | Saves the password, then shows the "Password updated" state | `resetPassword(token, password)` |
| "Log in" (saved state)                    | Opens Log in                                                | `/login`                         |
| "Request a new link" (invalid link state) | Opens Forgot password                                       | `/forgot-password`               |

### About (Ibrahim)

No clicks of its own. The footer links land on its four anchors.

### Page not found (Gerald)

| What      | What it does | Leads to |
| --------- | ------------ | -------- |
| "Go home" | Goes home    | `/`      |

## Table 3: backend endpoints per page

Every path sits under `/api`. The service function in brackets is what the page calls. What comes back is the `data` part of the envelope. (login) means the token is required; `api.js` adds it.

| Page                  | Method and path                                                       | Query or body                                                                                                             | What comes back                                                         |
| --------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Home                  | `GET /phones` (`listPhones({ limit: 3 })`)                            | `limit=3`                                                                                                                 | `{ items, total, page, pages }`                                         |
| Home                  | `GET /phones/compare` (`comparePhones([...])`)                        | `ids=samsung-galaxy-s24,xiaomi-redmi-note-13-pro`                                                                         | `{ phones, best }`                                                      |
| Search results        | `POST /ai/search` (`searchPhones(query)`)                             | `{ query }`                                                                                                               | `{ items, filters, source }`                                            |
| Search results        | `GET /phones` (`listPhones(params)`)                                  | the chip and strip filters, `sort`                                                                                        | `{ items, total, page, pages }`                                         |
| Browse                | `GET /phones` (`listPhones(params)`)                                  | `brand, minPrice, maxPrice, has5G, minRam, minStorage, minCamera, minBattery, minRefresh, category, q, sort, page, limit` | `{ items, total, page, pages }`                                         |
| Phone detail          | `GET /phones/:slug` (`getPhone(slug)`)                                | none, token optional                                                                                                      | `{ phone }`                                                             |
| Phone detail          | `GET /phones/:slug/price-trend` (`getPriceTrend(slug)`)               | none                                                                                                                      | `{ history, trend, suggestion }`                                        |
| Phone detail          | `GET /phones/:slug/reviews` (`getReviews(slug)`)                      | none                                                                                                                      | `{ items, average, count }`                                             |
| Phone detail          | `GET /phones/:slug/review-summary` (`getReviewSummary(slug)`)         | none                                                                                                                      | `{ summary, sentiment }`                                                |
| Phone detail          | `POST /phones/:slug/reviews` (`addReview(slug, body)`) (login)        | `{ rating, text }`                                                                                                        | `{ review }`                                                            |
| Phone detail          | `POST /users/me/favourites/:slug` (`addFavourite(slug)`) (login)      | none                                                                                                                      | `{ favourites }`                                                        |
| Compare               | `GET /phones/compare` (`comparePhones(slugs)`)                        | `ids=a,b,c`                                                                                                               | `{ phones, best }`                                                      |
| Compare               | `GET /phones` (`listPhones({ q })`) in the dialog                     | `q=<typed name>`                                                                                                          | `{ items, total, page, pages }`                                         |
| Recommend             | `POST /ai/recommend` (`recommend(needs)`)                             | `{ budget, brand, purpose, camera, gaming, battery, performance }`, token optional                                        | `{ items: [{ phone, reason }] }`                                        |
| Assistant             | `POST /ai/chat` (`chat(messages)`, called by `send` in ChatContext)   | `{ messages: [{ role, content }] }`                                                                                       | `{ reply, phones }`                                                     |
| Every page, the chat window | `POST /ai/chat` (`chat(messages)`, called by `send` in ChatContext) | `{ messages: [{ role, content }] }`, the same history as the Assistant page                                            | `{ reply, phones }`                                                     |
| Dashboard             | `GET /users/me/dashboard` (`getDashboard()`) (login)                  | none                                                                                                                      | `{ recentlyViewed, favourites, searchHistory, recommendations }`        |
| Dashboard             | `DELETE /users/me/favourites/:slug` (`removeFavourite(slug)`) (login) | none                                                                                                                      | `{ favourites }`                                                        |
| Log in                | `POST /auth/login` (`login(body)` from `useAuth`)                     | `{ email, password }`                                                                                                     | `{ token, user }`                                                       |
| Create account        | `POST /auth/register` (`register(body)` from `useAuth`)               | `{ name, email, password }`                                                                                               | `{ token, user }`                                                       |
| Forgot password       | `POST /auth/forgot-password` (`forgotPassword(email)`)                | `{ email }`                                                                                                               | `{ sent: true }`                                                        |
| Reset password        | `POST /auth/reset-password` (`resetPassword(token, password)`)        | `{ token, password }`                                                                                                     | `{ ok: true }`, or 400 when the token is invalid or older than one hour |
| Every page on load    | `GET /auth/me` (`me()` inside AuthContext) (login)                    | none                                                                                                                      | `{ user }`                                                              |
| About, Page not found | none                                                                  |                                                                                                                           |                                                                         |

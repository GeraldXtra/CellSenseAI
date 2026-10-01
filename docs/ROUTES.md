# Routes

Ibrahim, Osakue, this is the complete route map: every path in `App.jsx`, every click in the designs, and every endpoint each page calls. Every endpoint below is live. When a README says "copied from ROUTES.md", it means the rows below. If a click is missing here, ask me before you invent a target. What each call returns and how to handle it is in [DATA-FLOW.md](DATA-FLOW.md).

Two notes apply everywhere:

- `?next=` on `/login` and `/register`: when a logged out person opens a page that needs login, ProtectedRoute sends them to `/login?next=<the page they asked for>`. After Log in or Create account, the page sends the person to the page in `next` when it is an address inside our site, otherwise to `/`, with `replace: true`. The links between Log in and Create account keep `?next=`, so it is not lost when a new person creates an account first. Someone already logged in who opens either page goes to `/`.
- Log out (in the account menu, or in the menu panel under 768px) clears the token and the user and stays on the page. If that page is `/dashboard`, ProtectedRoute then sends the person to `/login?next=/dashboard`.

## Table 1: frontend routes

All routes sit inside `<Route element={<Layout />}>`, so every page gets what Layout renders: Navbar (the top bar), Footer, ChatLauncher (the assistant button) and ChatWindow (the floating chat window). All four are mine.

| Path | Parameters and query | Example URL | Page | Owner | Login required |
| --- | --- | --- | --- | --- | --- |
| `/` | none | `http://localhost:5173/` | Home | Ibrahim | No |
| `/search` | `?q=` the words typed, plus the filters left after a chip is removed or the strip is applied | `http://localhost:5173/search?q=phone%20under%20%24400%20with%20a%20great%20camera` | SearchResults | Ibrahim | No |
| `/browse` | the strip, the sort and the page in the query: `minPrice`, `maxPrice`, `has5G=true`, `minRam=8`, `minBattery=5000`, `minRefresh=120`, `sort`, `page` | `http://localhost:5173/browse?has5G=true&sort=priceAsc` | Browse | Ibrahim | No |
| `/browse/:brand` | `:brand` in lowercase, and the same query as `/browse` | `http://localhost:5173/browse/samsung` | Browse | Ibrahim | No |
| `/phones/:slug` | `:slug` the phone slug | `http://localhost:5173/phones/samsung-galaxy-s24` | PhoneDetail | Ibrahim | No |
| `/compare` | `?ids=` two or three slugs, optional | `http://localhost:5173/compare?ids=samsung-galaxy-s24,oneplus-12,xiaomi-redmi-note-13-pro` | Compare | Osakue | No |
| `/recommend` | none | `http://localhost:5173/recommend` | Recommend | Osakue | No |
| `/assistant` | `?q=` optional, the text to put in the input | `http://localhost:5173/assistant?q=phone%20under%20%24400` | Assistant | Osakue | No |
| `/dashboard` | none | `http://localhost:5173/dashboard` | Dashboard, inside ProtectedRoute | Osakue | Yes |
| `/login` | `?next=` optional | `http://localhost:5173/login?next=/dashboard` | Login | Osakue | No |
| `/register` | `?next=` optional | `http://localhost:5173/register` | Register | Osakue | No |
| `/forgot-password` | none | `http://localhost:5173/forgot-password` | ForgotPassword | Osakue | No |
| `/reset-password/:token` | `:token` from the email link | `http://localhost:5173/reset-password/abc123` | ResetPassword | Osakue | No |
| `/about` | anchors `#about`, `#askme`, `#how-prices-work`, `#contact` | `http://localhost:5173/about#how-prices-work` | About | Ibrahim | No |
| `*` | any other path | `http://localhost:5173/nothing` | NotFound | Gerald | No |

## Table 2: clicks

### On every page (Gerald)

| Where | What | What it does | Leads to |
| --- | --- | --- | --- |
| Top bar | Logo mark and "CellSense AI" | Goes home | `/` |
| Top bar | Browse | Opens Browse | `/browse` |
| Top bar | Compare | Opens Compare | `/compare` |
| Top bar | Recommend | Opens Recommend | `/recommend` |
| Top bar | Assistant | Opens the assistant | `/assistant` |
| Top bar | Dashboard | Opens the dashboard | `/dashboard`, or `/login?next=/dashboard` when logged out |
| Top bar | Log in (logged out) | Opens Log in | `/login` |
| Top bar | The user's name with the chevron (logged in) | Opens the account menu. A click outside it or Escape closes it. | AccountMenu |
| Account menu | Dashboard | Opens the dashboard | `/dashboard` |
| Account menu | Log out | Clears the token and the user, stays on the page | no navigation |
| Top bar under 768px | Search icon | Opens the search page | `/search` |
| Top bar under 768px | Menu icon | Opens a panel with the same links plus Log in or Log out. Escape or any link closes it. | the panel |
| Footer, Explore | Browse phones | | `/browse` |
| Footer, Explore | Compare | | `/compare` |
| Footer, Explore | Recommend | | `/recommend` |
| Footer, Explore | Assistant | | `/assistant` |
| Footer, Explore | Dashboard | | `/dashboard` |
| Footer, Account | Log in | | `/login` |
| Footer, Account | Create account | | `/register` |
| Footer, Account | Favourites | The favourites block on the dashboard | `/dashboard#favourites` |
| Footer, Account | Search history | The search history block on the dashboard | `/dashboard#search-history` |
| Footer, Brands | Samsung, Apple, OnePlus, Xiaomi, Vivo | Browse by that brand | `/browse/samsung`, `/browse/apple`, `/browse/oneplus`, `/browse/xiaomi`, `/browse/vivo` |
| Footer, About | About CellSense AI | | `/about#about` |
| Footer, About | How prices work | | `/about#how-prices-work` |
| Footer, About | ASKME Ltd. | | `/about#askme` |
| Footer, About | Contact | | `/about#contact` |
| Footer, Built by | Gerald, Ibrahim, Osakue, Aptech semester 1 eProject | Plain text | no link |
| Footer | Nigeria / English | Plain text | no link |
| Bottom right | The assistant button | Opens ChatWindow, the small floating chat, over the page. Hidden on `/assistant` and while the window is open. | `openWindow()` from `useChat` |
| Chat window | The x in the header, or Escape while the focus is in the window | Closes the window, and focus goes back to the assistant button | `closeWindow()` from `useChat` |
| Chat window | "Open full page" | Opens the Assistant page with the same messages and closes the window | `/assistant` |
| Chat window | Send button, or Enter | Sends the message with the conversation so far | `send(text)` from `useChat`, which calls `POST /ai/chat` |
| Chat window | A suggestion chip before the first message | Sends that text as a message | `send(text)` from `useChat` |
| Chat window | "See details" on a phone row under a reply | Opens the phone page | `/phones/<slug>` |

### Home (Ibrahim)

| What | What it does | Leads to |
| --- | --- | --- |
| Search button, or Enter in the search field | Searches the typed words | `/search?q=<words>` |
| "Best battery under $300" | Runs that search | `/search?q=Best battery under $300` |
| "Gaming phone with 12GB RAM" | Runs that search | `/search?q=Gaming phone with 12GB RAM` |
| "Cheapest 5G phone" | Runs that search | `/search?q=Cheapest 5G phone` |
| "Open compare" | Opens Compare | `/compare` |
| "Open the assistant" | Opens the assistant | `/assistant` |
| Brand card Samsung, Apple, OnePlus, Xiaomi, Vivo | Browse by that brand | `/browse/samsung` and so on |

### Search results (Ibrahim)

| What | What it does | Leads to |
| --- | --- | --- |
| Search button, or Enter | Searches the typed words | `/search?q=<words>`, then `searchPhones(q)` |
| A chip's x | Removes that filter and runs the list again with the filters that are left, written into the address | `listPhones(remaining filters)` |
| "Filters" | Scrolls to the filter strip, which sits above the results | the strip |
| "Sort by" select | Sorts the results | `listPhones({ ...filters, sort })` |
| Brand checkboxes, price min and max, feature checkboxes | Change the strip values, nothing runs yet | the strip |
| "Apply" | Runs the list with the strip values, written into the address | `listPhones({ brand, minPrice, maxPrice, has5G: true, minRefresh: 120, minRam: 8, minBattery: 5000, sort })` with only the checked ones |
| "Compare" checkbox on a card | Adds or removes the phone in the compare list | `useCompare().add(slug)` or `remove(slug)`, inside PhoneCard |
| "See details" on a card | Opens the phone page | `/phones/<slug>` |
| "Clear filters" (no results state) | Empties the chips and the strip, runs a word match | `listPhones({ q })` |
| "Ask the assistant" (no results state) | Opens the assistant with the query in its input | `/assistant?q=<the query>` |

### Browse (Ibrahim)

| What | What it does | Leads to |
| --- | --- | --- |
| Tab "All" | Every brand | `/browse` |
| Tab Samsung, Apple, OnePlus, Xiaomi, Vivo | One brand | `/browse/samsung` and so on |
| The strip checkboxes and inputs | Change the strip values | the strip |
| "Apply" | Writes the strip values into the address, which runs the list with the brand from the path | `listPhones(params)` |
| "Sort by" select | Writes `sort` into the address | `listPhones({ ...params, sort })` |
| "Compare" checkbox on a card | Adds or removes the phone in the compare list | `useCompare().add(slug)` or `remove(slug)`, inside PhoneCard |
| "See details" on a card | Opens the phone page | `/phones/<slug>` |

### Phone detail (Ibrahim, reviews block by Osakue)

| What | What it does | Leads to |
| --- | --- | --- |
| Breadcrumb "Home" | Goes home | `/` |
| Breadcrumb brand, for example "Samsung" | Browse by that brand | `/browse/samsung` |
| "Add to compare" | Adds the phone to the compare list and opens Compare | `useCompare().add(slug)`, then `/compare` |
| "Save to favourites" | Saves the phone when logged in, then reloads, and the button reads "Saved" | `addFavourite(slug)` and `reload()`, or `/login?next=/phones/<slug>` when logged out |
| Rating select and the review text | The review form values, logged in only | the form |
| "Post review" | Posts the review, then reloads the reviews and the summary | `addReview(slug, { rating, text })` |
| "Log in" in place of the form (logged out) | Opens Log in and comes back | `/login?next=/phones/<slug>` |

### Compare (Osakue)

| What | What it does | Leads to |
| --- | --- | --- |
| "Remove" under a phone | Removes it from the compare list, and the page writes the new `?ids=` into the address | `useCompare().remove(slug)` |
| "Add a phone" slot | Opens the Add a phone dialog | AddPhoneDialog |
| Dialog x | Closes the dialog | the page |
| Dialog text field | Searches by name as the person types | `listPhones({ q, limit: 5 })` |
| Dialog "Add" | Adds that phone and closes the dialog. Disabled while `isFull` is true. | `useCompare().add(slug)` |
| "Browse phones" (one phone state and empty state) | Opens Browse | `/browse` |
| "Ask the assistant" (verdict card) | Opens the assistant | `/assistant` |

### Recommend (Osakue)

| What | What it does | Leads to |
| --- | --- | --- |
| Budget, Brand, Purpose, Performance, the three checkboxes | The form values | the form |
| "Show my top 3" | Asks for the recommendation | `recommend({ budget, brand, purpose, performance, camera, gaming, battery })` |
| "See details" on a result card | Opens the phone page | `/phones/<slug>` |

The values each field sends: `budget` a number from 50 to 5000; `brand` `any` or a brand name; `purpose` `everyday`, `photos`, `gaming` or `work`; `performance` `basic`, `balanced` or `high`; `camera`, `gaming` and `battery` `true` or `false`. The labels on the form can say anything, as long as each option sends one of these values.

### Assistant (Osakue)

| What | What it does | Leads to |
| --- | --- | --- |
| Opening `/assistant?q=<text>` | Puts that text in the input | the input |
| Send button, or Enter | Sends the message with the conversation so far | `send(text)` from `useChat`, which calls `chat(messages)` |
| A suggestion link under the card, or a suggestion chip in the empty state | Sends that text as a message | `send(text)` from `useChat` |
| "Compare" checkbox on a card under a reply | Adds or removes the phone in the compare list | `useCompare().add(slug)` or `remove(slug)`, inside PhoneCard |
| "See details" on a card under a reply | Opens the phone page | `/phones/<slug>` |

### Dashboard (Osakue)

| What | What it does | Leads to |
| --- | --- | --- |
| "Compare" checkbox on a recently viewed card | Adds or removes the phone in the compare list | `useCompare().add(slug)` or `remove(slug)`, inside PhoneCard |
| "See details" on any card | Opens the phone page | `/phones/<slug>` |
| "Remove" in Favourites | Removes the favourite, then reloads | `removeFavourite(slug)` and `reload()` |
| A search history row | Runs that search again | `/search?q=<query>` |
| "Browse phones" (empty recently viewed) | Opens Browse | `/browse` |
| "Get a recommendation" (empty recommendations) | Opens Recommend | `/recommend` |

### Log in (Osakue)

| What | What it does | Leads to |
| --- | --- | --- |
| "Log in" button | Logs in | `login({ email, password })` from `useAuth`, then `next` when it is inside our site, otherwise `/` |
| "Forgot password?" | Opens Forgot password | `/forgot-password` |
| "Create an account" | Opens Create account | `/register`, with the same `?next=` when there is one |

### Create account (Osakue)

| What | What it does | Leads to |
| --- | --- | --- |
| "Create account" button | Creates the account and logs in | `register({ name, email, password })` from `useAuth`, then `next` when it is inside our site, otherwise `/` |
| "Log in" | Opens Log in | `/login`, with the same `?next=` when there is one |

### Forgot password (Osakue)

| What | What it does | Leads to |
| --- | --- | --- |
| "Send reset link" | Asks for the email, then shows the "Check your email" state | `forgotPassword(email)` |
| "Back to log in" (link, and the button in the sent state) | Opens Log in | `/login` |
| "Send it again" (sent state) | Asks for the email again | `forgotPassword(email)` |

### Reset password (Osakue)

| What | What it does | Leads to |
| --- | --- | --- |
| "Save new password" | Saves the password, then shows the "Password updated" state | `resetPassword(token, password)` |
| "Log in" (saved state) | Opens Log in | `/login` |
| "Request a new link" (invalid link state) | Opens Forgot password | `/forgot-password` |

### About (Ibrahim)

No clicks of its own. The footer links land on its four anchors: `#about`, `#askme`, `#how-prices-work` and `#contact`.

### Page not found (Gerald)

| What | What it does | Leads to |
| --- | --- | --- |
| "Go home" | Goes home | `/` |

## Table 3: backend endpoints per page

Every path sits under `/api`. The service function in brackets is what the page calls. What comes back is the `data` part of the envelope, which `api.js` hands you directly. (login) means the token is required; `api.js` adds it. Every call in this table is live.

| Page | Method and path | Query or body | What comes back |
| --- | --- | --- | --- |
| Home | `GET /phones/compare` (`comparePhones(['samsung-galaxy-s24', 'xiaomi-redmi-note-13-pro'])`) | `ids=samsung-galaxy-s24,xiaomi-redmi-note-13-pro` | `{ phones, best }` |
| Search results | `POST /ai/search` (`searchPhones(q)`) | `{ query }`, token optional | `{ items, filters, source }` |
| Search results | `GET /phones` (`listPhones(params)`) | the filters left after a chip is removed or the strip is applied, `sort` | `{ items, total, page, pages }` |
| Browse | `GET /phones` (`listPhones(params)`) | `brand` from the path, `minPrice`, `maxPrice`, `has5G`, `minRam`, `minBattery`, `minRefresh`, `sort`, `page` from the address | `{ items, total, page, pages }` |
| Phone detail | `GET /phones/:slug` (`getPhone(slug)`) | none, token optional | `{ phone, isFavourite }` |
| Phone detail | `GET /phones/:slug/price-trend` (`getPriceTrend(slug)`) | none | `{ history, trend, suggestion }` |
| Phone detail | `POST /users/me/favourites/:slug` (`addFavourite(slug)`) (login) | none | `{ favourites }` |
| Phone detail, ReviewsSection | `GET /phones/:slug/reviews` (`getReviews(slug)`) | none | `{ items, average, count }` |
| Phone detail, ReviewsSection | `GET /phones/:slug/review-summary` (`getReviewSummary(slug)`) | none | `{ summary, sentiment }` |
| Phone detail, ReviewsSection | `POST /phones/:slug/reviews` (`addReview(slug, { rating, text })`) (login) | `{ rating, text }` | `{ review }` |
| Compare | `GET /phones/compare` (`comparePhones(slugs)`) | `ids=a,b,c`, two or three slugs | `{ phones, best }` |
| Compare | `GET /phones/:slug` (`getPhone(slug)`) | one slug, for the single column | `{ phone, isFavourite }` |
| Compare | `GET /phones` (`listPhones({ q, limit: 5 })`) in the dialog | `q=<typed name>&limit=5` | `{ items, total, page, pages }` |
| Recommend | `POST /ai/recommend` (`recommend(needs)`) | `{ budget, brand, purpose, performance, camera, gaming, battery }`, token optional | `{ items: [{ phone, reason }], widened }` |
| Assistant | `POST /ai/chat` (`chat(messages)`, called by `send` in ChatContext) | `{ messages: [{ role, content }] }` | `{ reply, phones }` |
| Every page, the chat window | `POST /ai/chat` (`chat(messages)`, called by `send` in ChatContext) | `{ messages: [{ role, content }] }`, the same conversation as the Assistant page | `{ reply, phones }` |
| Dashboard | `GET /users/me/dashboard` (`getDashboard()`) (login) | none | `{ recentlyViewed, favourites, searchHistory, recommendations }` |
| Dashboard | `DELETE /users/me/favourites/:slug` (`removeFavourite(slug)`) (login) | none | `{ favourites }` |
| Log in | `POST /auth/login` (`login(body)` from `useAuth`) | `{ email, password }` | `{ token, user }`, saved by AuthContext |
| Create account | `POST /auth/register` (`register(body)` from `useAuth`) | `{ name, email, password }` | `{ token, user }`, saved by AuthContext |
| Forgot password | `POST /auth/forgot-password` (`forgotPassword(email)`) | `{ email }` | `{ sent: true }` |
| Reset password | `POST /auth/reset-password` (`resetPassword(token, password)`) | `{ token, password }` | `{ ok: true }` |
| Every page on load, with a saved token | `GET /auth/me` (`me()` inside AuthContext) (login) | none | `{ user }` |
| About, Page not found | none | | |

The error messages each call can send are in [API.md](API.md), and the ones each page shows are in [DATA-FLOW.md](DATA-FLOW.md).

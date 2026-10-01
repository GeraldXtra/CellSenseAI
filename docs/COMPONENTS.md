# Components

Ibrahim, Osakue, this file lists every reusable piece of the client: the shared components, the three contexts, the `useAsync` hook and every service function, and then your own components. The shared ones are mine, finished, and running against the live backend. Yours are stubs: one comment line and an empty function, waiting for you.

## Shared components (owner Gerald)

They live in `client/src/components/shared/`. Import them with a relative path, for example `import PhoneCard from '../../components/shared/PhoneCard.jsx'`.

| Component | What it does | Props |
| --- | --- | --- |
| Layout | The shell around every page: Navbar, the page content, Footer, ChatLauncher and ChatWindow. `App.jsx` puts every route inside it. On every new page it scrolls to the top, or to the element named after `#` in the address, such as `/dashboard#favourites`. It looks for that element once, when the page first draws, so a block an anchor points to must be on the page while its data loads. Going back or forward does not scroll to the top. You never render it yourself. | none |
| Navbar | The top bar: the logo mark and "CellSense AI", the links Browse, Compare, Recommend, Assistant and Dashboard, and "Log in" for a visitor. For a logged in user it shows the user's name with a chevron; a click on it opens AccountMenu, and a click outside or Escape closes it. Under 768px it shows the logo, a search icon that goes to `/search` and a menu icon. The menu panel holds the same links plus Log in or Log out, and closes on Escape or when the page changes. | none |
| AccountMenu | The small dropdown under the user's name with a Dashboard link and a Log out button. It calls `onClose` after either one. | `onClose` |
| Footer | Four link columns (Explore, Account, Brands, About), the Built by column, the three lines at the bottom and "Nigeria / English". | none |
| ChatLauncher | The fixed button at the bottom right, labelled "Open the assistant", that opens ChatWindow. It is a button, not a link: it calls `openWindow()` and never changes the page. Hidden on `/assistant` and while the window is open. Focus comes back to it when the window closes. | none |
| ChatWindow | The floating chat window, 380 by 560, fixed at the bottom right over the page without moving anything under it. Under 768px it fills the screen below the top bar, less a small margin on each side. It draws its own thread and form and reads everything from `useChat()`, so it shows the same conversation as the Assistant page. Details below the table. Layout renders it; you never render it yourself. | none |
| PhoneImage | The phone picture when `imageUrl` is set and the file loads, otherwise a grey box with the phone name. | `phone` (required, an object; pass `{}` when there is no phone), `className` |
| PhoneCard | The product card: the rank, the picture, the name, the spec line or the reason, the price with the Estimated label, the Compare checkbox and the "See details" link. | `phone` (required), `reason`, `estimated`, `rank`, `compare` (default `true`) |
| Loader | A spinner with a label, announced to screen readers. | `label` (default "Loading") |
| EmptyState | A centred grey box with a title, a message and an action. Each part shows only when you pass it. | `title`, `message`, `action` (a node, such as a Link or a button) |
| ProtectedRoute | Shows Loader with "Checking your account" while AuthContext checks a saved token. Sends a logged out person to `/login?next=<the page they asked for>`, with `replace`. Otherwise shows the page. `App.jsx` wraps Dashboard in it. | `children` |

### ChatWindow in detail

ChatWindow is mine. It does not use ChatThread or ChatInput: it draws its own bubbles and form, so it works on every page whatever state the Assistant page is in.

1. The header has the title "CellSense assistant", the "Open full page" link to `/assistant`, which also closes the window, and an x labelled "Close the assistant". Under them sits the grey line "Answers from the same phone data as the site."
2. Before the first message the thread shows "Ask about a phone, a price or a budget. I answer from the phones on this site." and three chips: "Best camera phone under $400?", "Compare Galaxy S24 and OnePlus 12" and "Which phone has the longest battery?". A chip sends its text.
3. Each message is a bubble: the user's on the right in near black, replies on the left in grey. Under a reply, each phone it named gets a compact row with the picture, the name, the price and "See details".
4. While `loading` is true the thread shows the typing dots, and the field and the send button are disabled. A failed send shows `error` in a bubble in the error colours.
5. The form has the field "Ask about a phone, a price or a budget" and a square send button labelled "Send". Enter sends. The text clears when the send worked and stays when it failed.
6. Escape closes the window while the focus is inside it. The field gets the focus when the window opens, and the thread scrolls to the newest message.
7. It shows nothing on `/assistant`, so the page and the window never sit on top of each other.

### PhoneImage in detail

With `phone.imageUrl` set, PhoneImage draws an `<img>` with the phone name as its alt text and lazy loading. When the file fails to load, it switches to the grey box for that address. With `imageUrl` empty it draws the grey box straight away: a `div` with the phone name as its text and its label. `className` goes onto the picture or the box. How both are sized is in [STYLING.md](STYLING.md).

### PhoneCard in detail

- `phone` needs `slug`, `brand`, `model`, `specs`, `price`, `imageUrl` and `source`. Every phone the API returns has them.
- `reason` shows a reason line in place of the spec line, as on Recommend and the dashboard recommendations.
- `estimated` forces the Estimated label on or off. Leave it out and the label shows when `phone.source` is `ai`.
- `rank` shows a number at the top left, as on Recommend.
- `compare={false}` hides the Compare checkbox. Otherwise the checkbox is ticked when the phone is in the compare list, adds or removes it through `useCompare`, and is disabled when the list already holds three other phones.
- The price shows as `$` and `price.current`.
- The picture and "See details" both go to `/phones/<slug>`.

### Two helpers

`phoneName(phone)` from `PhoneImage.jsx` gives "Brand Model", or just the model when the model already starts with the brand. `specLine(phone)` from `PhoneCard.jsx` gives the RAM, the storage, the main camera and the battery, such as "8 GB, 256 GB, 50 MP, 4000 mAh". Use them wherever you show a phone name or a spec line, so every page writes them the same way.

## The Page not found page

It lives in `client/src/pages/NotFound/` and is mine. It shows a tilted grey phone (PhoneImage with an empty phone), "Page not found", "That link does not exist." and a "Go home" button to `/`, and sets the browser tab title to "Page not found | CellSense AI" while it is open. `App.jsx` sends every unknown path to it.

## The contexts

The providers wrap the whole app in `main.jsx`, so every page and component can use the three hooks. Each hook throws an error when it is used outside its provider.

### AuthContext, `useAuth()`

| Value | What it is |
| --- | --- |
| `user` | `{ _id, name, email, role }` for a logged in person, or `null`. |
| `loading` | `true` while the site checks a saved token when it opens, `false` otherwise. |
| `login(body)` | Sends `{ email, password }`, saves the token, sets `user` and returns the user. Throws an error with the server's message when it fails. |
| `register(body)` | Sends `{ name, email, password }`, saves the token, sets `user` and returns the user. Throws an error with the server's message when it fails. |
| `logout()` | Clears the token and `user`. Nothing is sent to the server. |

When the site opens with a saved token, AuthContext calls `me()`. A 401 or 403 removes the token. Any other failure, such as the server being off, leaves the token in place and the person logged out until the next reload.

### CompareContext, `useCompare()`

| Value | What it is |
| --- | --- |
| `slugs` | The compare list: up to three slugs, kept in the browser under `cs_compare`, so it survives a reload. |
| `add(slug)` | Adds the slug. Returns `true` when the slug is in the list afterwards, and `false` when the list was already full. |
| `remove(slug)` | Takes the slug out of the list. |
| `clear()` | Empties the list. |
| `has(slug)` | `true` when the slug is in the list. |
| `max` | `3`. |
| `isFull` | `true` when the list holds three slugs. |

On `/compare?ids=a,b,c` the slugs from the address go to the front of the list, then the saved ones, up to three. This happens again whenever `?ids=` changes. The context reads the address but never writes it.

### ChatContext, `useChat()`

| Value | What it is |
| --- | --- |
| `messages` | The conversation, oldest first. A user message is `{ role: "user", content }`. A reply is `{ role: "assistant", content, phones }`, where `phones` holds the phones the reply named, at most three. |
| `loading` | `true` while a reply is on its way. |
| `error` | The message of the last failed send, or `null`. The next send clears it. |
| `open` | `true` while the floating window is open. |
| `openWindow()` | Opens the floating window. |
| `closeWindow()` | Closes it. |
| `send(text)` | Trims the text and sends it with the whole conversation. Returns `true` when the reply came back and `false` when it did not. |

`send` ignores empty text, and a second send while `loading` is true; both return `false`. It adds the question to `messages` at once and calls `chat(messages)` with the role and content of every message. On success it adds the reply with its phones. On failure it takes the question out again and puts the reason in `error`. The conversation lives in memory, so it survives moving between pages and is gone after a reload. ChatWindow and the Assistant page both read it, so neither keeps its own copy.

## The hook, `useAsync`

`useAsync(task, deps)` in `client/src/hooks/useAsync.js` runs `task`, a function that returns a promise, and returns `{ data, loading, error, reload }`.

| Value | What it is |
| --- | --- |
| `data` | What the promise gave, or `null`. While a new run is loading, the last `data` stays. After an error it is `null`. |
| `loading` | `true` while the task runs. It starts as `true`. |
| `error` | The error message as text, ready to show, or `null`. |
| `reload()` | Runs the task again. |

The task runs when the component first shows, whenever a value in `deps` changes, and after `reload()`. An answer that arrives after a newer run has started, or after the page has closed, is ignored. Put only plain values in `deps`, such as a slug or the address text. An object built while the page draws changes every time, so the page would load forever. [DATA-FLOW.md](DATA-FLOW.md) shows the full pattern.

## The services

They live in `client/src/services/`. Each function returns a promise of the `data` part of the reply. When a call fails, the promise rejects with an error whose `message` is the server's message, or "Could not reach the server. Check that it is running." when the server is off, and whose `status` is the HTTP status. Pages and components call these functions and never `axios` or `fetch` directly.

`api.js` holds what the services share: the axios instance with the base address `/api` (or `VITE_API_URL` when it is set), `getToken`, `setToken` and `clearToken`, which keep the token in the browser under `cs_token`, the `Authorization` header on every request, and the unwrapping of the envelope. Pages never import it.

| Function | File | Argument | Reply |
| --- | --- | --- | --- |
| `listPhones(params)` | `phones.service.js` | The query params of `GET /phones`. Params that are `undefined`, `null`, empty or `false` are dropped. | `{ items, total, page, pages }` |
| `getPhone(slug)` | `phones.service.js` | A slug | `{ phone, isFavourite }` |
| `comparePhones(slugs)` | `phones.service.js` | An array of two or three slugs, sent as `ids` | `{ phones, best }` |
| `getPriceTrend(slug)` | `phones.service.js` | A slug | `{ history, trend, suggestion }` |
| `getReviews(slug)` | `phones.service.js` | A slug | `{ items, average, count }` |
| `addReview(slug, body)` | `phones.service.js` | A slug and `{ rating, text }` | `{ review }` |
| `getReviewSummary(slug)` | `phones.service.js` | A slug | `{ summary, sentiment }` |
| `searchPhones(query)` | `ai.service.js` | The words typed | `{ items, filters, source }` |
| `chat(messages)` | `ai.service.js` | `[{ role, content }]`. ChatContext calls it; you call `send` instead. | `{ reply, phones }` |
| `recommend(needs)` | `ai.service.js` | `{ budget, brand, purpose, performance, camera, gaming, battery }` | `{ items: [{ phone, reason }], widened }` |
| `register(body)` | `auth.service.js` | `{ name, email, password }`. AuthContext calls it; you call `useAuth().register`. | `{ token, user }` |
| `login(body)` | `auth.service.js` | `{ email, password }`. AuthContext calls it; you call `useAuth().login`. | `{ token, user }` |
| `me()` | `auth.service.js` | none. AuthContext calls it when the site opens. | `{ user }` |
| `forgotPassword(email)` | `auth.service.js` | An email | `{ sent: true }` |
| `resetPassword(token, password)` | `auth.service.js` | The token from the address and the new password | `{ ok: true }` |
| `getDashboard()` | `users.service.js` | none | `{ recentlyViewed, favourites, searchHistory, recommendations }` |
| `addFavourite(slug)` | `users.service.js` | A slug | `{ favourites }` |
| `removeFavourite(slug)` | `users.service.js` | A slug | `{ favourites }` |

What each field of a reply holds, and each error message, is in [API.md](API.md).

## Ibrahim's components

Ibrahim, you own eight. They live in `client/src/components/ibrahim/`.

| Component | Used on | What it does |
| --- | --- | --- |
| SearchBar | Home, Search results | The big search field with the Search button. On submit it goes to `/search?q=<words>`. Takes an optional `initialValue` so Search results can show the current query. |
| UnderstoodChips | Search results | The "Understood as" label and one chip per filter, each with an x that removes that filter. Takes `filters` and `onRemove(key)`. |
| FilterStrip | Search results, Browse | The brand checkboxes, the price min and max inputs, the feature checkboxes (5G, 120Hz display, 8GB RAM or more, 5000mAh or more) and the Apply button, with vertical hairlines between the groups. Takes `value`, `onChange` and `onApply`. |
| BrandTabs | Browse | The tabs All, Samsung, Apple, OnePlus, Xiaomi, Vivo. The active tab is bold with an ink underline. Each tab is a link to `/browse` or `/browse/<brand>`. |
| SortSelect | Search results, Browse | The "Sort by:" select with Newest, Price low to high and Price high to low, which send `newest`, `priceAsc` and `priceDesc`. The server also accepts `camera` and `battery`. Takes `value` and `onChange`. |
| SpecTable | Phone detail | The two column Tech specs table: Processor, RAM, Storage, Main camera, Front camera on the left; Battery, Display, Refresh rate, Operating system, 5G on the right. Takes `specs`. |
| PriceHistoryChart | Phone detail | The recharts line chart of the price history with the dates on the x axis, the prices on the y axis and the caption "Guide prices. Each point is a price check." Takes `history`. |
| NoticeBar | Search results | The full width grey bar with the info icon, shown when the model added a phone. Takes `children` for the text. |

## Osakue's components

Osakue, you own eight. They live in `client/src/components/osakue/`.

| Component | Used on | What it does |
| --- | --- | --- |
| CompareTable | Compare | The spec table with one column per phone and the rows Price, Processor, RAM, Storage, Main camera, Front camera, Battery, Display, Refresh rate, Operating system. A cell whose slug is in `best` for its row uses `cs-cell-best`. Takes `phones` and `best`. |
| CompareSlots | Compare | The row of slots above the table: picture, model name and Remove for each phone, and the dashed "Add a phone" slot with the plus. Takes `phones`, `onRemove(slug)` and `onAdd()`. |
| AddPhoneDialog | Compare | The "Add a phone" dialog over the overlay: the x, the text field "Type a phone name", and the result rows with an Add button. Searches with `listPhones({ q, limit: 5 })`. Takes `open`, `onClose` and `onAdd(slug)`. |
| RecommendForm | Recommend | The white form card: Budget (US dollars), Brand, Purpose, Performance, the three checkboxes and "Show my top 3". Takes `onSubmit(needs)` and `loading`. |
| ChatThread | Assistant | The bubbles (user on the right in ink, replies on the left in the band grey), the PhoneCards under a reply, the typing dots, the error bubble, and the empty state text with the three suggestion chips. Takes `messages`, `loading`, `error` and `onSuggestion(text)`. |
| ChatInput | Assistant | The text field "Ask about a phone, a price or a budget" with the square send button. Takes `onSend(text)`, which returns the promise from `send`, `disabled`, and `initialValue` for the text from `?q=`. It clears the field when the promise gives `true` and keeps the text when it gives `false`. |
| ReviewsSection | Phone detail (Ibrahim places `<ReviewsSection slug={slug} />`) | The Summary card with "Based on N reviews", the Write a review form (Rating select, the text area, Post review) or a Log in link for a visitor, the review rows (author, "5 of 5", date, text), and the "No reviews yet. Be the first to write one." state. Loads its own data with `getReviews` and `getReviewSummary`. Takes `slug`. |
| AuthCard | Log in, Create account, Forgot password, Reset password | The centred white card (auth card width) with a heading, a sub line and whatever form or message the page puts inside. Takes `title`, `subtitle` and `children`. |

## Cross owner cases

* PhoneCard (mine) is used on Search results, Browse, Recommend, the Assistant page and the Dashboard.
* PhoneImage (mine) is inside PhoneCard and the chat window, and you use it on its own wherever a design shows a phone picture outside a card, such as Phone detail and the compare slots.
* SearchBar (Ibrahim) is used on Home and Search results.
* FilterStrip and SortSelect (Ibrahim) are used on Search results and Browse.
* ReviewsSection (Osakue) sits inside Phone detail (Ibrahim). Osakue builds it, Ibrahim places it.
* AuthCard (Osakue) is used on all four account pages.
* ChatWindow (mine) and the Assistant page (Osakue) show the same conversation. Both read it from `useChat()`, and neither keeps its own copy of the messages.

When you use a component the other one owns, use it as it is. If it needs a change, tell its owner, do not edit it on your branch.

## The rule

Use the shared component, never copy it. If it needs a new prop, ask me and I add it on `backend`.

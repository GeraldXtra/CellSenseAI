# Building your pages against the backend

Ibrahim, Osakue, the backend is finished. Every endpoint in [API.md](API.md) is live, so every page can now run on real data. This document is the exact contract for each page: what to call, what comes back, what to show, and what to do when something goes wrong. Build to this, and your page will match the server without guessing.

## Before you start

1. On your branch, run `git pull origin develop`.
2. Run the server on your laptop as [INSTALLATION.md](INSTALLATION.md) says: your own database user in `MONGODB_URI`, your own `JWT_SECRET`, and `npm run dev` in `server`. Then `npm run dev` in `client`.
3. Leave the three `AI_` lines in `server/.env` empty unless I give you a key. Without them the site still works, with four differences:
   - search is direct only, so a sentence like "phone under $400" finds nothing, while "galaxy s24" works;
   - the chat answers "The AI features are not set up yet", which is the error state of the window and the Assistant page;
   - recommendations still give three phones, with plain reasons;
   - the review summary is the star based line, and the "In plain words" box is empty on phones without a summary.
4. Never run `npm run seed` or `npm run prices`. Both write to the shared database. Only I run them.

## The pattern every page uses

Load data with `useAsync`, then handle three states: loading, error and ready.

```jsx
const { slug } = useParams();
const { data, loading, error, reload } = useAsync(() => getPhone(slug), [slug]);

if (loading) return <Loader label="Loading phone" />;
if (error)
  return (
    <EmptyState
      title="We could not load this phone"
      message={error}
      action={
        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={reload}
        >
          Try again
        </button>
      }
    />
  );

const { phone, isFavourite } = data;
```

- The second part, `[slug]`, lists the values that should load the data again when they change. Put only plain values in it, like a slug or the address text. Never an object you build while the page draws, or the page loads forever.
- `error` is the server's message as text, ready to show.
- `reload` runs the same request again. Use it for Try again, and after you change something.

Call only the functions in `src/services`. Never `axios` or `fetch` in a page. Never change the services, the contexts or the shared components on your branch; if a reply is missing something, tell me and I add it.

## Every function you can call

| Function                            | File                | Calls                               | Gives you                                                        |
| ----------------------------------- | ------------------- | ----------------------------------- | ---------------------------------------------------------------- |
| `listPhones(params)`                | `phones.service.js` | `GET /phones`                       | `{ items, total, page, pages }`                                  |
| `getPhone(slug)`                    | `phones.service.js` | `GET /phones/:slug`                 | `{ phone, isFavourite }`                                         |
| `comparePhones(slugs)`              | `phones.service.js` | `GET /phones/compare`               | `{ phones, best }`                                               |
| `getPriceTrend(slug)`               | `phones.service.js` | `GET /phones/:slug/price-trend`     | `{ history, trend, suggestion }`                                 |
| `getReviews(slug)`                  | `phones.service.js` | `GET /phones/:slug/reviews`         | `{ items, average, count }`                                      |
| `addReview(slug, { rating, text })` | `phones.service.js` | `POST /phones/:slug/reviews`        | `{ review }`                                                     |
| `getReviewSummary(slug)`            | `phones.service.js` | `GET /phones/:slug/review-summary`  | `{ summary, sentiment }`                                         |
| `searchPhones(query)`               | `ai.service.js`     | `POST /ai/search`                   | `{ items, filters, source }`                                     |
| `recommend(needs)`                  | `ai.service.js`     | `POST /ai/recommend`                | `{ items: [{ phone, reason }], widened }`                        |
| `getDashboard()`                    | `users.service.js`  | `GET /users/me/dashboard`           | `{ recentlyViewed, favourites, searchHistory, recommendations }` |
| `addFavourite(slug)`                | `users.service.js`  | `POST /users/me/favourites/:slug`   | `{ favourites }`                                                 |
| `removeFavourite(slug)`             | `users.service.js`  | `DELETE /users/me/favourites/:slug` | `{ favourites }`                                                 |
| `forgotPassword(email)`             | `auth.service.js`   | `POST /auth/forgot-password`        | `{ sent: true }`                                                 |
| `resetPassword(token, password)`    | `auth.service.js`   | `POST /auth/reset-password`         | `{ ok: true }`                                                   |

Three things you do not call directly:

- `login` and `register` come from `useAuth()`, which saves the token and sets the user.
- The chat goes through `useChat()`; `send(text)` calls the server for you.
- `me()` runs by itself when the site opens.

A phone object always has `slug`, `brand`, `model`, `category`, `releaseYear`, `specs` (`processor`, `ram`, `storage`, `mainCamera`, `frontCamera`, `battery`, `displaySize`, `displayType`, `refreshRate`, `os`, `has5G`), `price` (`current`, `currency`, `updatedAt`), `imageUrl` and `source`. Most replies also carry `priceHistory` and `aiSummary`; the phones inside a chat reply and a recommendation leave them out, so read those two only on Phone detail, where this document says to. A phone with `source` equal to `ai` was added by the model: show the "Estimated" label on its price, which PhoneCard does by itself.

## Ibrahim's pages

### Home

- **Data:** one call, for the compare preview in the design: `comparePhones(['samsung-galaxy-s24', 'xiaomi-redmi-note-13-pro'])`. Show the four rows Camera, Battery, RAM and Price, with `specs.mainCamera`, `specs.battery`, `specs.ram` and `price.current`, and make a cell bold when `best[row]` includes that phone's slug. Nothing else on the page needs the server.
- **Clicks:** the search bar goes to `/search?q=<what they typed>`; the three chevron links go to `/search?q=<their text>`; Open compare goes to `/compare`; Open the assistant goes to `/assistant`; each brand tile goes to `/browse/<brand>`.

### Search results

- **Data:** read `q` from the address and call `searchPhones(q)` with `[q]` as the list. You get `{ items, filters, source }`.
- **The "Understood as" chips:** only when `source` is `ai`. Each key in `filters` becomes one chip: `maxPrice: 400` is "Max price $400", `minPrice: 200` is "Min price $200", `minCamera: 48` is "Camera 48MP or more", `minBattery: 5000` is "Battery 5000mAh or more", `minRam: 8` is "8GB RAM or more", `minStorage: 128` is "128GB storage or more", `minRefresh: 120` is "120Hz display", `has5G: true` is "5G", `brand: Samsung` is "Samsung", `category: flagship` is "Flagship", `sort: camera` is "Sorted by camera", `q: Galaxy S24` is "Galaxy S24".
- **Removing a chip or applying the filter strip:** call `listPhones` with the filters that are left. It follows the same rules, so no new endpoint is needed. Put the filters in the address so the list reloads.
- **No phones:** the empty state from `search-no-results.png`. The "Ask the assistant" button goes to `/assistant?q=<the query>`, and the Assistant page puts that text in its input.
- **A phone the model added:** when any item has `source` equal to `ai`, show the NoticeBar from `search-added-by-assistant.png` above the cards. The Estimated label on the price appears by itself.

### Browse

- **Data:** build `params` and `key` from the address, so the list reloads whenever a filter changes it:
  ```jsx
  const { brand } = useParams();
  const [searchParams] = useSearchParams();
  const key = `${brand ?? ""}?${searchParams.toString()}`;
  const params = {
    ...Object.fromEntries(searchParams),
    ...(brand ? { brand } : {}),
  };
  const { data, loading, error } = useAsync(() => listPhones(params), [key]);
  ```
  You get `{ items, total, page, pages }`.
- **The tabs:** `/browse` for all, `/browse/samsung` and so on for one brand. The address is the state.
- **The filter strip and the sort:** write them into the address as `minPrice`, `maxPrice`, `has5G=true`, `minRam=8`, `minBattery=5000`, `minRefresh=120` and `sort` (`newest`, `priceAsc`, `priceDesc`, `camera` or `battery`). The default page size is 24; add `page=2` for the next page, and use `pages` to know whether there is one.
- **The count line:** `total` gives "12 phones".

### Phone detail

- **Data, two calls with `[slug]` as the list:**
  - `getPhone(slug)` gives `{ phone, isFavourite }`.
  - `getPriceTrend(slug)` gives `{ history, trend, suggestion }`.
  - ReviewsSection, Osakue's, loads its own.
- **The price block:** `phone.price.current`, and "Guide price, checked" with `phone.price.updatedAt` formatted as 22 Sep 2026.
- **The trend note:** show `suggestion` in the orange from the theme only when `trend` is `falling`, as in `phone-detail.png`, and in grey otherwise.
- **The chart:** `history` is oldest first, each point `{ price, date, source }`. Caption it "Guide prices. Each point is a price check."
- **The "In plain words" box:** `phone.aiSummary`. When it is empty, leave the box out.
- **Save to favourites:** when `user` from `useAuth()` is empty, the button goes to `/login?next=/phones/<slug>`. When they are logged in, call `addFavourite(slug)`, then `reload()`, and the button reads "Saved" because `isFavourite` is now true.
- **Add to compare:** `useCompare().add(slug)`, then go to `/compare`.
- **Breadcrumb:** Home goes to `/`, the brand goes to `/browse/<brand>`.
- **Estimated:** when `phone.source` is `ai`, show the Estimated label next to the price and the same note as on Search results.
- **Place** `<ReviewsSection slug={slug} />` where the design shows it.
- **Error:** a slug that does not exist gives "Phone not found". Show it with EmptyState and a link back to Browse.

### About

No data. Text and links only, with the four anchors the footer links to: `#about`, `#askme`, `#how-prices-work` and `#contact`. Check `Footer.jsx` for the exact ids before you write them.

## Osakue's pages and components

### ReviewsSection, placed on Phone detail

- **Data:** `getReviews(slug)` gives `{ items, average, count }`, each item with `author`, `rating`, `text`, `sentiment` and `createdAt`. `getReviewSummary(slug)` gives `{ summary, sentiment }`.
- **The summary card:** `summary` as the text, and "Based on N reviews" with `count`. With no reviews, `summary` is "No reviews yet. Be the first to write one."
- **The form:** `rating` is a whole number from 1 to 5, `text` is 3 to 1000 characters. Logged in, Post review calls `addReview(slug, { rating, text })`, then reload both calls. Logged out, show a Log in link to `/login?next=/phones/<slug>` in place of the form.
- **Messages to show as they come:** "Choose a rating from 1 to 5", "Write a few words about the phone", "Keep the review under 1000 characters", and "You have already reviewed this phone" for a second review from the same person.

### Compare

- **Data:** take `slugs` from `useCompare()`.
  - Two or three slugs: `comparePhones(slugs)` with `[slugs.join(',')]` as the list. You get `{ phones, best }`. `phones` keep the order of the slugs.
  - One slug: `getPhone(slug)` for the single column in `compare-one-phone.png`.
  - None: the empty state with Browse phones.
- **Bold cells:** a cell is bold when `best[row]` includes that phone's slug. The rows in `best` are `price`, `ram`, `storage`, `mainCamera`, `frontCamera`, `battery`, `displaySize` and `refreshRate`. A row that is missing from `best` has no winner. Processor, display type and operating system are text and never bold. Bold what `best` says, not what `compare.png` shows: the image bolds both $699 prices by mistake, and the cheapest price wins.
- **Remove:** `useCompare().remove(slug)`. The context does not touch the address, so keep it in step yourself: whenever `slugs` changes, write `?ids=` with `setSearchParams(slugs.length ? { ids: slugs.join(',') } : {}, { replace: true })`. Then a reload or a shared link always shows the same phones, after an add as well as a remove.
- **Add a phone:** the dialog searches with `listPhones({ q: <what they typed>, limit: 5 })` and Add calls `useCompare().add(slug)`. The compare list holds at most three; `isFull` from `useCompare()` tells you when to disable Add.
- **The verdict card:** there is no verdict endpoint, so the card says "The assistant can tell you which of these phones suits you best." Its Ask the assistant link goes to `/assistant?q=` with a question that names the phones on the page, for example `Which should I buy: Samsung Galaxy S24, OnePlus 12 or Xiaomi Redmi Note 13 Pro?`. Build the names with `phoneName(phone)` and wrap the question in `encodeURIComponent`. Full names matter, because the assistant finds phones by their full names.
- **Errors:** "Choose at least two phones to compare" cannot happen if you follow the rule above. "Could not find at least two of those phones" comes when fewer than two of the slugs exist; show it with EmptyState. One wrong slug among three is dropped quietly and the other two come back, so when `phones` is shorter than `slugs`, call `remove` for each slug that did not come back. Then the list, the address and the page agree.

### Recommend

- **Data:** RecommendForm sends `recommend(needs)` with exactly these values:
  - `budget`: a number from 50 to 5000;
  - `brand`: `any` or a brand name;
  - `purpose`: `everyday`, `photos`, `gaming` or `work`;
  - `performance`: `basic`, `balanced` or `high`;
  - `camera`, `gaming`, `battery`: `true` or `false`.
    The labels on the form can say anything, as long as each option sends one of these values.
- **The reply:** `{ items: [{ phone, reason }], widened }`. Draw each item as a PhoneCard with `rank`, `reason` and `compare={false}`. When `widened` is true, add the line "Few phones fit your budget, so we looked a little above it." When `items` is empty, show the empty state "No phones fit that budget. Try a higher one."
- **Messages:** "Enter a budget between 50 and 5000 US dollars" for a bad budget.
- **Logged in:** the picks are saved to the dashboard by the server; nothing to do on your side.

### Assistant page

- **Data:** everything from `useChat()`: `messages`, `loading`, `error`, `send`. Keep no message state of your own, so the page and the floating window always show the same conversation.
- **Messages:** each is `{ role, content, phones }`. `role` is `user` or `assistant`. `phones` exists on replies and holds the phones the assistant named, at most three; draw them as PhoneCards under that bubble.
- **Sending:** `send(text)` returns `true` on success and `false` on failure. Clear the input on `true`, keep the text on `false`. The server keeps the last 12 messages, so long conversations stay fast.
- **Prefill:** when the address has `?q=`, put that text in the input.
- **States:** the empty state with the three chips from `assistant-empty.png`, the typing dots while `loading` is true, and `error` as a reply bubble in the error colours. "The AI features are not set up yet" is what a laptop without the key sees. "Too many questions at once. Wait a minute and try again." comes after 20 requests in a minute from one address, and searches and recommendations count towards the same 20.

### Dashboard

- **Data:** `getDashboard()` with `[]` as the list. You get:
  - `recentlyViewed`: phones, newest first, at most 20;
  - `favourites`: phones, newest first;
  - `searchHistory`: `{ query, filters, at }` entries, newest first, at most 50;
  - `recommendations`: `{ phone, reason, at }` entries, the last three picks.
- **Remove on a favourite:** `removeFavourite(slug)`, then `reload()`.
- **A search history row** goes to `/search?q=<that query>`. Show `at` as Today or Yesterday when it is, otherwise as the day and month, like 18 Sep, as in `dashboard.png`.
- **A recommendation** is a PhoneCard with `reason` and `compare={false}`.
- **A new account** has four empty lists, which is `dashboard-new-account.png`.
- ProtectedRoute already sends a logged out visitor to log in, so the page never loads without a user.

### Log in and Create account

- `login({ email, password })` and `register({ name, email, password })` from `useAuth()`. Never `auth.service.js` directly; the context is what saves the token and sets the user, and that is what makes the top bar show the name with the chevron.
- After success, go to the page in `?next=` when it is an address inside our site, otherwise to `/`, with `replace: true`. Someone already logged in who opens either page goes to `/`.
- The links between the two pages keep `?next=`.
- **Messages to show as they come:** "Email and password are required", "Wrong email or password", "Name, email and password are required", "Enter a valid email address", "Password must be at least 8 characters", "An account with that email already exists", and "Could not reach the server" when the backend is not running.

### Forgot password

- **Sending:** `forgotPassword(email)` gives `{ sent: true }`, always, whether or not the email has an account. Show the sent state from `forget-password-sent.png`. Send it again calls the same function.
- **On your laptop,** the link prints in your server terminal, because the mail settings are empty. Copy it into the browser to test the next page.
- **Messages:** "Enter a valid email address", and "Too many reset requests. Try again in 15 minutes." after five requests from one address.

### Reset password

- **The token** comes from the address `/reset-password/:token`, through `useParams()`.
- **Saving:** `resetPassword(token, password)` gives `{ ok: true }`. Show the saved state from `reset-password-saved.png` with its Log in button to `/login`. The person is not logged in automatically.
- **Messages:** "Password must be at least 8 characters", "This reset link is not complete. Open the link from the email again." and "This reset link is invalid or has expired. Ask for a new one." Show the last one with a link to `/forgot-password`. A link works once and for one hour.

## The floating chat window

It is mine. Every page gets it through Layout, and it shows the same conversation as the Assistant page. You do nothing for it.

## Dates and names

- Dates: `new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })`, except the search history rows on the Dashboard, which follow the design as described there.
- Names: `phoneName(phone)` from `PhoneImage.jsx`. Spec lines: `specLine(phone)` from `PhoneCard.jsx`. Use them everywhere so every page writes them the same way.
- Prices: `phone.price.current`, never `phone.price`.

## Images

Every phone already has its picture path in `imageUrl`, but the files are not in `client/public/phones` yet, so PhoneImage shows a grey placeholder with the name. When the files arrive, the pictures show by themselves. Nothing changes on your pages.

## When something does not work

- **"Could not reach the server"**: the backend is not running. Start it with `npm run dev` in `server`.
- **"Please log in"**: the page needs a login, or the token expired after seven days. Log in again.
- **"Too many requests. Try again in a few minutes."**: more than 300 requests in 15 minutes from your laptop. Wait.
- **A page that keeps loading**: check the list in `useAsync`. It must hold only plain values.
- **Anything else:** the server terminal prints one line per request with its status code, and the Network tab in the browser shows the reply. Send me both.

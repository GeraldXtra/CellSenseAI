# Dashboard

Osakue, you own the Dashboard page. It needs login; `App.jsx` already wraps it in ProtectedRoute, so a logged out person never reaches your code.

## Owner and branch

Owner: Osakue. Branch: `osakue`. Files: `Dashboard.jsx` and `Dashboard.css` in this folder. Import the css at the top of the page file.

## Routes

Path: `/dashboard`. No parameters. Login required: ProtectedRoute sends a logged out person to `/login?next=/dashboard`. The footer links "Favourites" and "Search history" land on `/dashboard#favourites` and `/dashboard#search-history`, so give those two cards those ids. Layout scrolls to the anchor once, when the page first draws, so draw the two cards while the data loads. When the page opens straight from the address, ProtectedRoute is still checking the login at that moment, so also scroll the card into view yourself once the data has loaded. Example: `http://localhost:5173/dashboard`.

Where every click on this page leads, from `docs/ROUTES.md`:

| What | Leads to |
| --- | --- |
| "Compare" checkbox on a recently viewed card | `useCompare().add(slug)` or `remove(slug)`, PhoneCard does it |
| "See details" on any card | `/phones/<slug>`, PhoneCard does it |
| "Remove" in Favourites | `removeFavourite(slug)`, then `reload()` |
| A search history row | `/search?q=<query>` |
| "Browse phones" (empty recently viewed) | `/browse` |
| "Get a recommendation" (empty recommendations) | `/recommend` |

## Designs to match

- `docs/ui/dashboard.png`: an account with history, logged in as Gerald.
- `docs/ui/dashboard-new-account.png`: a new account with nothing yet, logged in as Amina.

## What must be on it

Top to bottom, from `dashboard.png`.

1. White band: heading "Your dashboard" in `.cs-heading`, sub line "Signed in as Gerald. Your history stays on this account only." The name comes from `useAuth().user.name`.
2. Grey band "Recently viewed" (`--cs-size-section-title`, centred): PhoneCards in `.cs-grid`, three per row. In the design: Samsung Galaxy S24 $699, OnePlus 12 $699, Vivo V30 $399, each with Compare and See details. The list comes newest first, so show it in that order.
3. White band with two `.cs-card` side by side. Left, id `favourites`: heading "Favourites" in `--cs-size-block-title`, then one row per favourite with a hairline between rows: a small PhoneImage, the name in `--cs-weight-medium` with the price in `.cs-price` under it, and "Remove" on the right in `--cs-ink-soft`. In the design: Xiaomi Redmi Note 13 Pro $299, Samsung Galaxy A15 5G $199. Right, id `search-history`: heading "Search history", then one row per search: the query on the left as a Link to `/search?q=<query>`, the day on the right in `--cs-ink-soft`: "Today", "Yesterday", or the date as "18 Sep". Rows: "phone under $400 with a great camera" Today; "5G phone with long battery life" Yesterday; "Samsung Galaxy S24" 18 Sep.
4. Grey band "Recommended for you": PhoneCards with `reason` and `compare={false}`: OnePlus 12 $699 "Best battery and RAM for your budget"; Xiaomi Redmi Note 13 Pro $299 "Highest camera resolution in your searches"; Vivo V30 $399 "Strong front camera, well under budget".

`dashboard-new-account.png`: the heading with "Signed in as Amina."; Recently viewed shows an EmptyState with "Phones you open will appear here." and the action "Browse phones" as a `.cs-link-chevron` to `/browse`; the Favourites card shows "No favourites yet. Use Save to favourites on any phone." in `--cs-ink-soft`; the Search history card shows "No searches yet."; Recommended for you shows an EmptyState with "Answer five quick questions and we show the phones that fit." and a `btn btn-primary` "Get a recommendation" to `/recommend`.

## Components to use

- Shared: PhoneCard, PhoneImage, Loader, EmptyState, and `phoneName` from `PhoneImage.jsx` for the favourite rows. `useAuth` for the name.
- Yours: none new. Keep the favourite row and the history row as small functions inside `Dashboard.jsx`.

## Data

The endpoints are live. The exact contract for this page is in [`docs/DATA-FLOW.md`, Dashboard](../../../../docs/DATA-FLOW.md#dashboard).

- Services, from `src/services/users.service.js`: `getDashboard()` through `useAsync` with `[]` as the list, and `removeFavourite(slug)` followed by `reload()`. Login is required; `api.js` sends the token.
- Contexts: `useAuth()` for `user.name` in the sub line.
- Reply of `getDashboard`:

```js
{
  recentlyViewed: [phone],
  favourites: [phone],
  searchHistory: [
    { query: "samsung", filters: { q: "samsung" }, at: "2026-10-01T10:00:00.000Z" }
  ],
  recommendations: [
    { phone, reason: "Guide price $289, with a 200 MP main camera.", at: "2026-10-01T10:05:00.000Z" }
  ]
}
```

`recentlyViewed` holds whole phone documents, newest first, at most 20. `favourites` holds whole phone documents, the latest saved first. `searchHistory` is newest first, at most 50. `recommendations` holds the picks of the last recommendation, up to three, each with its `phone` as a whole phone document. A new account gets four empty lists, which is `dashboard-new-account.png`. Each phone is shaped as in [`docs/TEAM-GUIDE.md`](../../../../docs/TEAM-GUIDE.md#the-phone-shape).

- Reply of `removeFavourite`: `{ favourites: [phone] }`. You do not read it; `reload()` brings the whole dashboard back.

To see the page, run the server as `docs/INSTALLATION.md` says, create an account on the Create account page and log in with it.

## The states to handle

- Loading: a Loader inside each of the four blocks while `getDashboard` runs. The heading and the four block titles show at once, so the `favourites` and `search-history` ids are on the page from the start.
- Empty: every block has its own empty state as in `dashboard-new-account.png`. A block can be empty while the others have data.
- Error: a short line with the message and a "Try again" button that calls `reload`.
- Removing a favourite: call `removeFavourite(slug)`, then `reload()`; if the call fails, show its message under the card.
- Anchor: when the page opens with `#favourites` or `#search-history`, the card with that id must come into view, as described under Routes.

## Done checklist

1. The page works at 375px, 768px and 1280px and never scrolls sideways. The two cards stack under 1280px, the phone cards go one per row under 768px.
2. No hex codes or pixel values outside `client/src/styles/theme.css`.
3. The page sits inside the shared layout and uses the shared components.
4. The loading, empty and error states exist.
5. Data comes from `src/services` as `docs/DATA-FLOW.md` says for this page, never from fetch or axios inside a page, and the page does not import `src/data/mockPhones.js`.
6. No errors in the browser console.
7. Screenshots at phone size and desktop size are attached to the pull request.
8. Matches the image at 1280px.

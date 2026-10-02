# Browse

Ibrahim, you own the Browse page and the brand pages. One component does both: the brand comes from the URL.

## Owner and branch

Owner: Ibrahim. Branch: `ibrahim`. Files: `Browse.jsx` and `Browse.css` in this folder. Import the css at the top of the page file.

## Routes

Paths: `/browse` and `/browse/:brand`. Read `brand` with `useParams`; it is lowercase in the URL (`/browse/samsung`). Send it as it is in the `brand` param, because the server matches the brand ignoring capitals. For the heading, match it against the five names, Samsung, Apple, OnePlus, Xiaomi and Vivo, ignoring capitals, to get the display name ("Samsung"). The strip, the sort and the page live in the query string: `minPrice`, `maxPrice`, `has5G=true`, `minRam=8`, `minBattery=5000`, `minRefresh=120`, `sort` and `page`. Examples: `http://localhost:5173/browse`, `http://localhost:5173/browse/samsung?has5G=true&sort=priceAsc`.

Where every click on this page leads, from `docs/ROUTES.md`:

| What | Leads to |
| --- | --- |
| Tab "All" | `/browse` |
| Tab Samsung, Apple, OnePlus, Xiaomi, Vivo | `/browse/samsung`, `/browse/apple`, `/browse/oneplus`, `/browse/xiaomi`, `/browse/vivo` |
| The strip checkboxes and inputs | Change the strip values, nothing runs until Apply |
| "Apply" | Writes the strip values into the address, which runs `listPhones(params)` with the brand from the path |
| "Sort by" select | Writes `sort` into the address, which runs `listPhones({ ...params, sort })` |
| "Compare" checkbox on a card | `useCompare().add(slug)` or `remove(slug)`, PhoneCard does it |
| "See details" on a card | `/phones/<slug>`, PhoneCard does it |

## Designs to match

- `docs/ui/browse.png`: Browse with the Samsung tab active.

## What must be on it

Top to bottom, from `browse.png`.

1. White band: heading "Browse phones" in `.cs-heading`, sub line "Pick a brand or set a price range." in `.cs-subheading`.
2. BrandTabs in a row, centred: All, Samsung, Apple, OnePlus, Xiaomi, Vivo. The active tab is bold with an ink underline (`--cs-ink`, hairline thickness from the theme). Each tab is a Link. On `/browse` the All tab is active.
3. FilterStrip on white with a hairline above and below: Brand (Samsung checked because the URL says samsung), Price ("0" and "1000"), Features (5G, 120Hz display, 8GB RAM or more, 5000mAh or more, none checked), and the "Apply" button. Vertical hairlines in `--cs-line-strong` between the groups. No "Filters" link and no sort here; the sort sits in the next band.
4. Grey band (`.cs-section .cs-section-alt`): on the right, SortSelect showing "Sort by: Newest". On the left, the heading "Samsung" (or "All phones" on `/browse`) in `--cs-size-section-title`, left aligned, with "2 phones" under it in `--cs-ink-soft`. Then PhoneCards in `.cs-grid`. In the design the third slot of the row is an empty grey box; leave the slot empty, the band shows through.
5. Pagination is not in the design. A page holds 24 phones, and the All tab shows every phone, so it runs to more than one page. The API returns `page` and `pages`; when `pages` is more than one, add plain `btn btn-outline-primary` buttons under the grid for the previous and the next page that write `page` into the address. Use `pages` to know whether there is a next one.

## Components to use

- Shared: PhoneCard, Loader, EmptyState.
- Yours: BrandTabs, FilterStrip (shared with Search results), SortSelect (shared with Search results).

## Data

The endpoint is live. The exact contract for this page, with the code that builds `params` and the `key` from the address, is in [`docs/DATA-FLOW.md`, Browse](../../../../docs/DATA-FLOW.md#browse).

- Service: `listPhones(params)` from `src/services/phones.service.js`, through `useAsync` with the address `key` as the list, so the list reloads whenever the path or the query string changes. `params` holds the brand from the path and everything in the query string. `listPhones` drops empty values, so an empty price box filters nothing.
- Contexts: none directly. PhoneCard uses `useCompare` inside for its Compare checkbox.
- Reply: one page of whole phone documents, as in [`docs/TEAM-GUIDE.md`](../../../../docs/TEAM-GUIDE.md#the-phone-shape), with the count of every phone that matches and the page numbers:

```js
{ items: [phone], total: 12, page: 1, pages: 1 }
```

`total` gives the count line, such as "12 phones". `pages` is at least 1. The sort values are `newest` (the default), `priceAsc`, `priceDesc`, `camera` and `battery`.

## The states to handle

- Loading: Loader in place of the grid while the call runs. Keep the tabs and the strip visible.
- Empty: EmptyState with "No phones match these filters." and a "Clear filters" action that resets the strip.
- Error: a short line with the message and a "Try again" button that calls `reload`.
- Unknown brand in the URL, for example `/browse/nokia`: the server finds no phone for it, so the empty state shows.

## Done checklist

1. The page works at 375px, 768px and 1280px and never scrolls sideways. The tabs scroll sideways inside their own row under 768px, the strip stacks, the cards go one per row.
2. No hex codes or pixel values outside `client/src/styles/theme.css`.
3. The page sits inside the shared layout and uses the shared components.
4. The loading, empty and error states exist.
5. Data comes from `src/services` as `docs/DATA-FLOW.md` says for this page, never from fetch or axios inside a page, and the page does not import `src/data/mockPhones.js`.
6. No errors in the browser console.
7. Screenshots at phone size and desktop size are attached to the pull request.
8. Matches the image at 1280px.

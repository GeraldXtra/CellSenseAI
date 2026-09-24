# Browse

Ibrahim, you own the Browse page and the brand pages. One component does both: the brand comes from the URL.

## Owner and branch

Owner: Ibrahim. Branch: `ibrahim`. Files: `Browse.jsx` and `Browse.css` in this folder. Import the css at the top of the page file.

## Routes

Paths: `/browse` and `/browse/:brand`. Read `brand` with `useParams`; it is lowercase in the URL (`/browse/samsung`). Match it against the `brands` list ignoring case to get the display name ("Samsung") for the heading and the `brand` param. Examples: `http://localhost:5173/browse`, `http://localhost:5173/browse/samsung`.

Where every click on this page leads, from `docs/ROUTES.md`:

| What | Leads to |
| --- | --- |
| Tab "All" | `/browse` |
| Tab Samsung, Apple, OnePlus, Xiaomi, Vivo | `/browse/samsung`, `/browse/apple`, `/browse/oneplus`, `/browse/xiaomi`, `/browse/vivo` |
| The strip checkboxes and inputs | Change the strip values, nothing runs until Apply |
| "Apply" | `listPhones(params)` with the strip values and the brand from the URL |
| "Sort by" select | `listPhones({ ...params, sort })` |
| "Compare" checkbox on a card | `useCompare.add(slug)` or `remove(slug)`, PhoneCard does it |
| "See details" on a card | `/phones/<slug>`, PhoneCard does it |

## Designs to match

- `docs/ui/browse.png`: Browse with the Samsung tab active.

## What must be on it

Top to bottom, from `browse.png`.

1. White band: heading "Browse phones" in `.cs-heading`, sub line "Pick a brand or set a price range." in `.cs-subheading`.
2. BrandTabs in a row, centred: All, Samsung, Apple, OnePlus, Xiaomi, Vivo. The active tab is bold with an ink underline (`--cs-ink`, hairline thickness from the theme). Each tab is a Link. On `/browse` the All tab is active.
3. FilterStrip on white with a hairline above and below: Brand (Samsung checked because the URL says samsung), Price ("0" and "1000"), Features (5G, 120Hz display, 8GB RAM or more, 5000mAh or more, none checked), and the "Apply" button. Vertical hairlines in `--cs-line-strong` between the groups. No "Filters" link and no sort here; the sort sits in the next band.
4. Grey band (`.cs-section .cs-section-alt`): on the right, SortSelect showing "Sort by: Newest". On the left, the heading "Samsung" (or "All phones" on `/browse`) in `--cs-size-section-title`, left aligned, with "2 phones" under it in `--cs-ink-soft`. Then PhoneCards in `.cs-grid`. In the design the third slot of the row is an empty grey box; leave the slot empty, the band shows through.
5. Pagination is not in the design. The API returns `page` and `pages`; when `pages` is more than one, add a plain "Load more" `btn btn-outline-primary` under the grid that calls `listPhones` with the next page and appends the items.

## Components to use

- Shared: PhoneCard, Loader, EmptyState.
- Yours: BrandTabs, FilterStrip (shared with Search results), SortSelect (shared with Search results).

## Services to call

- `listPhones(params)` from `src/services/phones.service.js` returns `{ items, total, page, pages }`. Params: `brand`, `minPrice`, `maxPrice`, `has5G`, `minRam`, `minStorage`, `minCamera`, `minBattery`, `minRefresh`, `category`, `q`, `sort` (`newest`, `priceAsc`, `priceDesc`), `page`, `limit` (max 50). Send only the values the person set. Call it when the brand in the URL changes, on Apply and on a sort change.

## Mock data until the backend is ready

The endpoint answers 404 today. Import `mockPhones` and `brands` from `src/data/mockPhones.js` and filter in the page: by brand ignoring case, by `price.current` between min and max, by `specs.has5G`, `specs.refreshRate >= 120`, `specs.ram >= 8`, `specs.battery >= 5000`. Sort by `releaseYear` for newest and by `price.current` for the two price orders. The Samsung tab gives two phones, as in the design. I tell you when to swap to `listPhones`.

## The states to handle

- Loading: Loader in place of the grid while the call runs. Keep the tabs and the strip visible.
- Empty: EmptyState with "No phones match these filters." and a "Clear filters" action that resets the strip.
- Error: a short line with the message and a "Try again" button that calls `reload`.
- Unknown brand in the URL, for example `/browse/nokia`: treat it as All and show "All phones".

## Done checklist

1. The page works at 375px, 768px and 1280px and never scrolls sideways. The tabs scroll sideways inside their own row under 768px, the strip stacks, the cards go one per row.
2. No hex codes or pixel values outside `client/src/styles/theme.css`.
3. The page sits inside the shared layout and uses the shared components.
4. The loading, empty and error states exist.
5. Data comes from `src/services` or `src/data/mockPhones.js`, never from fetch or axios inside a page.
6. No errors in the browser console.
7. Screenshots at phone size and desktop size are attached to the pull request.
8. Matches the image at 1280px.

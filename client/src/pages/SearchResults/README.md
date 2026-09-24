# Search results

Ibrahim, you own the Search results page. It has three states in the designs, and all three must be built.

## Owner and branch

Owner: Ibrahim. Branch: `ibrahim`. Files: `SearchResults.jsx` and `SearchResults.css` in this folder. Import the css at the top of the page file.

## Routes

Path: `/search?q=<words>`. Read `q` with `useSearchParams`. Example: `http://localhost:5173/search?q=phone%20under%20%24400%20with%20a%20great%20camera`. The mobile search icon in the top bar opens `/search` with no `q`; show the search bar and nothing else in that case.

Where every click on this page leads, from `docs/ROUTES.md`:

| What | Leads to |
| --- | --- |
| Search button, or Enter | `/search?q=<words>`, then `searchPhones(q)` |
| A chip's x | Removes that filter and calls `listPhones` with the remaining filters |
| "Filters" | Scrolls to the filter strip, which sits above the results as in `search-result.png` |
| "Sort by" select | `listPhones({ ...filters, sort })` |
| Brand checkboxes, price min and max, feature checkboxes | Change the strip values, nothing runs until Apply |
| "Apply" | `listPhones` with the strip values: `brand`, `minPrice`, `maxPrice`, `has5G`, `minRefresh: 120` for "120Hz display", `minRam: 8` for "8GB RAM or more", `minBattery: 5000` for "5000mAh or more" |
| "Compare" checkbox on a card | `useCompare.add(slug)` or `remove(slug)`, PhoneCard does it |
| "See details" on a card | `/phones/<slug>`, PhoneCard does it |
| "Clear filters" (no results state) | Empties the chips and the strip, calls `listPhones({ q })` |
| "Ask the assistant" (no results state) | `/assistant` |

## Designs to match

- `docs/ui/search-result.png`: three phones found.
- `docs/ui/search-no-results.png`: nothing found.
- `docs/ui/search-added-by-assistant.png`: the assistant added a phone, with the notice bar and the Estimated label.

## What must be on it

Top to bottom, from `search-result.png`. The whole page body sits on the grey band; the footer is white.

1. SearchBar with the query already in the field, and the Search button.
2. The label "Understood as" in `--cs-size-small`, then UnderstoodChips: one `.cs-chip` per filter with an x. In the design: "Max price $400", "Camera 48MP or more", "Sorted by camera". Build the chip text from the `filters` object: `maxPrice` gives "Max price $400", `minCamera` gives "Camera 48MP or more", `minPrice` gives "Min price $...", `brand` gives the brand, `has5G` gives "5G", `minRam` gives "8GB RAM or more", `minBattery` gives "5000mAh or more", `minRefresh` gives "120Hz display", `category` gives the category, `sort` gives "Sorted by ...".
3. The count heading, centred, in `.cs-heading`: "3 phones", or "1 phone", or "No phones found". Under it the sub line "for <the query>".
4. The filter strip in its own band. On the right: a "Filters" link with the FiSliders icon, a vertical hairline, then SortSelect showing "Sort by: Camera". Below: FilterStrip with four groups separated by vertical hairlines in `--cs-line-strong`: Brand (checkboxes Samsung, Apple, OnePlus, Xiaomi, Vivo), Price (two inputs, "0" and "400", with a dash between), Features (5G, 120Hz display, 8GB RAM or more, 5000mAh or more), and a `btn btn-primary` "Apply". The strip shows the current filters: in the design Xiaomi and Vivo are checked, the price is 0 to 400 and 5G is checked.
5. The results: PhoneCards in `.cs-grid`, three per row at 1280px. Name, spec line, price, Compare, See details all come from PhoneCard.

`search-no-results.png`: the same top, the chips "Max price $100" and "Camera 200MP or more", the heading "No phones found", the strip, then a white `.cs-card` centred: "Nothing in our data matches all of that." on one line, "Try raising the budget or removing a filter." under it, a `btn btn-primary` "Clear filters", and an underlined "Ask the assistant" link with a chevron. Use EmptyState for this card if it fits, otherwise a `.cs-card` with the same text.

`search-added-by-assistant.png`: the search bar with "Nothing Phone 2a", no chips and no strip, the heading "1 phone" with "for Nothing Phone 2a", then a full width NoticeBar: "This phone was not in our data. The assistant added its specifications. The price is an estimate until we check it.", then one PhoneCard centred with `estimated` set, so the "Estimated" label shows next to the price. A phone gets this treatment when its `source` is `ai`.

One note on the sort. The design shows "Sort by: Camera" because the search sorted by camera. The sort values the API accepts today are `newest`, `priceAsc` and `priceDesc`. Build SortSelect with an `options` prop and use those three for now. I add `camera` and `battery` when I build the search endpoint, and then you add the two options.

## Components to use

- Shared: PhoneCard, Loader, EmptyState.
- Yours: SearchBar (shared with Home), UnderstoodChips, FilterStrip (shared with Browse), SortSelect (shared with Browse), NoticeBar.

The "Filters" link is a button that calls `scrollIntoView` on the strip; give the strip an id.

## Services to call

- `searchPhones(query)` from `src/services/ai.service.js` returns `{ items, filters, source }`. Call it when `q` changes. `filters` feeds the chips and the strip. `source` is `direct` or `ai`.
- `listPhones(params)` from `src/services/phones.service.js` returns `{ items, total, page, pages }`. Call it on Apply, on a chip x, on a sort change and on Clear filters.

## Mock data until the backend is ready

Both endpoints answer 404 today. Import `mockPhones` from `src/data/mockPhones.js` and filter it in the page: match `q` against brand and model, and apply the strip values (`maxPrice` against `price.current`, `has5G` against `specs.has5G`, and so on). For the chips, build a `filters` object from the query yourself for now; for "phone under $400 with a great camera" use `{ maxPrice: 400, minCamera: 48, sort: "camera" }` so the chips match the design. For the assistant added state, add one extra object to your local list with `source: "ai"` and the values from the design (Nothing Phone 2a, 8 GB, 128 GB, 50 MP, 5000 mAh, $349). I tell you when to swap to the real calls.

## The states to handle

- Loading: Loader in place of the results while a call runs. Keep the search bar and the heading visible.
- Empty: the no results card from `search-no-results.png`.
- Error: a short line with the message and a "Try again" button that calls `reload`.
- No query: the search bar alone with the sub line "Type what you need and press Enter."
- Assistant added a phone: the NoticeBar and the Estimated label from `search-added-by-assistant.png`.
- Filters open on a phone: under 768px the strip stacks its four groups vertically; the "Filters" link still scrolls to it.

## Done checklist

1. The page works at 375px, 768px and 1280px and never scrolls sideways. The strip stacks under 768px and the cards go one per row.
2. No hex codes or pixel values outside `client/src/styles/theme.css`.
3. The page sits inside the shared layout and uses the shared components.
4. The loading, empty and error states exist.
5. Data comes from `src/services` or `src/data/mockPhones.js`, never from fetch or axios inside a page.
6. No errors in the browser console.
7. Screenshots at phone size and desktop size are attached to the pull request.
8. Matches the image at 1280px.

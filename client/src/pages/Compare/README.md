# Compare

Osakue, you own the Compare page. It reads its phones from `useCompare`, which is the list every Compare checkbox and the Add to compare button fill, and which also accepts `?ids=` in the URL.

## Owner and branch

Owner: Osakue. Branch: `osakue`. Files: `Compare.jsx` and `Compare.css` in this folder. Import the css at the top of the page file.

## Routes

Path: `/compare`, and `/compare?ids=a,b,c` for a shared link. CompareContext puts the slugs from `?ids=` at the front of the list when the page opens and whenever `?ids=` changes, so you only read `useCompare().slugs`. The context never writes the address, so keep it in step yourself: whenever `slugs` changes, call `setSearchParams(slugs.length ? { ids: slugs.join(',') } : {}, { replace: true })`. Then a reload or a shared link always shows the same phones, after an add as well as a remove. Example: `http://localhost:5173/compare?ids=samsung-galaxy-s24,oneplus-12,xiaomi-redmi-note-13-pro`.

Where every click on this page leads, from `docs/ROUTES.md`:

| What | Leads to |
| --- | --- |
| "Remove" under a phone | `useCompare().remove(slug)`, and the address follows as above |
| "Add a phone" slot | Opens AddPhoneDialog |
| Dialog x | Closes the dialog |
| Dialog text field | `listPhones({ q, limit: 5 })` as the person types |
| Dialog "Add" | `useCompare().add(slug)`, then the dialog closes. Disabled while `isFull` is true. |
| "Browse phones" (one phone state and empty state) | `/browse` |
| "Ask the assistant" (verdict card) | `/assistant?q=` with a question that names the phones on the page |

## Designs to match

- `docs/ui/compare.png`: three phones.
- `docs/ui/compare-one-phone.png`: one phone.
- `docs/ui/compare-add-phone.png`: the Add a phone dialog open over the three phone page.

## What must be on it

Top to bottom, from `compare.png`.

1. White band: heading "Compare" in `.cs-heading`, sub line "Up to three phones. The bold value wins each row." with the word "bold" in `--cs-weight-bold`.
2. CompareSlots: four slots in a row at 1280px. One slot per phone: the picture (PhoneImage), the model name in `--cs-size-card-title` ("Galaxy S24", "OnePlus 12", "Redmi Note 13 Pro": use `phone.model`, or `phoneName(phone)` when the model starts with a digit, because the OnePlus 12 is stored with the model "12"), and "Remove" under it in `--cs-ink-soft`. The remaining slots, up to a total of four, are dashed boxes (`--cs-line-strong`, `--cs-radius-card`) with a FiPlus icon and "Add a phone"; clicking one opens the dialog. With three phones there is one dashed slot; with fewer there are more, as in `compare-one-phone.png`.
3. CompareTable inside `.cs-table-wrap`, with the Bootstrap `table` class so the hairlines come from the theme. The first column holds the labels in `--cs-ink-soft`: Price, Processor, RAM, Storage, Main camera, Front camera, Battery, Display, Refresh rate, Operating system. One column per phone. Values with units: "$699", "Exynos 2400", "8 GB", "256 GB", "50 MP", "12 MP", "4000 mAh", "6.2in", "120 Hz", "Android 14". A cell gets `.cs-cell-best` when `best` for its row includes that phone's slug. A row that is missing from `best` has no winner, and Processor and Operating system are text, so they are never marked. Mark what `best` says, not what `compare.png` shows: the design marks both $699 cells by mistake, and the cheapest price wins the price row. The other marked cells in the design, 12 GB, 200 MP, 32 MP, 5400 mAh and 6.82in, match what `best` gives for those three phones.
4. Grey band with a white `.cs-card` centred: heading "Verdict" in `--cs-size-block-title`, the line "The assistant can tell you which of these phones suits you best." in `--cs-ink-soft`, and the link "Ask the assistant" as a `.cs-link-chevron`. There is no verdict endpoint, so this line takes the place of the design's line about a verdict. The link goes to `/assistant?q=` with a question that names the phones on the page, for example `Which should I buy: Samsung Galaxy S24, OnePlus 12 or Xiaomi Redmi Note 13 Pro?`. Build the names with `phoneName(phone)` and wrap the question in `encodeURIComponent`. Full names matter, because the assistant finds phones by their full names.

`compare-one-phone.png`: the heading and sub line, then four slots: the first a white `.cs-card` with the picture, the full name "Samsung Galaxy S24" (use `phoneName`), the spec line "8 GB, 256 GB, 50 MP, 4000 mAh" (use `specLine`) and an underlined "Remove"; the other three dashed with the plus in a grey circle and "Add a phone". Under the slots a `.cs-empty` box: "Add at least one more phone to compare." and a `btn btn-primary` "Browse phones". No table, no verdict.

`compare-add-phone.png`: the page dimmed with `.cs-overlay`, and the `.cs-dialog` on top: heading "Add a phone" in `--cs-size-block-title`, a FiX button top right, an input with the small label "Type a phone name" inside its border and the typed text, then one row per result: PhoneImage small, the name in `--cs-size-card-title`, the spec line, the price in `.cs-price`, and a `btn btn-primary` "Add". Rows separated by hairlines. Close on the x, on Escape and on a click on the overlay. Hide phones already in the list from the results.

## Components to use

- Shared: PhoneImage, Loader, EmptyState, and the helpers `phoneName` (from `PhoneImage.jsx`) and `specLine` (from `PhoneCard.jsx`).
- Yours: CompareSlots, CompareTable, AddPhoneDialog.

## Data

The endpoints are live. The exact contract for this page is in [`docs/DATA-FLOW.md`, Compare](../../../../docs/DATA-FLOW.md#compare).

- Services, all from `src/services/phones.service.js`: `comparePhones(slugs)` when `slugs` has two or three entries, through `useAsync` with `[slugs.join(',')]` as the list; `getPhone(slug)` when there is one slug, for the single column; and `listPhones({ q, limit: 5 })` in the dialog as the person types, once the field has at least two characters.
- Contexts: `useCompare()` for `slugs`, `add`, `remove` and `isFull`. `useSearchParams` from the router keeps `?ids=` in step.
- Reply of `comparePhones`: the phones in the order of the slugs, each a whole phone document as in [`docs/TEAM-GUIDE.md`](../../../../docs/TEAM-GUIDE.md#the-phone-shape), and `best`, which maps a row to the list of slugs that win it. The rows are `price`, `ram`, `storage`, `mainCamera`, `frontCamera`, `battery`, `displaySize` and `refreshRate`. For the three phones in the design:

```js
{
  phones: [galaxyS24, oneplus12, redmiNote13Pro],
  best: {
    price: ["xiaomi-redmi-note-13-pro"],
    ram: ["oneplus-12"],
    mainCamera: ["xiaomi-redmi-note-13-pro"],
    frontCamera: ["oneplus-12"],
    battery: ["oneplus-12"],
    displaySize: ["oneplus-12"]
  }
}
```

`storage` and `refreshRate` are missing because all three phones have 256 GB and 120 Hz. When phones tie for the top, all of their slugs are in the list.

- Reply of `getPhone`: `{ phone, isFavourite }`. You read `phone`.
- Reply of `listPhones`: `{ items: [phone], total, page, pages }`, at most five phones.
- Messages: "Could not find at least two of those phones" when fewer than two of the slugs exist, for example a shared link with two slugs and one of them wrong. One wrong slug among three is dropped quietly and the other two come back, so when `phones` is shorter than `slugs`, call `useCompare().remove(slug)` for each slug that did not come back. Then the list, the address and the page agree. "Choose at least two phones to compare" cannot happen if you call `comparePhones` only with two or three slugs.

## The states to handle

- Loading: Loader in place of the table while `comparePhones` runs. The slots stay visible.
- Empty: no slugs at all. Show four dashed slots and the `.cs-empty` box with "Add at least one more phone to compare." and "Browse phones", the same as the one phone state.
- One phone: `compare-one-phone.png`.
- Two or three phones: the table.
- Error: "Could not find at least two of those phones", when fewer than two slugs exist, shows with EmptyState and a "Browse phones" action. Any other failure shows a short line with the message and a "Try again" button that calls `reload`, in place of the table.
- Dialog open: `compare-add-phone.png`. Dialog loading: a Loader inside the dialog. Dialog empty: "No phone matches that name." inside the dialog.
- Full list: the dialog Add buttons are disabled while `isFull` from `useCompare()` is true.

## Done checklist

1. The page works at 375px, 768px and 1280px and never scrolls sideways. The slots go two per row under 1280px and one per row under 768px; the table scrolls inside `.cs-table-wrap` with the label column stuck on the left.
2. No hex codes or pixel values outside `client/src/styles/theme.css`.
3. The page sits inside the shared layout and uses the shared components.
4. The loading, empty and error states exist.
5. Data comes from `src/services` as `docs/DATA-FLOW.md` says for this page, never from fetch or axios inside a page, and the page does not import `src/data/mockPhones.js`.
6. No errors in the browser console.
7. Screenshots at phone size and desktop size are attached to the pull request.
8. Matches the image at 1280px.

# Compare

Osakue, you own the Compare page. It reads its phones from `useCompare`, which is the list every Compare checkbox and the Add to compare button fill, and which also accepts `?ids=` in the URL.

## Owner and branch

Owner: Osakue. Branch: `osakue`. Files: `Compare.jsx` and `Compare.css` in this folder. Import the css at the top of the page file.

## Routes

Path: `/compare`, and `/compare?ids=a,b,c` for a shared link. CompareContext reads `?ids=` once on load and merges the slugs into the list, so you only read `useCompare().slugs`. Keep the URL in sync the other way: whenever `slugs` changes, call `setSearchParams({ ids: slugs.join(',') })` (or clear it when the list is empty), so the address bar always holds a link someone can share. Example: `http://localhost:5173/compare?ids=samsung-galaxy-s24,oneplus-12,xiaomi-redmi-note-13-pro`.

Where every click on this page leads, from `docs/ROUTES.md`:

| What | Leads to |
| --- | --- |
| "Remove" under a phone | `useCompare.remove(slug)` |
| "Add a phone" slot | Opens AddPhoneDialog |
| Dialog x | Closes the dialog |
| Dialog text field | `listPhones({ q })` as the person types |
| Dialog "Add" | `useCompare.add(slug)`, then the dialog closes |
| "Browse phones" (one phone state) | `/browse` |
| "Ask the assistant" (verdict card) | `/assistant` |

## Designs to match

- `docs/ui/compare.png`: three phones.
- `docs/ui/compare-one-phone.png`: one phone.
- `docs/ui/compare-add-phone.png`: the Add a phone dialog open over the three phone page.

## What must be on it

Top to bottom, from `compare.png`.

1. White band: heading "Compare" in `.cs-heading`, sub line "Up to three phones. The bold value wins each row." with the word "bold" in `--cs-weight-bold`.
2. CompareSlots: four slots in a row at 1280px. One slot per phone: the picture (PhoneImage), the model name in `--cs-size-card-title` ("Galaxy S24", "OnePlus 12", "Redmi Note 13 Pro": use `phone.model`), and "Remove" under it in `--cs-ink-soft`. The remaining slots, up to a total of four, are dashed boxes (`--cs-line-strong`, `--cs-radius-card`) with a FiPlus icon and "Add a phone"; clicking one opens the dialog. With three phones there is one dashed slot; with fewer there are more, as in `compare-one-phone.png`.
3. CompareTable inside `.cs-table-wrap`, with the Bootstrap `table` class so the hairlines come from the theme. The first column holds the labels in `--cs-ink-soft`: Price, Processor, RAM, Storage, Main camera, Front camera, Battery, Display, Refresh rate, Operating system. One column per phone. Values with units: "$699", "Exynos 2400", "8 GB", "256 GB", "50 MP", "12 MP", "4000 mAh", "6.2in", "120 Hz", "Android 14". The winning cell in each row gets `.cs-cell-best`. `best` from the API says which slug wins each row. In the design the two $699 cells and the 12 GB, 200 MP, 32 MP, 5400 mAh and 6.82in cells are marked.
4. Grey band with a white `.cs-card` centred: heading "Verdict" in `--cs-size-block-title`, the line "The assistant writes a short verdict here once the AI is connected." in `--cs-ink-soft`, and the link "Ask the assistant" as a `.cs-link-chevron`. The API has no verdict field yet; when it gets one I tell you, and you show it in place of the line.

`compare-one-phone.png`: the heading and sub line, then four slots: the first a white `.cs-card` with the picture, the full name "Samsung Galaxy S24" (use `phoneName`), the spec line "8 GB, 256 GB, 50 MP, 4000 mAh" (use `specLine`) and an underlined "Remove"; the other three dashed with the plus in a grey circle and "Add a phone". Under the slots a `.cs-empty` box: "Add at least one more phone to compare." and a `btn btn-primary` "Browse phones". No table, no verdict.

`compare-add-phone.png`: the page dimmed with `.cs-overlay`, and the `.cs-dialog` on top: heading "Add a phone" in `--cs-size-block-title`, a FiX button top right, an input with the small label "Type a phone name" inside its border and the typed text, then one row per result: PhoneImage small, the name in `--cs-size-card-title`, the spec line, the price in `.cs-price`, and a `btn btn-primary` "Add". Rows separated by hairlines. Close on the x, on Escape and on a click on the overlay. Hide phones already in the list from the results.

## Components to use

- Shared: PhoneImage, Loader, EmptyState, and the helpers `phoneName` (from `PhoneImage.jsx`) and `specLine` (from `PhoneCard.jsx`).
- Yours: CompareSlots, CompareTable, AddPhoneDialog.

## Services to call

- `comparePhones(slugs)` from `src/services/phones.service.js` returns `{ phones, best }`. Call it whenever `slugs` has two or three entries. `best` is an object keyed by row name (`price`, `processor`, `ram`, `storage`, `mainCamera`, `frontCamera`, `battery`, `displaySize`, `refreshRate`, `os`) whose value is the winning slug.
- `listPhones({ q })` returns `{ items, total, page, pages }`. The dialog calls it as the person types; wait until the field has at least two characters.

## Mock data until the backend is ready

Both endpoints answer 404 today. Import `mockPhones` from `src/data/mockPhones.js`. For the page, pick the phones whose slug is in `slugs`, and compute `best` yourself: the lowest `price.current` wins the price row, the highest number wins RAM, storage, main camera, front camera, battery, display size and refresh rate; processor and operating system have no winner. For the dialog, filter `mockPhones` by name ignoring case. The design shows a Vivo V29 that is not in the sample data; the Vivo V30 alone is fine. I tell you when to swap to the two calls.

## The states to handle

- Loading: Loader in place of the table while `comparePhones` runs. The slots stay visible.
- Empty: no slugs at all. Show four dashed slots and the `.cs-empty` box with "Add at least one more phone to compare." and "Browse phones", the same as the one phone state.
- One phone: `compare-one-phone.png`.
- Two or three phones: the table.
- Error: a short line with the message and a "Try again" button that calls `reload`, in place of the table.
- Dialog open: `compare-add-phone.png`. Dialog loading: a Loader inside the dialog. Dialog empty: "No phone matches that name." inside the dialog.
- Full list: the dialog Add buttons are disabled when the list already has three.

## Done checklist

1. The page works at 375px, 768px and 1280px and never scrolls sideways. The slots go two per row under 1280px and one per row under 768px; the table scrolls inside `.cs-table-wrap` with the label column stuck on the left.
2. No hex codes or pixel values outside `client/src/styles/theme.css`.
3. The page sits inside the shared layout and uses the shared components.
4. The loading, empty and error states exist.
5. Data comes from `src/services` or `src/data/mockPhones.js`, never from fetch or axios inside a page.
6. No errors in the browser console.
7. Screenshots at phone size and desktop size are attached to the pull request.
8. Matches the image at 1280px.

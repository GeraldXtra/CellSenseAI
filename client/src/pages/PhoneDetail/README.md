# Phone detail

Ibrahim, you own the Phone detail page. One block on it is not yours: the reviews block is Osakue's ReviewsSection. You place `<ReviewsSection slug={slug} />` where the design shows it and Osakue builds what is inside.

## Owner and branch

Owner: Ibrahim. Branch: `ibrahim`. Files: `PhoneDetail.jsx` and `PhoneDetail.css` in this folder. Import the css at the top of the page file.

## Routes

Path: `/phones/:slug`. Read `slug` with `useParams`. Example: `http://localhost:5173/phones/samsung-galaxy-s24`.

Where every click on this page leads, from `docs/ROUTES.md`:

| What | Leads to |
| --- | --- |
| Breadcrumb "Home" | `/` |
| Breadcrumb brand, for example "Samsung" | `/browse/samsung` |
| "Add to compare" | `useCompare().add(slug)`, then `/compare` |
| "Save to favourites" | `addFavourite(slug)` and then `reload()` when logged in, otherwise `/login?next=/phones/<slug>` |
| Rating select and the review text | The review form values (inside ReviewsSection) |
| "Post review" | `addReview(slug, { rating, text })` (inside ReviewsSection, logged in only) |
| "Log in" in place of the review form (logged out) | `/login?next=/phones/<slug>` (inside ReviewsSection) |

## Designs to match

- `docs/ui/phone-detail.png`: the Galaxy S24 with no reviews yet.
- `docs/ui/phone-detail-reviews.png`: the same page with the summary and three reviews.

## What must be on it

Top to bottom, from `phone-detail.png`.

1. White band. The breadcrumb "Home / Samsung / Galaxy S24" in `--cs-size-small`, the first two as links, the last in `--cs-ink`. Then two columns at 1280px: the picture on the left (PhoneImage), and on the right: the brand "Samsung" in `--cs-ink-soft`, the model "Galaxy S24" in `--cs-size-page-title`, the price "$699" in `--cs-size-page-title`, the line "Guide price, checked 22 Sep 2026" in `--cs-ink-soft` (format `price.updatedAt` as day, short month, year), then the orange line as `.cs-price-note` with the FiArrowDown icon: "Price has been falling. Waiting a little could save you money." That line shows only when `trend` is `falling`, and the text is the `suggestion` from the price trend call. For `rising` and `stable` show the suggestion in `--cs-ink-soft` without the orange. Then the `.cs-ai-box` with the title "In plain words" and the `aiSummary` text; hide the box when `aiSummary` is empty. Then two buttons: `btn btn-primary` "Add to compare" and `btn btn-outline-primary` "Save to favourites", which reads "Saved" when `isFavourite` is true. When `phone.source` is `ai`, the model added this phone: show the `.cs-estimated` "Estimated" label next to the price and the same NoticeBar note as on Search results.
2. Grey band "Tech specs" (`--cs-size-section-title`, centred): SpecTable, two columns of label and value rows with hairlines. Left: Processor, RAM, Storage, Main camera, Front camera. Right: Battery, Display (as "6.2in AMOLED", size plus type), Refresh rate, Operating system, 5G (Yes or No). Labels in `--cs-ink-soft`, values in `--cs-ink`.
3. White band "Price history": PriceHistoryChart, a recharts LineChart inside a hairline box: the months on the x axis (short month names from the `date` of each entry), the prices on the y axis with a dollar sign, a line in `--cs-chart-line` with dots, grid lines in `--cs-chart-grid`. Under it the caption "Guide prices. Each point is a price check." in `--cs-size-tiny` and `--cs-ink-soft`. recharts needs colours as strings: read them once with `getComputedStyle(document.documentElement).getPropertyValue('--cs-chart-line')` inside the component, do not type a hex code.
4. Grey band "Reviews": here you write `<ReviewsSection slug={slug} />` and nothing else. Osakue builds it in `src/components/osakue/ReviewsSection.jsx`. It loads its own reviews and summary. In `phone-detail.png` it shows "No reviews yet. Be the first to write one." with the form; in `phone-detail-reviews.png` it shows the Summary card, the Write a review card and the three review rows.

## Components to use

- Shared: PhoneImage, Loader, EmptyState. The Compare checkbox is not on this page; the Add to compare button uses `useCompare` directly.
- Yours: SpecTable, PriceHistoryChart, and NoticeBar for a phone the model added.
- Osakue's: ReviewsSection, placed as above. If it is still a stub when you get here, the band shows nothing, and that is fine until Osakue's pull request is merged.

## Data

The endpoints are live. The exact contract for this page is in [`docs/DATA-FLOW.md`, Phone detail](../../../../docs/DATA-FLOW.md#phone-detail).

- Services: `getPhone(slug)` and `getPriceTrend(slug)` from `src/services/phones.service.js`, each through `useAsync` with `[slug]` as the list. `addFavourite(slug)` from `src/services/users.service.js` when a logged in person saves the phone, then `reload()` of `getPhone`. `getReviews`, `getReviewSummary` and `addReview` belong to ReviewsSection, not to this page.
- Contexts: `useAuth()` for `user`, to know whether Save to favourites calls the server or goes to Log in, and `useCompare()` for `add`.
- Reply of `getPhone`: the whole phone document, as in [`docs/TEAM-GUIDE.md`](../../../../docs/TEAM-GUIDE.md#the-phone-shape), with `priceHistory` and `aiSummary`, and whether the logged in person saved it. When logged in, the server also records the phone in recently viewed; you do nothing for that.

```js
{ phone, isFavourite: false }
```

- Reply of `getPriceTrend`: the price history oldest first, the trend and one sentence about the best time to buy. Here is the Galaxy S24 after the price check of 1 October 2026:

```js
{
  history: [
    { price: 749, date: "2026-06-01T00:00:00.000Z", source: "seed" },
    { price: 729, date: "2026-07-01T00:00:00.000Z", source: "seed" },
    { price: 719, date: "2026-08-01T00:00:00.000Z", source: "seed" },
    { price: 699, date: "2026-09-01T00:00:00.000Z", source: "seed" },
    { price: 689, date: "2026-10-01T00:00:00.000Z", source: "manual" }
  ],
  trend: "falling",
  suggestion: "Price has been falling. Waiting a little could save you money."
}
```

`trend` is `falling`, `rising` or `stable`, and `history` is the list for the chart.

- Reply of `addFavourite`: `{ favourites: [phone] }`. You do not read it; `reload()` brings `isFavourite` back as true, and the button reads "Saved".
- Message: a slug that does not exist answers "Phone not found".

## The states to handle

- Loading: Loader in place of the page while `getPhone` runs.
- Not found: when the slug matches nothing, the call fails with "Phone not found". Show it with EmptyState and a "Browse phones" action to `/browse`.
- Error: a short line with the message and a "Try again" button that calls `reload`.
- No summary: the "In plain words" box is hidden.
- One price check only: `trend` is `stable` and `suggestion` is "Not enough price checks yet to see which way the price is moving." Show it in grey like any other suggestion that is not `falling`; the chart holds one point.
- Price trend fails: show its message with a "Try again" button in place of the chart, and leave the rest of the page as it is.
- Saved: after `addFavourite` and `reload()`, the button reads "Saved".
- Logged out and Save to favourites: go to `/login?next=/phones/<slug>`.
- A phone the model added: the Estimated label and the note, as above.

## Done checklist

1. The page works at 375px, 768px and 1280px and never scrolls sideways. Under 768px the picture sits above the text, the spec table becomes one column, and the chart box scrolls inside `.cs-table-wrap` if it is wider than the screen.
2. No hex codes or pixel values outside `client/src/styles/theme.css`.
3. The page sits inside the shared layout and uses the shared components.
4. The loading, empty and error states exist.
5. Data comes from `src/services` as `docs/DATA-FLOW.md` says for this page, never from fetch or axios inside a page, and the page does not import `src/data/mockPhones.js`.
6. No errors in the browser console.
7. Screenshots at phone size and desktop size are attached to the pull request.
8. Matches the image at 1280px.

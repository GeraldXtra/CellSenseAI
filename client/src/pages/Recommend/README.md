# Recommend

Osakue, you own the Recommend page: the five question form and the top three cards.

## Owner and branch

Owner: Osakue. Branch: `osakue`. Files: `Recommend.jsx` and `Recommend.css` in this folder. Import the css at the top of the page file.

## Routes

Path: `/recommend`. No parameters. Example: `http://localhost:5173/recommend`.

Where every click on this page leads, from `docs/ROUTES.md`:

| What | Leads to |
| --- | --- |
| Budget, Brand, Purpose, Performance, the three checkboxes | The form values |
| "Show my top 3" | `recommend({ budget, brand, purpose, performance, camera, gaming, battery })` |
| "See details" on a result card | `/phones/<slug>`, PhoneCard does it |

## Designs to match

- `docs/ui/recommend.png`: the form filled in and the three results.

## What must be on it

Top to bottom, from `recommend.png`.

1. White band: heading "Get a recommendation" in `.cs-heading`, sub line "Answer five quick questions and we show the three phones that fit."
2. Grey band with RecommendForm, a white `.cs-card` about two thirds of the container wide, centred. Two columns of fields at 1280px: "Budget (US dollars)" as a number input showing "700", and "Brand" as a select showing "Any"; "Purpose" as a select showing "Everyday", and "Performance" as a select showing "Good". Under them three checkboxes in a row: "Camera matters most" (checked in the design), "I play games", "Battery matters most" (checked). Then a full width `btn btn-primary` "Show my top 3". Labels in `--cs-ink-soft` with `--cs-space-2` to the field.
   - Brand options: Any, Samsung, Apple, OnePlus, Xiaomi, Vivo. "Any" sends `any`, and each brand sends its name.
   - Purpose options: Everyday, Work, Gaming, Photos, which send `everyday`, `work`, `gaming` and `photos`.
   - Performance options: Basic, Good, Top, which send `basic`, `balanced` and `high`.
   - The checkboxes send `camera`, `gaming` and `battery` as `true` or `false`.
3. White band: heading "Your top 3" in `--cs-size-section-title`, centred. PhoneCards in `.cs-grid` with `rank` 1, 2, 3, `reason` set to the reason from the API, and `compare={false}` so there is no Compare checkbox, as in the design. The cards show the name, the price and the reason. In the design: "OnePlus 12" $699 "Best battery for your budget"; "Xiaomi Redmi Note 13 Pro" $299 "Highest camera resolution under your budget"; "Vivo V30" $399 "Lowest price that meets your needs". The real phones, prices and reasons come from the reply. When `widened` is true, add the line "Few phones fit your budget, so we looked a little above it." above the cards. Before the first submit, this band is not shown.

## Components to use

- Shared: PhoneCard, Loader, EmptyState.
- Yours: RecommendForm. Give it `onSubmit(needs)` and `loading` props; the page owns the result.

## Data

The endpoint is live. The exact contract for this page is in [`docs/DATA-FLOW.md`, Recommend](../../../../docs/DATA-FLOW.md#recommend).

- Service: `recommend(needs)` from `src/services/ai.service.js`, called when the form is sent. `needs` is `{ budget, brand, purpose, performance, camera, gaming, battery }`, with `budget` a number from 50 to 5000 and the other values as listed above.
- Contexts: none. When the person is logged in, `api.js` sends the token and the server saves the picks to their dashboard; you do nothing for that.
- Reply: up to three picks, best first, and whether the budget had to be raised:

```js
{
  items: [
    { phone, reason: "Guide price $289, with a 200 MP main camera." }
  ],
  widened: false
}
```

Each `phone` carries `_id`, `slug`, `brand`, `model`, `category`, `releaseYear`, `specs`, `price`, `source` and `imageUrl`, which is all PhoneCard needs; it has no `priceHistory` or `aiSummary`. With the AI settings filled the model writes each `reason`; without them the reason comes from our own rules, in the form shown above. `items` is empty when no phone fits even the raised budget.

- Messages: "Enter a budget between 50 and 5000 US dollars" for a bad budget, and "Too many questions at once. Wait a minute and try again." after 20 requests to the AI routes in a minute from one address.

## The states to handle

- Before the first submit: the form alone, no "Your top 3" band.
- Loading: the button reads "Finding your top 3" and is disabled, and a Loader shows where the results go.
- Empty: `items` is empty. EmptyState with "No phones fit that budget. Try a higher one." and a "Raise the budget" action that focuses the budget field.
- Widened: the line "Few phones fit your budget, so we looked a little above it." above the cards.
- Error: a short line with the message under the form and the button enabled again.
- Bad input: a budget outside 50 to 5000, or an empty one, shows the field in the error style (`is-invalid`, the theme colours it) with "Enter a budget between 50 and 5000 US dollars", the same words the server uses, and the form does not submit.

## Done checklist

1. The page works at 375px, 768px and 1280px and never scrolls sideways. The form goes to one column and the checkboxes stack under 768px; the cards go one per row.
2. No hex codes or pixel values outside `client/src/styles/theme.css`.
3. The page sits inside the shared layout and uses the shared components.
4. The loading, empty and error states exist.
5. Data comes from `src/services` as `docs/DATA-FLOW.md` says for this page, never from fetch or axios inside a page, and the page does not import `src/data/mockPhones.js`.
6. No errors in the browser console.
7. Screenshots at phone size and desktop size are attached to the pull request.
8. Matches the image at 1280px.

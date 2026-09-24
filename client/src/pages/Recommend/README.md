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
| "Show my top 3" | `recommend({ budget, brand, purpose, camera, gaming, battery, performance })` |
| "See details" on a result card | `/phones/<slug>`, PhoneCard does it |

## Designs to match

- `docs/ui/recommend.png`: the form filled in and the three results.

## What must be on it

Top to bottom, from `recommend.png`.

1. White band: heading "Get a recommendation" in `.cs-heading`, sub line "Answer five quick questions and we show the three phones that fit."
2. Grey band with RecommendForm, a white `.cs-card` about two thirds of the container wide, centred. Two columns of fields at 1280px: "Budget (US dollars)" as a number input showing "700", and "Brand" as a select showing "Any"; "Purpose" as a select showing "Everyday", and "Performance" as a select showing "Good". Under them three checkboxes in a row: "Camera matters most" (checked in the design), "I play games", "Battery matters most" (checked). Then a full width `btn btn-primary` "Show my top 3". Labels in `--cs-ink-soft` with `--cs-space-2` to the field.
   - Brand options: Any, Samsung, Apple, OnePlus, Xiaomi, Vivo. Use the `brands` export. "Any" is sent as an empty string.
   - Purpose options: Everyday, Work, Gaming, Photos.
   - Performance options: Basic, Good, Top.
   - The checkboxes send `camera`, `gaming` and `battery` as true or false.
3. White band: heading "Your top 3" in `--cs-size-section-title`, centred. Three PhoneCards in `.cs-grid` with `rank` 1, 2, 3, `reason` set to the reason from the API, and `compare={false}` so there is no Compare checkbox, as in the design. The cards show the name, the price and the reason: "OnePlus 12" $699 "Best battery for your budget"; "Xiaomi Redmi Note 13 Pro" $299 "Highest camera resolution under your budget"; "Vivo V30" $399 "Lowest price that meets your needs". Before the first submit, this band is not shown.

## Components to use

- Shared: PhoneCard, Loader, EmptyState.
- Yours: RecommendForm. Give it `onSubmit(needs)` and `loading` props; the page owns the result.

## Services to call

- `recommend(needs)` from `src/services/ai.service.js` returns `{ items: [{ phone, reason }] }`. `needs` is `{ budget, brand, purpose, camera, gaming, battery, performance }`. When the person is logged in, the server also saves the result to their dashboard; you do nothing for that.

## Mock data until the backend is ready

The endpoint answers 404 today. Import `mockPhones` from `src/data/mockPhones.js` and pick three phones with `price.current` at or under the budget, sorted by battery when battery matters, by camera when camera matters, otherwise by price. Give each a reason string of your own in the style of the design. With a budget of 700 and the design's checkboxes you get the OnePlus 12, the Redmi Note 13 Pro and the Vivo V30, in that order. I tell you when to swap to `recommend`.

## The states to handle

- Before the first submit: the form alone, no "Your top 3" band.
- Loading: the button reads "Finding your top 3" and is disabled, and a Loader shows where the results go.
- Empty: `items` is empty. EmptyState with "Nothing fits that budget yet." and a "Raise the budget" action that focuses the budget field.
- Error: a short line with the message under the form and the button enabled again.
- Bad input: a budget under 50 or empty shows the field in the error style (`is-invalid`, the theme colours it) with "Enter a budget in US dollars." and the form does not submit.

## Done checklist

1. The page works at 375px, 768px and 1280px and never scrolls sideways. The form goes to one column and the checkboxes stack under 768px; the cards go one per row.
2. No hex codes or pixel values outside `client/src/styles/theme.css`.
3. The page sits inside the shared layout and uses the shared components.
4. The loading, empty and error states exist.
5. Data comes from `src/services` or `src/data/mockPhones.js`, never from fetch or axios inside a page.
6. No errors in the browser console.
7. Screenshots at phone size and desktop size are attached to the pull request.
8. Matches the image at 1280px.

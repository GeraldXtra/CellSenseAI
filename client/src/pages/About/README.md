# About

Ibrahim, you own the About page. It is the smallest of your five and a good one to start with, because it uses only the shared classes.

## Owner and branch

Owner: Ibrahim. Branch: `ibrahim`. Files: `About.jsx` and `About.css` in this folder. Import the css at the top of the page file.

## Routes

Path: `/about`. No parameters. The footer links land on four anchors: `/about#about`, `/about#askme`, `/about#how-prices-work` and `/about#contact`, so give the four bands those ids. Example: `http://localhost:5173/about#how-prices-work`.

This page has no clicks of its own. The top bar, the footer and the assistant button are in Layout.

## Designs to match

- `docs/ui/about.png`.

## What must be on it

Top to bottom, from `about.png`. The bands alternate white and grey with `.cs-section` and `.cs-section-alt`. Every heading is centred in `--cs-size-section-title` except the first, which is the page title. Every paragraph is centred in `--cs-ink-soft` and no wider than the sub line in the design (about two thirds of the container).

1. White band: heading "About CellSense AI" in `.cs-heading`, sub line "A phone information website built for ASKME Ltd." in `.cs-subheading`, then a phone picture. Draw it with PhoneImage and a phone object written in the page, such as `{ brand: "Samsung", model: "Galaxy S24", imageUrl: "/phones/samsung-galaxy-s24.png" }`. The page makes no call. While the picture file is missing, PhoneImage shows the grey box with the name.
2. Grey band, id `about`: heading "About CellSense AI", paragraph "CellSense AI helps people find a phone by budget, camera, battery and brand. You can search in plain words, compare phones side by side, get a recommendation and ask the assistant."
3. White band, id `askme`: heading "ASKME Ltd.", paragraph "ASKME Ltd. answers customer questions by telephone. Most calls are about phones. This site answers those questions so nobody has to call."
4. Grey band, id `how-prices-work`: heading "How prices work", paragraph "Every price shows the date it was checked. Prices are guide prices, not live shop prices, and each phone page shows how the price has moved."
5. White band, id `contact`: heading "Contact", paragraph "Write to us at contact@cellsense.example with questions or corrections." Make the address a `mailto:` link in `--cs-ink`.

## Components to use

- Shared: PhoneImage.
- Yours: none.

## Data

None. The page calls no service and reads no context. Its section in [`docs/DATA-FLOW.md`, About](../../../../docs/DATA-FLOW.md#about) says the same: text and links only, with the four anchors the footer links to.

## The states to handle

There is no loading, empty or error state, because nothing is loaded. When the page opens with an anchor, Layout scrolls the band with that id into view, and `global.css` keeps it clear of the top bar, so you only give the four bands their ids. The ids must match the footer links in `src/components/shared/Footer.jsx`.

## Done checklist

1. The page works at 375px, 768px and 1280px and never scrolls sideways.
2. No hex codes or pixel values outside `client/src/styles/theme.css`.
3. The page sits inside the shared layout and uses the shared components.
4. The loading, empty and error states exist (here: not needed, say so in the pull request).
5. Data comes from `src/services` as `docs/DATA-FLOW.md` says for this page, never from fetch or axios inside a page, and the page does not import `src/data/mockPhones.js`.
6. No errors in the browser console.
7. Screenshots at phone size and desktop size are attached to the pull request.
8. Matches the image at 1280px.

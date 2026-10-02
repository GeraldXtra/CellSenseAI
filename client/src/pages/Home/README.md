# Home

Ibrahim, you own the Home page and the search bar. This README says what to build, in the order it appears in the design.

## Owner and branch

Owner: Ibrahim. Branch: `ibrahim`. Files: `Home.jsx` and `Home.css` in this folder. Import `Home.css` at the top of `Home.jsx`.

## Routes

Path: `/`. No parameters, no query string. Example: `http://localhost:5173/`.

Where every click on this page leads, from `docs/ROUTES.md`:

| What | Leads to |
| --- | --- |
| Search button, or Enter in the search field | `/search?q=<words>` |
| "Best battery under $300" | `/search?q=Best battery under $300` |
| "Gaming phone with 12GB RAM" | `/search?q=Gaming phone with 12GB RAM` |
| "Cheapest 5G phone" | `/search?q=Cheapest 5G phone` |
| "Open compare" | `/compare` |
| "Open the assistant" | `/assistant` |
| Brand card Samsung, Apple, OnePlus, Xiaomi, Vivo | `/browse/samsung`, `/browse/apple`, `/browse/oneplus`, `/browse/xiaomi`, `/browse/vivo` |

The top bar, the footer and the launcher are in Layout, you do not build them.

## Designs to match

- `docs/ui/home-page.png`: Home, logged out.
- `docs/ui/home-page-logged-in.png`: the same page with the account menu open. The menu is mine (Navbar and AccountMenu), the image is here so you see the page does not change when someone is logged in.

## What must be on it

Top to bottom, from `home-page.png`.

1. Hero, on white, with `--cs-space-20` above it. The headline "Find a phone by budget, camera, battery and brand" on two lines in `--cs-size-hero`, centred. The sub line "Ask in plain words. We answer from real specs and dated prices." in `.cs-subheading`.
2. SearchBar: a wide field with the band bg fill, height `--cs-search-h`, placeholder "phone under $400 with a great camera", and a `btn btn-primary` "Search" on its right.
3. Three suggestion links in a row under the search bar, each a `.cs-link-chevron`: "Best battery under $300", "Gaming phone with 12GB RAM", "Cheapest 5G phone".
4. Three phone pictures side by side, drawn with PhoneImage. They need no call: pass each one a phone object written in the page with the brand, the model and the picture path, such as `{ brand: "Samsung", model: "Galaxy S24", imageUrl: "/phones/samsung-galaxy-s24.png" }`. While a picture file is missing, PhoneImage shows the grey box with the name.
5. Grey band (`.cs-section .cs-section-alt`): heading "Compare side by side" in `--cs-size-section-title`, sub line "Two or three phones, every spec in one table." A phone picture on each side of a small table with four rows: Camera, Battery, RAM and Price. In the design: 50 MP / 200 MP, 4000 mAh / 5100 mAh, 8 GB / 8 GB, $699 / $299. That is the Galaxy S24 against the Redmi Note 13 Pro. Build the table and the two pictures from the two phones `comparePhones` returns, and do not type the numbers: the prices change with every price check. A cell is bold when `best` for its row includes that phone's slug. Under the table the link "Open compare" as a `.cs-link-chevron`.
6. White band: heading "Ask the assistant", sub line "It answers from the same phone data as the site, with the date each price was checked." A sample chat in a band bg box: a user bubble on the right (`--cs-bubble-user-bg`, `--cs-bubble-user-text`) with "Best camera phone under $400?" and a white reply bubble on the left with "Two phones fit. Redmi Note 13 Pro at $299 and Vivo V30 at $399." This is a still picture of a chat, not a working chat; the text is fixed. Under the box a `btn btn-primary` "Open the assistant".
7. Grey band: heading "Browse by brand". Five white cards in a row (`.cs-card`), each a link with a phone picture and the brand name under it: Samsung, Apple, OnePlus, Xiaomi, Vivo. Write the five names in the page; each card links to `/browse/` and the name in lowercase.

## Components to use

- Shared: PhoneImage (the hero pictures, the compare teaser pictures, the brand cards), Loader, EmptyState.
- Yours: SearchBar. Build it in `src/components/ibrahim/SearchBar.jsx`. It is reused on Search results, so give it an optional `initialValue` prop and make it navigate to `/search?q=<words>` on submit with `useNavigate`.

## Data

The endpoint is live. The exact contract for this page is in [`docs/DATA-FLOW.md`, Home](../../../../docs/DATA-FLOW.md#home).

- Service: `comparePhones(['samsung-galaxy-s24', 'xiaomi-redmi-note-13-pro'])` from `src/services/phones.service.js`, through `useAsync` with `[]` as the list. Nothing else on the page needs the server.
- Contexts: none. The top bar handles the login.
- Reply: the two phones in the order of the slugs, each a whole phone document as in [`docs/TEAM-GUIDE.md`](../../../../docs/TEAM-GUIDE.md#the-phone-shape), and `best`, which maps a row to the list of slugs that win it:

```js
{
  phones: [galaxyS24, redmiNote13Pro],
  best: {
    price: ["xiaomi-redmi-note-13-pro"],
    mainCamera: ["xiaomi-redmi-note-13-pro"],
    frontCamera: ["xiaomi-redmi-note-13-pro"],
    battery: ["xiaomi-redmi-note-13-pro"],
    displaySize: ["xiaomi-redmi-note-13-pro"]
  }
}
```

Your four rows read `specs.mainCamera`, `specs.battery`, `specs.ram` and `price.current`, and their keys in `best` are `mainCamera`, `battery`, `ram` and `price`. `ram` is missing here because both phones have 8 GB, so no RAM cell is bold.

## The states to handle

- Loading: a Loader in place of the teaser table while the call runs. The rest of the page shows at once.
- Empty: the call has no empty answer. It returns the two phones, or it fails.
- Error: a short line with the message and a "Try again" button that calls `reload`, in place of the teaser table. The page must never be blank because the call failed.
- Logged in: nothing changes on this page. The top bar handles it.

## Done checklist

1. The page works at 375px, 768px and 1280px and never scrolls sideways. At 375px the three suggestion links wrap, the hero pictures stack, the teaser table sits under the pictures, and the brand cards go two per row.
2. No hex codes or pixel values outside `client/src/styles/theme.css`.
3. The page sits inside the shared layout and uses the shared components.
4. The loading, empty and error states exist.
5. Data comes from `src/services` as `docs/DATA-FLOW.md` says for this page, never from fetch or axios inside a page, and the page does not import `src/data/mockPhones.js`.
6. No errors in the browser console.
7. Screenshots at phone size and desktop size are attached to the pull request.
8. Matches the image at 1280px.

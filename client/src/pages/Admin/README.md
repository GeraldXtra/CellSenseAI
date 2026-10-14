# Admin

Ibrahim, Osakue, this page is mine and finished. You do not need to touch it. It is where an admin sees every phone in the list, finds one by name, brand or source, and opens it to edit it, adds a phone or records new guide prices.

## Owner and branch

Owner: Gerald. Branch: `backend`. Files: `Admin.jsx`, `Admin.css` and `adminFormat.js` in this folder. `adminFormat.js` holds the date, price, category and source helpers that the three admin pages share. Changed only by me.

## Routes

Path: `/admin`, with `?q=`, `?brand=`, `?source=` and `?page=` in the address, so a reload keeps the search, the tab, the source and the page. Admins only: `App.jsx` wraps it in AdminRoute, which sends a logged out person to `/login?next=/admin` and shows "Admins only" to a logged in person who is not an admin. The account menu and the phone menu show an Admin link only to an admin. Example: `http://localhost:5173/admin?brand=Samsung&page=2`.

| What | Leads to |
| --- | --- |
| The search box | `?q=` after a short pause in typing, then `getAdminPhones(params)` |
| A brand tab | `?brand=`, then `getAdminPhones(params)` |
| The source select | `?source=` with `seed`, `ai` or `admin`, then `getAdminPhones(params)` |
| "Record prices" | `/admin/prices` |
| "Add a phone" | `/admin/phones/new` |
| "Edit" on a row, or "Review" on an estimated phone | `/admin/phones/<slug>` |
| Previous, a page number, Next | `?page=` |
| "Clear filters" (no results state) | `/admin` |

## Designs to match

- `docs/ui/admin.png`.

## What must be on it

From `admin.png`, top to bottom.

1. White band: the heading "Admin" and the sub line "Add phones and record guide prices. Every price is saved with the date it was checked." Under them, a short success line with an x when the page opens after a phone was added or saved.
2. Three white cards from `counts`: the number of phones, the number of estimated phones, and the date of the last price check. They ignore the search and the filters.
3. Grey band: the search box "Search by brand or model", the outlined "Record prices" button and the black "Add a phone" button with a plus.
4. The brand tabs, All first, then one tab per brand in `brands`, and the source select with All sources, From our list, Estimated and Added by admin.
5. The table in a white card, scrolling sideways inside its own box under 768px: the picture through PhoneImage with the name and the brand, the category, the guide price with the Estimated label for source `ai`, the last checked date such as "1 Oct 2026", the trend, the source label and an Edit link (Review for an estimated phone).
6. The trend reads Falling in `--cs-price-note` with a down arrow, Rising in grey with an up arrow, Stable in grey, and a dash when the phone has fewer than two price checks.
7. Under the table, "N of M phones" and the page buttons.

Every number and row comes from `getAdminPhones`. Nothing on the page is typed in by hand. While the page is open, the browser tab reads "Admin | CellSense AI".

# Record prices

Ibrahim, Osakue, this page is mine and finished. You do not need to touch it. It is where an admin types the guide prices they checked, for one date, and records them in each phone's price history.

## Owner and branch

Owner: Gerald. Branch: `backend`. Files: `AdminPrices.jsx` and `AdminPrices.css` in this folder. It also uses `Admin.css` and `adminFormat.js` from `pages/Admin/`. Changed only by me.

## Routes

Path: `/admin/prices`. Admins only, through AdminRoute, as on the Admin page. The Admin page and the edit form link here. Example: `http://localhost:5173/admin/prices`.

| What | Leads to |
| --- | --- |
| Breadcrumb "Admin" | `/admin` |
| "Record N prices" | `recordPrices({ checkedOn, prices })`, then the result line and the table loads again |
| "Cancel" | `/admin` |

The table comes from `getAdminPhones({ limit: 200 })`.

## Designs to match

- `docs/ui/admin-record-prices.png`.

## What must be on it

From `admin-record-prices.png`, top to bottom.

1. White band: the breadcrumb, the heading "Record prices" and the sub line "Enter the guide price you checked for each phone. Phones you leave empty keep their price."
2. A white card with "Checked on", today by default, with no future dates, and under it "A phone already checked on or after this date is skipped."
3. A table of every phone: the picture and the name, the current price, the last checked date, a New price field with `$` inside it, and the change.
4. The change is worked out as the admin types: in `--cs-price-note` with a down arrow at 2% lower or more, in grey otherwise (with an up arrow at 2% higher or more), and a dash while the field is empty.
5. A phone already checked on or after the chosen date shows "Already checked" and its field is disabled, the same rule the server uses.
6. Under the table, "N new prices", "Cancel" and the black "Record N prices" button with the live count, disabled at 0.
7. After recording, the line "N changed, N unchanged, N skipped" above the table.

While the page is open, the browser tab reads "Record prices | CellSense AI".

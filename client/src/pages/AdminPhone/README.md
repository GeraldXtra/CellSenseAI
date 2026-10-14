# Add or edit a phone

Ibrahim, Osakue, this page is mine and finished. You do not need to touch it. It is where an admin adds a phone to the list, or changes the specs, the category, the release year and the summary of a phone that is already there.

## Owner and branch

Owner: Gerald. Branch: `backend`. Files: `AdminPhone.jsx` and `AdminPhone.css` in this folder. Changed only by me.

## Routes

Paths: `/admin/phones/new` to add a phone and `/admin/phones/:slug` to edit one. Admins only, through AdminRoute, as on the Admin page. Examples: `http://localhost:5173/admin/phones/new` and `http://localhost:5173/admin/phones/samsung-galaxy-s24`.

| What | Leads to |
| --- | --- |
| Breadcrumb "Admin" | `/admin` |
| "Save phone" when adding | `createPhone(body)`, then `uploadPhonePicture(slug, file)` when a picture was chosen, then `/admin` with a success line |
| "Save phone" when editing | `updatePhone(slug, body)`, then `uploadPhonePicture(slug, file)` when a picture was chosen, then `/admin` with a success line |
| "Change prices on the Record prices page" (edit only) | `/admin/prices` |
| "Cancel" | `/admin` |

The page loads the brands with `getAdminPhones({ limit: 1 })` and, when editing, the phone with `getAdminPhone(slug)`. Neither call changes anything.

## Designs to match

- `docs/ui/admin-add-phone.png`.

## What must be on it

From `admin-add-phone.png`, top to bottom.

1. White band: the breadcrumb, the heading "Add a phone" (or the phone name when editing) and the sub line "Fill in the specs as the maker lists them. Prices are guide prices in US dollars."
2. Grey band with the form card on the left and two cards on the right from 1280px, one column under it.
3. Basics: Brand, a select of the brands in the data plus "Another brand", which shows a text field; Model; Category; Release year.
4. Specs: Processor, RAM, Storage, Main camera, Front camera, Battery, Display size, Display type, Refresh rate, Operating system and the 5G box. The units (GB, MP, mAh, in, Hz) sit inside the fields. A number spec may stay empty.
5. Price: Guide price with `$` inside the field, and Checked on, today by default, with no future dates.
6. Summary (optional), with the placeholder "One or two sentences about who the phone suits." and a count up to 400 characters.
7. "Save phone" and "Cancel".
8. Picture: a dashed box that takes a PNG by drag and drop or by "choose a file", shows a preview, and says the file is saved as `<slug>.png`. The picture goes up after the phone is saved. PNG only, under 2 MB.
9. "How it will look on the site": the real PhoneCard, fed with the form values and the chosen picture, updating as the admin types. It cannot be clicked.

When editing, the brand, the model, the price and the date checked are read only, because the slug and the picture name come from the brand and the model, and prices only change on Record prices so every price stays in the history. Saving a phone with source `ai` confirms it: it becomes source `admin` and loses the Estimated label, and the form says so above the fields.

The checks in the browser are the same as the server's, with the same messages, such as "Enter a battery between 1000 and 10000 mAh". A message from the server shows under its field, or under the form when it belongs to no field. While the page is open, the browser tab reads "Add a phone | CellSense AI" or "Edit <phone name> | CellSense AI".

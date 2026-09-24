# Reset password

Osakue, you own the Reset password page. It opens from the link in the email, so the token comes from the URL.

## Owner and branch

Owner: Osakue. Branch: `osakue`. Files: `ResetPassword.jsx` and `ResetPassword.css` in this folder. Import the css at the top of the page file.

## Routes

Path: `/reset-password/:token`. Read `token` with `useParams`. Example: `http://localhost:5173/reset-password/abc123`.

Where every click on this page leads, from `docs/ROUTES.md`:

| What | Leads to |
| --- | --- |
| "Save new password" | `resetPassword(token, password)`, then the saved state |
| "Log in" (saved state) | `/login` |
| "Request a new link" (invalid link state) | `/forgot-password` |

## Designs to match

- `docs/ui/reset-password.png`: the form.
- `docs/ui/reset-password-saved.png`: after the new password was saved.

## What must be on it

From `reset-password.png`. The page body is the grey band with the card in the middle.

1. AuthCard with the heading "Set a new password" and the sub line "Choose a password you have not used on this site before."
2. The form: label "New password" with the placeholder "Enter your new password" (type password) and the helper "At least 8 characters" under it; label "Confirm new password" with the placeholder "Enter your new password" (type password).
3. A full width `btn btn-primary` "Save new password".

From `reset-password-saved.png`: the card holds a FiCheck icon in a circle of `--cs-band-bg` (`--cs-launcher-size` across), centred, then the heading "Password updated", the sub line "You can log in with your new password now.", and a full width `btn btn-primary` "Log in" to `/login`.

## Components to use

- Shared: Loader.
- Yours: AuthCard.

## Services to call

- `resetPassword(token, password)` from `src/services/auth.service.js` returns `{ ok: true }`. When the token is invalid or older than one hour, the server answers 400 and the call throws with the server message.

## Mock data until the backend is ready

The endpoint answers 404 today. Build the three states with a local flag, and wire the call so that a thrown error shows the invalid link state. Nothing else to swap.

## The states to handle

- Idle: the form.
- Submitting: the button disabled with the label "Saving".
- Saved: `reset-password-saved.png`.
- Invalid link: the card with the heading "This link is invalid or has expired." and the sub line "Reset links work for one hour.", then a `btn btn-primary` "Request a new link" to `/forgot-password`. Show it when the server answers 400.
- Error: any other failure shows the server message in `--cs-error` under the button.
- Bad input: a password under 8 characters, or two passwords that differ, shows the field with `is-invalid` and a short line ("At least 8 characters." or "The two passwords do not match."); the form does not submit.

## Done checklist

1. The page works at 375px, 768px and 1280px and never scrolls sideways.
2. No hex codes or pixel values outside `client/src/styles/theme.css`.
3. The page sits inside the shared layout and uses the shared components.
4. The loading, empty and error states exist.
5. Data comes from `src/services` or `src/data/mockPhones.js`, never from fetch or axios inside a page.
6. No errors in the browser console.
7. Screenshots at phone size and desktop size are attached to the pull request.
8. Matches the image at 1280px.

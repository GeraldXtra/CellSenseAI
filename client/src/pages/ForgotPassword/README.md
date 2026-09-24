# Forgot password

Osakue, you own the Forgot password page. It has two states in the designs: the form and the "Check your email" message.

## Owner and branch

Owner: Osakue. Branch: `osakue`. Files: `ForgotPassword.jsx` and `ForgotPassword.css` in this folder. Import the css at the top of the page file.

## Routes

Path: `/forgot-password`. No parameters. Example: `http://localhost:5173/forgot-password`.

Where every click on this page leads, from `docs/ROUTES.md`:

| What | Leads to |
| --- | --- |
| "Send reset link" | `forgotPassword(email)`, then the sent state |
| "Back to log in" (the link under the form, and the button in the sent state) | `/login` |
| "Send it again" (sent state) | `forgotPassword(email)` again |

## Designs to match

- `docs/ui/forget-password.png`: the form.
- `docs/ui/forget-password-sent.png`: after the link was sent.

## What must be on it

From `forget-password.png`. The page body is the grey band with the card in the middle.

1. AuthCard with the heading "Forgot your password?" and the sub line "Enter your email and we will send you a link to set a new one."
2. The form: label "Email" with the placeholder "Enter your email".
3. A full width `btn btn-primary` "Send reset link".
4. Under the button, centred, the underlined link "Back to log in".

From `forget-password-sent.png`: the same card with the heading "Check your email" and the sub line "If that email exists, we sent a link to set a new password. The link works for one hour." (two lines). Then a full width `btn btn-primary` "Back to log in" and, under it, centred, the link "Send it again" in `--cs-ink-soft`. The message is the same whether or not the email exists; that is on purpose, so nobody can use this page to find out which emails have an account.

## Components to use

- Shared: Loader.
- Yours: AuthCard.

## Services to call

- `forgotPassword(email)` from `src/services/auth.service.js` returns `{ sent: true }`. Keep the email in state so "Send it again" can call it again.

## Mock data until the backend is ready

The endpoint answers 404 today. Build both states with a local flag, and wire the call so that a thrown error shows the error line. When the endpoint exists, the sent state appears on success. Nothing else to swap.

## The states to handle

- Idle: the form.
- Submitting: the button disabled with the label "Sending".
- Sent: `forget-password-sent.png`.
- Sent again: the same state, with a short line "Sent again." under the link for a few seconds.
- Error: the server message in `--cs-error` under the button.
- Bad input: an empty email or one without an @ shows the field with `is-invalid` and a short line; the form does not submit.

## Done checklist

1. The page works at 375px, 768px and 1280px and never scrolls sideways.
2. No hex codes or pixel values outside `client/src/styles/theme.css`.
3. The page sits inside the shared layout and uses the shared components.
4. The loading, empty and error states exist.
5. Data comes from `src/services` or `src/data/mockPhones.js`, never from fetch or axios inside a page.
6. No errors in the browser console.
7. Screenshots at phone size and desktop size are attached to the pull request.
8. Matches the image at 1280px.

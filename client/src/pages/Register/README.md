# Create account

Osakue, you own the Create account page. It is the Log in page with one more field and my security check, inside the same AuthCard. It does not log anyone in any more: it sends a 6 digit code to the email, and my Verify email page finishes the account.

## Owner and branch

Owner: Osakue. Branch: `osakue`. Files: `Register.jsx` and `Register.css` in this folder. Import the css at the top of the page file.

## Routes

Path: `/register`, with an optional `?next=<path>`. Read `next` with `useSearchParams`. Example: `http://localhost:5173/register`. After a successful register, go to `/verify-email?email=<the email, encoded>`, with `&next=` when `next` is an address inside our site (it starts with a single `/`). Verify email sends the person to `next`, or to `/`, once the code is right. A person who is already logged in goes to `/`.

Where every click on this page leads, from `docs/ROUTES.md`:

| What | Leads to |
| --- | --- |
| "Verify you are human" box | My Turnstile component; it hands the page a token |
| "Create account" button | `register({ name, email, password, turnstileToken })` from `useAuth`, then `/verify-email?email=<email>`, with `&next=` when there is one |
| "Log in" | `/login`, with the same `?next=` when there is one |

## Designs to match

- `docs/ui/create-account.png`.
- `docs/ui/create-account-security-check.png`: the security check between the password and the button.

## What must be on it

From `create-account.png`. The page body is the grey band with the card in the middle.

1. AuthCard with the heading "Create your account" and the sub line "Save favourites, keep your search history and get recommendations." (it wraps onto two lines at the card width).
2. The form: label "Name" with the placeholder "Enter your name"; label "Email" with "Enter your email"; label "Password" with "Enter your password" and, under the field, the helper "At least 8 characters" in `--cs-size-small` and `--cs-ink-soft` (Bootstrap's `form-text`, the theme colours it).
3. Between the password and the button, my Turnstile security check: the "Verify you are human" box with a status line under it.
4. A full width `btn btn-primary` "Create account", disabled until the name, the email and the password are filled and the box is ticked. While only the tick is missing, the line "Tick the security check to continue." sits under it in `--cs-ink-soft`.
5. Under the button, centred: "Already have an account? " in `--cs-ink-soft` and the underlined link "Log in".

## Components to use

- Shared: Loader, and Turnstile from `src/components/shared/Turnstile.jsx` with `onToken` and `resetKey`.
- Yours: AuthCard.

## Data

The endpoint is live. The exact contract for this page and Log in is in [`docs/DATA-FLOW.md`, Log in and Create account](../../../../docs/DATA-FLOW.md#log-in-and-create-account).

- Context: `useAuth()` from `src/context/AuthContext.jsx`, for `register`, and for `user` and `loading` to send a person who is already logged in to `/`.
- Service: none called by the page. `register({ name, email, password, turnstileToken })` from the context calls `register` in `src/services/auth.service.js`. It saves no token and sets no user, because the account exists only after the code. Do not call `auth.service.js` yourself.
- The token: `<Turnstile onToken={setTurnstileToken} resetKey={resetKey} />` gives the page the token after the tick, and `''` when it expires or fails. A token works once, so after every error the page changes `resetKey`, which clears the box for a new tick. The submit sends nothing without a token.
- Reply: the server answers with status 200, and `register` resolves to:

```js
{ email: "test.user@example.com", expiresInMinutes: 10, resendAfterSeconds: 60 }
```

- Messages: `register` throws an error with the server's message: "Name, email and password are required", "Enter a name between 2 and 60 characters", "Enter a valid email address", "Password must be at least 8 characters", "Keep your password under 72 characters", "Complete the security check", "The security check failed. Tick it again.", "An account with that email already exists", "Wait 45 seconds before asking for another code.", "We could not send the code. Try again in a moment." or "Too many sign up attempts. Try again in 15 minutes.", and "Could not reach the server. Check that it is running." when the server is off. The full list is in DATA-FLOW.md. Build the form, the error line and the redirect against those. To test, start the server as `docs/INSTALLATION.md` says.

## The states to handle

- Idle: the form as in the design.
- Waiting for the tick: the button disabled and "Tick the security check to continue." under it.
- Submitting: the button disabled with the label "Sending the code".
- Error: the server message in `--cs-error` under the button, for example "An account with that email already exists", and the security check cleared for a new tick.
- Bad input: an empty name, an email without an @, or a password under 8 characters shows the field with `is-invalid` and a short line; the form does not submit.
- Already logged in: redirect to `/`.

## Done checklist

1. The page works at 375px, 768px and 1280px and never scrolls sideways.
2. No hex codes or pixel values outside `client/src/styles/theme.css`.
3. The page sits inside the shared layout and uses the shared components.
4. The loading, empty and error states exist.
5. Data comes from `src/services` as `docs/DATA-FLOW.md` says for this page, never from fetch or axios inside a page, and the page does not import `src/data/mockPhones.js`.
6. No errors in the browser console.
7. Screenshots at phone size and desktop size are attached to the pull request.
8. Matches the image at 1280px.

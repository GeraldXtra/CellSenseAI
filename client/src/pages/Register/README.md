# Create account

Osakue, you own the Create account page. It is the Log in page with one more field, inside the same AuthCard.

## Owner and branch

Owner: Osakue. Branch: `osakue`. Files: `Register.jsx` and `Register.css` in this folder. Import the css at the top of the page file.

## Routes

Path: `/register`, with an optional `?next=<path>`. Read `next` with `useSearchParams`. Example: `http://localhost:5173/register`. After a successful register, go to `next` when it is an address inside our site (it starts with a single `/`), otherwise to the Home page `/`, with `replace: true`. A person who is already logged in goes to `/`.

Where every click on this page leads, from `docs/ROUTES.md`:

| What | Leads to |
| --- | --- |
| "Create account" button | `register({ name, email, password })` from `useAuth`, then `next` when it is inside our site, otherwise `/` |
| "Log in" | `/login`, with the same `?next=` when there is one |

## Designs to match

- `docs/ui/create-account.png`.

## What must be on it

From `create-account.png`. The page body is the grey band with the card in the middle.

1. AuthCard with the heading "Create your account" and the sub line "Save favourites, keep your search history and get recommendations." (it wraps onto two lines at the card width).
2. The form: label "Name" with the placeholder "Enter your name"; label "Email" with "Enter your email"; label "Password" with "Enter your password" and, under the field, the helper "At least 8 characters" in `--cs-size-small` and `--cs-ink-soft` (Bootstrap's `form-text`, the theme colours it).
3. A full width `btn btn-primary` "Create account".
4. Under the button, centred: "Already have an account? " in `--cs-ink-soft` and the underlined link "Log in".

## Components to use

- Shared: Loader.
- Yours: AuthCard.

## Data

The endpoint is live. The exact contract for this page and Log in is in [`docs/DATA-FLOW.md`, Log in and Create account](../../../../docs/DATA-FLOW.md#log-in-and-create-account).

- Context: `useAuth()` from `src/context/AuthContext.jsx`, for `register`, and for `user` and `loading` to send a person who is already logged in to `/`.
- Service: none called by the page. `register({ name, email, password })` from the context calls `register` in `src/services/auth.service.js`, stores the token and sets the user, so the top bar shows the name at once. Do not call `auth.service.js` yourself.
- Reply: the server answers `{ token, user }` with status 201; the context keeps the token, and `register` resolves to the user:

```js
{ _id, name: "Test User", email: "test.user@example.com", role: "user" }
```

- Messages: `register` throws an error with the server's message: "Name, email and password are required", "Enter a valid email address", "Password must be at least 8 characters" or "An account with that email already exists", and "Could not reach the server. Check that it is running." when the server is off. Build the form, the error line and the redirect against those. To test, start the server as `docs/INSTALLATION.md` says.

## The states to handle

- Idle: the form as in the design.
- Submitting: the button disabled with the label "Creating your account".
- Error: the server message in `--cs-error` under the button, for example "An account with that email already exists".
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

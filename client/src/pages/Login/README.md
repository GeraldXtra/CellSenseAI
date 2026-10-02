# Log in

Osakue, you own the Log in page and the AuthCard it sits in. AuthCard is shared by all four of your account pages, so build it first and the other three follow quickly.

## Owner and branch

Owner: Osakue. Branch: `osakue`. Files: `Login.jsx` and `Login.css` in this folder. Import the css at the top of the page file.

## Routes

Path: `/login`, with an optional `?next=<path>`. Read `next` with `useSearchParams`. ProtectedRoute sends a logged out person here with `next` set to the page they asked for. After a successful login, go to `next` when it is an address inside our site (it starts with a single `/`), otherwise to the Home page `/`, with `replace: true`. Example: `http://localhost:5173/login?next=/dashboard`. A person who is already logged in and opens `/login` goes to `/`.

Where every click on this page leads, from `docs/ROUTES.md`:

| What | Leads to |
| --- | --- |
| "Log in" button | `login({ email, password })` from `useAuth`, then `next` when it is inside our site, otherwise `/` |
| "Forgot password?" | `/forgot-password` |
| "Create an account" | `/register`, with the same `?next=` when there is one |

## Designs to match

- `docs/ui/log-in.png`.

## What must be on it

From `log-in.png`. The page body is the grey band, and the card floats in the middle of it with `--cs-space-16` above and below.

1. AuthCard: a white `.cs-card` with `--cs-auth-card-w` as its max width, centred. Inside, at the top: the heading "Log in" in `--cs-size-page-title`, centred, and the sub line "Your favourites and history are saved to your account." in `--cs-ink-soft`, centred.
2. The form: label "Email" and a `form-control` with the placeholder "Enter your email" (type email); label "Password" and a `form-control` with the placeholder "Enter your password" (type password). Under the password field, right aligned, the small link "Forgot password?" in `--cs-ink-soft`. Labels have `--cs-space-2` to their field and `--cs-space-5` between the two fields.
3. A full width `btn btn-primary` "Log in".
4. Under the button, centred: "New here? " in `--cs-ink-soft` followed by the underlined link "Create an account" in `--cs-ink`.

## Components to use

- Shared: Loader (inside the button while the call runs, or change the label to "Logging in").
- Yours: AuthCard. Give it `title`, `subtitle` and `children`; the pages put the form or the message inside. Build it in `src/components/osakue/AuthCard.jsx`.

## Data

The endpoint is live. The exact contract for this page and Create account is in [`docs/DATA-FLOW.md`, Log in and Create account](../../../../docs/DATA-FLOW.md#log-in-and-create-account).

- Context: `useAuth()` from `src/context/AuthContext.jsx`, for `login`, and for `user` and `loading` to send a person who is already logged in to `/`.
- Service: none called by the page. `login({ email, password })` from the context calls `login` in `src/services/auth.service.js`, stores the token and sets the user, so the top bar shows the name at once. Do not call `auth.service.js` yourself.
- Reply: the server answers `{ token, user }`; the context keeps the token, and `login` resolves to the user:

```js
{ _id, name: "Test User", email: "test.user@example.com", role: "user" }
```

- Messages: `login` throws an error with the server's message. "Email and password are required" when a field is empty, "Wrong email or password" when the two do not match an account, and "Could not reach the server. Check that it is running." when the server is off. Build the form, the error line and the redirect against those. To test, start the server as `docs/INSTALLATION.md` says and create an account on the Create account page.

## The states to handle

- Idle: the form as in the design.
- Submitting: the button disabled with the label "Logging in".
- Error: the server message in `--cs-error` under the button, for example "Wrong email or password". The fields keep their values.
- Bad input: an empty email or password shows the field with `is-invalid` and a short line under it; the form does not submit.
- Already logged in: redirect to `/`.

## Done checklist

1. The page works at 375px, 768px and 1280px and never scrolls sideways. Under 768px the card takes the full width with `--cs-space-4` at the sides.
2. No hex codes or pixel values outside `client/src/styles/theme.css`.
3. The page sits inside the shared layout and uses the shared components.
4. The loading, empty and error states exist.
5. Data comes from `src/services` as `docs/DATA-FLOW.md` says for this page, never from fetch or axios inside a page, and the page does not import `src/data/mockPhones.js`.
6. No errors in the browser console.
7. Screenshots at phone size and desktop size are attached to the pull request.
8. Matches the image at 1280px.

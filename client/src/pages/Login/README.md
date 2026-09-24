# Log in

Osakue, you own the Log in page and the AuthCard it sits in. AuthCard is shared by all four of your account pages, so build it first and the other three follow quickly.

## Owner and branch

Owner: Osakue. Branch: `osakue`. Files: `Login.jsx` and `Login.css` in this folder. Import the css at the top of the page file.

## Routes

Path: `/login`, with an optional `?next=<path>`. Read `next` with `useSearchParams`. ProtectedRoute sends a logged out person here with `next` set to the page they asked for. After a successful login, go to `next`, or to `/dashboard` when there is no `next`. Example: `http://localhost:5173/login?next=/dashboard`. A person who is already logged in and opens `/login` goes straight to `/dashboard`.

Where every click on this page leads, from `docs/ROUTES.md`:

| What | Leads to |
| --- | --- |
| "Log in" button | `login({ email, password })` from `useAuth`, then `next` or `/dashboard` |
| "Forgot password?" | `/forgot-password` |
| "Create an account" | `/register` |

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

## Services to call

- `login({ email, password })` from `useAuth()` in `src/context/AuthContext.jsx`. It calls the auth service, stores the token and sets the user. Do not call `auth.service.js` yourself; the context does it so the top bar updates at once.

## Mock data until the backend is ready

The endpoint answers 404 today, so `login` throws "Could not reach the server" or "Not found". Build the page against that: the form, the error line and the redirect. To see the logged in state and the dashboard, ask me for a test token when you get there. There is nothing to swap later, because `useAuth().login` is already the real call.

## The states to handle

- Idle: the form as in the design.
- Submitting: the button disabled with the label "Logging in".
- Error: the server message in `--cs-error` under the button, for example "Wrong email or password." The fields keep their values.
- Bad input: an empty email or password shows the field with `is-invalid` and a short line under it; the form does not submit.
- Already logged in: redirect to `/dashboard`.

## Done checklist

1. The page works at 375px, 768px and 1280px and never scrolls sideways. Under 768px the card takes the full width with `--cs-space-4` at the sides.
2. No hex codes or pixel values outside `client/src/styles/theme.css`.
3. The page sits inside the shared layout and uses the shared components.
4. The loading, empty and error states exist.
5. Data comes from `src/services` or `src/data/mockPhones.js`, never from fetch or axios inside a page.
6. No errors in the browser console.
7. Screenshots at phone size and desktop size are attached to the pull request.
8. Matches the image at 1280px.

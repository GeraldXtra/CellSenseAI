# Verify email

Ibrahim, Osakue, this page is mine and finished. You do not need to touch it. It is the second step of creating an account: the person types the 6 digit code we emailed, and only then does the account exist.

## Owner and branch

Owner: Gerald. Branch: `backend`. Files: `VerifyEmail.jsx` and `VerifyEmail.css` in this folder. Changed only by me.

## Routes

Path: `/verify-email?email=<email>`, with an optional `&next=<path>`. Create account sends the person here once the code is on its way. Example: `http://localhost:5173/verify-email?email=test.user%40example.com`. With no `email` in the address the page goes to `/register`. A person who is already logged in goes to `/`. After the right code, the page goes to `next` when it is an address inside our site (it starts with a single `/`), otherwise to `/`, with `replace: true`.

| What | Leads to |
| --- | --- |
| "Verify email" button | `verifyEmail({ email, code })` from `useAuth`, then `next` when it is inside our site, otherwise `/` |
| "Send a new code" | `resendCode(email)` from `src/services/auth.service.js`; the page stays |
| "Create your account again" (only after the sign up expired) | `/register`, with the same `?next=` when there is one |
| "Use a different email" | `/register`, with the same `?next=` when there is one |

## Designs to match

- `docs/ui/verify-email.png`.

## What must be on it

From `verify-email.png`. The page body is the grey band with a white card in the middle, the same width as the account cards (`--cs-auth-card-w`).

1. The heading "Check your email" and the sub line "We sent a 6 digit code to gerald@example.com. Enter it below to finish creating your account." The address is the one from `email`.
2. Six single digit boxes that work as one field. Only digits go in. Typing a digit moves to the next box, Backspace on an empty box goes back, the arrow keys, Home and End move between the boxes, and pasting a 6 digit code (or a phone filling it in) fills all six. Every box has `inputMode="numeric"` and an `aria-label` such as "Digit 1 of 6", and the first has `autoComplete="one-time-code"`.
3. A full width `btn btn-primary` "Verify email", disabled until all six boxes are filled.
4. Under the button, in `--cs-ink-soft`: "The code works for 10 minutes.", then "Didn't get it?" with the button "Send a new code". That button is disabled for 60 seconds when the page opens and again after each new code, and while it waits its label counts down: "You can ask for a new code in 0:45".
5. The underlined link "Use a different email".

While the page is open, the browser tab reads "Check your email | CellSense AI".

## Components to use

- Shared: Loader, while the login check runs.

## Data

The endpoints are live. The exact contract is in [`docs/DATA-FLOW.md`, Verify email](../../../../docs/DATA-FLOW.md#verify-email).

- Context: `useAuth()` from `src/context/AuthContext.jsx`, for `verifyEmail`, and for `user` and `loading` to send a person who is already logged in to `/`.
- Service: `resendCode(email)` from `src/services/auth.service.js`. `verifyEmail` in the context calls `verifyEmail` in the same file, stores the token and sets the user, so the top bar shows the name at once.
- Reply of `verifyEmail`: the server answers 201 with `{ token, user }`, and the context resolves to the user:

```js
{ _id, name: "Test User", email: "test.user@example.com", role: "user", emailVerified: true, createdAt }
```

- Reply of `resendCode`: `{ sent: true, expiresInMinutes: 10, resendAfterSeconds: 60 }`.
- Messages, shown under the boxes: "Enter the 6 digit code from the email", "That code is not right. You have 4 tries left." (down to "1 try left"), "Too many wrong codes. Ask for a new code.", "This code has expired. Ask for a new one.", "This sign up has expired. Create your account again.", "Wait 45 seconds before asking for another code.", "We could not send the code. Try again in a moment.", "Too many tries. Try again in 15 minutes." and "Too many new codes asked for. Try again in 15 minutes.".

To test, start the server as `docs/INSTALLATION.md` says and create an account. Without a Resend key the code is printed in the server window.

## The states to handle

- Idle: the boxes as in the design, with the first box focused.
- Checking: the button disabled with the label "Checking".
- Wrong code: the message in `--cs-error`, the boxes empty again and the first box focused.
- Too many wrong codes: the message, and "Verify email" stays disabled until a new code is sent.
- Expired sign up: the message and the link "Create your account again" to `/register`.
- New code sent: "We sent a new code to <email>." in `--cs-ink` with a check icon, and the countdown starts again from 1:00.
- Already logged in: redirect to `/`. No `email` in the address: redirect to `/register`.

## Done checklist

Done. It works at 375px, 768px and 1280px, never scrolls sideways, and matches `verify-email.png` at 1280px.

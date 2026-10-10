# Profile

Ibrahim, Osakue, this page is mine and finished. You do not need to touch it. It is where a logged in person sees their account, changes their name or password, clears their history, logs out their other devices and deletes the account.

## Owner and branch

Owner: Gerald. Branch: `backend`. Files: `Profile.jsx` and `Profile.css` in this folder. Changed only by me.

## Routes

Path: `/profile`. No parameters. Login required: `App.jsx` wraps it in ProtectedRoute, which sends a logged out person to `/login?next=/profile`. The account menu, the phone menu and the footer's Account column link here. Example: `http://localhost:5173/profile`.

| What | Leads to |
| --- | --- |
| "Open your dashboard" | `/dashboard` |
| "Save name" | `updateProfile({ name })`, then `updateUser(user)` from `useAuth` |
| "Update password" | `changePassword({ currentPassword, newPassword })`, then `applySession({ token, user })` from `useAuth` |
| "Clear" by Search history, then "Yes, clear" | `clearSearchHistory()` |
| "Clear" by Recently viewed, then "Yes, clear" | `clearRecentlyViewed()` |
| "Log out" by Other devices, then "Yes, log them out" | `signOutOthers()`, then `applySession({ token, user })` |
| "Delete my account", then "Yes, delete my account" | `deleteAccount(password)`, then `logout()` and `/` with `replace: true` |

## Designs to match

- `docs/ui/profile.png`.

## What must be on it

From `profile.png`, top to bottom.

1. White band: the heading "Your profile" in `.cs-heading` and the sub line "Signed in as Gerald. Only you can see this page." The name comes from `useAuth().user.name`.
2. Grey band with two columns from 1280px and one column under it.
3. Left, the summary card: a black circle with the first letter of the name (`--cs-avatar-size`), the name, the email, "Member since 22 Sep 2026", then a list between two hairlines with Favourites, Reviews written and Searches and their counts, and the link "Open your dashboard" with a chevron.
4. Right, four cards.
   - Your details: the Name field with a black "Save name" button beside it, disabled until the name has changed and has 2 to 60 characters. Then "Email" with a small "Verified" tag (only when the email is verified), a grey `readOnly` field with `aria-readonly` and a lock icon, and the line "Your email is how you log in, so it can't be changed."
   - Change password: "Last changed" and the date when the password was changed before; Current password, New password and Confirm new password, each with an eye button (its `aria-label` says "Show new password" or "Hide new password"); a live checklist "At least 8 characters", "Different from your current password" and "Both new passwords match"; a black "Update password" button, disabled until all three are met; and the line "Changing your password logs you out on your other devices."
   - Privacy: three rows divided by hairlines. "Search history" with "3 searches saved", "Recently viewed" with "3 phones", and "Other devices" with "Log out everywhere except here". Each row has a small outlined button ("Clear", "Clear", "Log out") that first asks with "Yes, clear" (or "Yes, log them out") and "Cancel" in its place. "Clear" is disabled when the list is already empty.
   - Delete account: the line "This removes your account, your favourites, your history and your reviews. It cannot be undone.", a Password field and a "Delete my account" button outlined in `--cs-error`. It first asks with "Yes, delete my account" and "Cancel".

While the page is open, the browser tab reads "Your profile | CellSense AI".

## Components to use

- Shared: Loader and EmptyState.

## Data

The endpoints are live. The exact contract is in [`docs/DATA-FLOW.md`, Profile](../../../../docs/DATA-FLOW.md#profile).

- Services, all from `src/services/users.service.js`: `getProfile()` through `useAsync` with `[]` as the list, `updateProfile({ name })`, `changePassword({ currentPassword, newPassword })`, `signOutOthers()`, `clearSearchHistory()`, `clearRecentlyViewed()` and `deleteAccount(password)`.
- Context: `useAuth()` for `user.name`, `updateUser`, `applySession` and `logout`.
- Reply of `getProfile`:

```js
{
  user: { _id, name: "Gerald", email: "gerald@example.com", emailVerified: true, emailVerifiedAt, createdAt, passwordChangedAt: null },
  counts: { favourites: 2, recentlyViewed: 3, searchHistory: 3, reviews: 1 }
}
```

- `changePassword` and `signOutOthers` answer `{ token, user }` with a new token. Every older token stops working at that moment, so `applySession` must run before any other request.
- Messages from the server, shown under the card they belong to: "Enter a name between 2 and 60 characters", "Enter your current password and a new password", "Password must be at least 8 characters", "Keep your password under 72 characters", "Your new password must be different from your current password", "Your current password is not right", "Enter your password to delete your account", "Your password is not right" and "Too many tries. Try again in 15 minutes.".

## The states to handle

- Loading: a Loader with "Loading your profile".
- Error: EmptyState with "We could not load your profile", the message, and a "Try again" button that calls `reload`.
- Busy: every button is disabled while its request runs and shows "Saving", "Updating password", "Clearing", "Logging out" or "Deleting your account".
- Success, in `--cs-ink` with a check icon: "Your name was saved.", "Your password was changed. Your other devices have been logged out.", "Your search history was cleared.", "Your recently viewed phones were cleared." and "Your other devices have been logged out."
- Error, in `--cs-error` on `--cs-error-bg`: the server message under the card.
- Deleted: the person is logged out and lands on `/`.

## Done checklist

Done. It works at 375px, 768px and 1280px, never scrolls sideways, and matches `profile.png` at 1280px.

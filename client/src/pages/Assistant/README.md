# Assistant

Osakue, you own the Assistant page and the small floating chat window that opens from every other page. The launcher button that opens the window is mine; the window itself, ChatWindow, is yours. Both the page and the window show the same conversation, which lives in ChatContext (mine).

## Owner and branch

Owner: Osakue. Branch: `osakue`. Files: `Assistant.jsx` and `Assistant.css` in this folder, plus `ChatWindow.jsx`, `ChatThread.jsx` and `ChatInput.jsx` in `src/components/osakue/`. Import the css at the top of the page file.

## Routes

Path: `/assistant`. No parameters. Example: `http://localhost:5173/assistant`. Nobody needs to be logged in.

Where every click on this page leads, from `docs/ROUTES.md`:

| What | Leads to |
| --- | --- |
| Send button, or Enter in the field | `send(text)` from `useChat`, which calls `chat(messages)` with the full history |
| A suggestion link under the card, or a suggestion chip in the empty state | `send(text)` with that text |
| "Compare" checkbox on a card under a reply | `useCompare.add(slug)` or `remove(slug)`, PhoneCard does it |
| "See details" on a card under a reply | `/phones/<slug>`, PhoneCard does it |

And the clicks on the floating chat window, which shows on every page except this one:

| What | Leads to |
| --- | --- |
| The launcher button (mine) | `openWindow()` from `useChat`, the window appears over the page |
| The x in the window header | `closeWindow()` |
| "Open full page" in the window header | `/assistant`, and the window closes |
| Send button, or Enter, in the window | `send(text)`, the same as on the page |
| "See details" on a phone row in the window | `/phones/<slug>` |

## Designs to match

- `docs/ui/assistant.png`: mid conversation, with a reply that mentions two phones and a typing bubble.
- `docs/ui/assistant-empty.png`: before any message.
- `docs/ui/assistant-window.png`: the floating chat window opened from the launcher, over a page.

## What must be on it

Top to bottom, from `assistant.png`. The page body sits on the grey band.

1. Heading "CellSense assistant" in `.cs-heading`, sub line "Answers from the same phone data as the site, with the date each price was checked."
2. A white `.cs-card` about two thirds of the container wide, centred, holding ChatThread and ChatInput.
   - ChatThread: one bubble per message. A user message sits on the right in `--cs-bubble-user-bg` with `--cs-bubble-user-text`, `--cs-radius-control` corners, no wider than two thirds of the card: "Best camera phone under $400?". A reply sits on the left in `--cs-bubble-reply-bg` with `--cs-ink` text: "Two phones fit. Redmi Note 13 Pro has a 200MP main camera at $299. Vivo V30 has 50MP front and back at $399, better for selfies. Both have 5G and 120Hz screens." Under a reply that came with phones, PhoneCards in a two column `.cs-grid` (the Redmi Note 13 Pro and the Vivo V30 in the design). Then the next user message "Which one has the better battery?" and, while the reply is loading, a small reply bubble with three dots in `--cs-ink-faint`.
   - ChatInput at the bottom of the card: a `form-control` with the placeholder "Ask about a phone, a price or a budget" and a square `btn btn-primary` with the FiArrowRight icon, `--cs-control-h` on both sides. Enter sends, Shift plus Enter makes a new line.
3. Under the card, three suggestion links in a row as `.cs-link-chevron`: "Best battery under $300", "Compare Galaxy S24 and OnePlus 12", "Cheapest 5G phone". Clicking one sends that text as a message.

`assistant-empty.png`: the same heading, sub line and card. The card body is empty except the centred line "Ask about a phone, a price or a budget. I answer from the phones on this site." in `--cs-ink-soft` and three outline suggestion chips under it: "Best camera phone under $400?", "Compare Galaxy S24 and OnePlus 12", "Which phone has the longest battery?". The design draws these chips fully rounded; we do not use pills, so give them `--cs-radius-control` and a hairline border in `--cs-line-strong`. Clicking a chip sends its text. The input row stays at the bottom of the card. The three links under the card show in both states.

Scroll the thread to the newest message after every send and every reply. The messages are not page state: they come from `useChat()` as `[{ role: "user" | "assistant", content, phones }]`, and `send(text)` sends the whole list every time; the server reads the history from it.

The floating chat window, from `assistant-window.png`. Build it as ChatWindow in `src/components/osakue/ChatWindow.jsx`. Layout (mine) renders it on every page; it shows only when `open` from `useChat()` is true, and never on `/assistant`.

1. A white card (`--cs-card-bg`, `--cs-radius-card`, `--cs-shadow-float`, `--cs-z-launcher`) fixed at the bottom right, about 380 wide by 560 tall. It sits over the page without moving anything under it. I add the two size variables to `theme.css` when you start it; do not type the numbers. The launcher hides while the window is open.
2. The header: "CellSense assistant" in `--cs-size-card-title` and `--cs-weight-bold` on the left; on the right the small link "Open full page" in `--cs-ink-soft`, which goes to `/assistant` and closes the window, and an x button (FiX) that calls `closeWindow()`. Under the header the sub line "Answers from the same phone data as the site." in `--cs-size-small` and `--cs-ink-soft`.
3. The thread: ChatThread with `compact` set. The bubbles are the same as on the page. The phones under a reply are compact rows instead of PhoneCards: a small PhoneImage on the left, the name in `--cs-weight-medium`, the price in `.cs-price`, and "See details" as a `.cs-link-chevron` on the right, each row a `.cs-card` with a hairline. In the design: "Redmi Note 13 Pro" $299 and "Vivo V30" $399. The thread scrolls inside the window; the page behind does not move.
4. ChatInput at the bottom, the same component as on the page.

## Components to use

- Shared: PhoneCard (on the page), PhoneImage (the compact rows in the window), Loader is not needed; the typing dots are the loading state.
- Yours: ChatThread (the bubbles, the cards or compact rows, the typing dots, the empty state with the chips), ChatInput, and ChatWindow built from those two.
- Mine: `useChat()` from `src/context/ChatContext.jsx`. It returns `{ messages, loading, open, openWindow, closeWindow, send }`. The page and the window read everything from it and keep no message state of their own, so the conversation survives moving between pages and both show the same messages.

## Services to call

- `chat(messages)` from `src/services/ai.service.js` returns `{ reply, phones }`. You do not call it: ChatContext calls it inside `send(text)`, appends the reply as an assistant message and keeps `phones` on that message so the cards or rows render under the bubble.

## Mock data until the backend is ready

ChatContext is a pass through stub today: `useChat()` returns an empty object. Build the page, ChatThread, ChatInput and ChatWindow against the shape above. Until my ChatContext lands, put a small stand in for `send` in `Assistant.jsx` and reuse it in ChatWindow: it waits about a second and answers from `mockPhones` in `src/data/mockPhones.js`. For a message with "camera" answer with the design's reply and the Redmi Note 13 Pro and the Vivo V30; for "battery" answer with the phone with the biggest `specs.battery`; for anything else answer "I can help with a phone, a price or a budget." and no phones. When my ChatContext is merged, delete the stand in and switch to `useChat()`. I tell you when.

## The states to handle

- Empty: `assistant-empty.png`, no messages yet. The window shows the same empty text and chips, in compact form.
- Sending: the typing bubble with the three dots, the input disabled, the send button disabled, on the page and in the window.
- Reply with phones: the cards under the bubble on the page, the compact rows in the window.
- Reply without phones: the bubble alone.
- Error: a reply bubble in `--cs-error-bg` with `--cs-error` text: "Something went wrong. Try again." and the person's message stays in the field so they can resend.
- Long thread: on the page the card grows and the page scrolls; in the window the thread scrolls inside the window.
- Window closed: only the launcher shows. Window open: the window shows and the launcher hides. On `/assistant`: neither shows.
- Moving between pages with the window open: the window stays open with the same messages, because both live in ChatContext.

## Done checklist

1. The page works at 375px, 768px and 1280px and never scrolls sideways. The card takes the full width under 768px, the bubbles can take most of it, the cards under a reply go one per row, the suggestion links wrap. Under 768px the window takes the full width minus the side padding and most of the height.
2. No hex codes or pixel values outside `client/src/styles/theme.css`.
3. The page sits inside the shared layout and uses the shared components.
4. The loading, empty and error states exist.
5. Data comes from `src/services` or `src/data/mockPhones.js`, never from fetch or axios inside a page.
6. No errors in the browser console.
7. Screenshots at phone size and desktop size are attached to the pull request.
8. Matches the image at 1280px.

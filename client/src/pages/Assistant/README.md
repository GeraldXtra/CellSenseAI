# Assistant

Osakue, you own the Assistant page. The small floating chat window that opens from every other page, and the button that opens it, are mine: shared components in `src/components/shared/`, finished, and Layout renders them. Your page and the window show the same conversation, which lives in ChatContext (mine).

## Owner and branch

Owner: Osakue. Branch: `osakue`. Files: `Assistant.jsx` and `Assistant.css` in this folder, plus `ChatThread.jsx` and `ChatInput.jsx` in `src/components/osakue/`. Import the css at the top of the page file.

## Routes

Path: `/assistant`, with an optional `?q=<text>`. Read `q` with `useSearchParams` and put that text in the input; the "Ask the assistant" button on Search results sends people here that way. Example: `http://localhost:5173/assistant?q=phone%20under%20%24400`. Nobody needs to be logged in.

Where every click on this page leads, from `docs/ROUTES.md`:

| What | Leads to |
| --- | --- |
| Send button, or Enter in the field | `send(text)` from `useChat`, which calls `chat(messages)` with the conversation so far |
| A suggestion link under the card, or a suggestion chip in the empty state | `send(text)` with that text |
| "Compare" checkbox on a card under a reply | `useCompare().add(slug)` or `remove(slug)`, PhoneCard does it |
| "See details" on a card under a reply | `/phones/<slug>`, PhoneCard does it |

The clicks in the floating window are in `docs/ROUTES.md` under "On every page". There is nothing in the window for you to do.

## Designs to match

- `docs/ui/assistant.png`: mid conversation, with a reply that mentions two phones and a typing bubble.
- `docs/ui/assistant-empty.png`: before any message.
- `docs/ui/assistant-window.png`: the floating chat window opened over another page. The window is mine and not part of your page; the image only shows you how the same conversation looks there.

## What must be on it

Top to bottom, from `assistant.png`. The page body sits on the grey band.

1. Heading "CellSense assistant" in `.cs-heading`, sub line "Answers from the same phone data as the site, with the date each price was checked."
2. A white `.cs-card` about two thirds of the container wide, centred, holding ChatThread and ChatInput.
   - ChatThread: one bubble per message. A user message sits on the right in `--cs-bubble-user-bg` with `--cs-bubble-user-text`, `--cs-radius-control` corners, no wider than two thirds of the card: "Best camera phone under $400?". A reply sits on the left in `--cs-bubble-reply-bg` with `--cs-ink` text: "Two phones fit. Redmi Note 13 Pro has a 200MP main camera at $299. Vivo V30 has 50MP front and back at $399, better for selfies. Both have 5G and 120Hz screens." Under a reply that came with phones, PhoneCards in a two column `.cs-grid` (the Redmi Note 13 Pro and the Vivo V30 in the design). Then the next user message "Which one has the better battery?" and, while the reply is loading, a small reply bubble with three dots in `--cs-ink-faint`.
   - ChatInput at the bottom of the card: a `form-control` with the placeholder "Ask about a phone, a price or a budget" and a square `btn btn-primary` with the FiArrowRight icon, `--cs-control-h` on both sides. Enter sends, Shift plus Enter makes a new line.
3. Under the card, three suggestion links in a row as `.cs-link-chevron`: "Best battery under $300", "Compare Galaxy S24 and OnePlus 12", "Cheapest 5G phone". Clicking one sends that text as a message.

`assistant-empty.png`: the same heading, sub line and card. The card body is empty except the centred line "Ask about a phone, a price or a budget. I answer from the phones on this site." in `--cs-ink-soft` and three outline suggestion chips under it: "Best camera phone under $400?", "Compare Galaxy S24 and OnePlus 12", "Which phone has the longest battery?". The design draws these chips fully rounded; we do not use pills, so give them `--cs-radius-control` and a hairline border in `--cs-line-strong`. Clicking a chip sends its text. The input row stays at the bottom of the card. The three links under the card show in both states.

Scroll the thread to the newest message after every send and every reply. The messages are not page state: they come from `useChat()` as `[{ role: "user" | "assistant", content, phones }]`, and `send(text)` sends the whole list every time; the server reads the history from it and keeps the last 12 messages. The texts above are the sample conversation in the design; the real ones come from `useChat()`.

## Components to use

- Shared: PhoneCard for the cards under a reply. Loader is not needed; the typing dots are the loading state. The floating window and its button are mine; Layout renders them on every page and both hide themselves on `/assistant`, so you never render them.
- Yours: ChatThread (the bubbles, the cards under a reply, the typing dots, the error bubble, the empty state with the chips) and ChatInput.

## Data

The chat endpoint is live. The exact contract for this page is in [`docs/DATA-FLOW.md`, Assistant page](../../../../docs/DATA-FLOW.md#assistant-page).

- Context: `useChat()` from `src/context/ChatContext.jsx`. It returns `{ messages, loading, error, open, openWindow, closeWindow, send }`, and your page needs `messages`, `loading`, `error` and `send`. The page and the window read everything from it and keep no message state of their own, so the conversation survives moving between pages and both show the same messages.
- Service: none called by the page. ChatContext calls `chat(messages)` from `src/services/ai.service.js` inside `send(text)`. The server answers `{ reply, phones }`, and ChatContext adds it to `messages` as an assistant message with its phones.
- What you read, `messages`, oldest first:

```js
[
  { role: "user", content: "Best camera phone under $400?" },
  { role: "assistant", content: "Two phones fit. ...", phones: [phone, phone] }
]
```

`phones` holds the phones the reply names, at most three, in the order it names them; the server finds them by name and keeps only the phones it gave the model. Each carries `_id`, `slug`, `brand`, `model`, `category`, `releaseYear`, `specs`, `price`, `source` and `imageUrl`, which is all PhoneCard needs. `send(text)` returns `true` when the reply came back and `false` when it failed, so clear the field only when it returns `true`.

- Messages: "The AI features are not set up yet" is what a laptop without the AI key sees. "Too many questions at once. Wait a minute and try again." comes after 20 requests to the AI routes in a minute from one address, and searches and recommendations count towards the same 20.

## The states to handle

- Empty: `assistant-empty.png`, no messages yet.
- Sending: the typing bubble with the three dots, the input disabled, the send button disabled.
- Reply with phones: the cards under the bubble.
- Reply without phones: the bubble alone.
- Error: a reply bubble in `--cs-error-bg` with `--cs-error` text showing `error` from `useChat()`, and the person's message stays in the field so they can resend. ChatContext takes the failed question back out of `messages`, so it shows only in the field.
- Prefill: when the address has `?q=`, that text is in the input when the page opens.
- Long thread: the card grows and the page scrolls.
- A conversation started in the window: it is already on your page when the person opens it, because both read ChatContext.
- On `/assistant` neither the assistant button nor the floating window shows, so nothing floats over your page.

## Done checklist

1. The page works at 375px, 768px and 1280px and never scrolls sideways. The card takes the full width under 768px, the bubbles can take most of it, the cards under a reply go one per row, the suggestion links wrap.
2. No hex codes or pixel values outside `client/src/styles/theme.css`.
3. The page sits inside the shared layout and uses the shared components.
4. The loading, empty and error states exist.
5. Data comes from `src/services` as `docs/DATA-FLOW.md` says for this page, never from fetch or axios inside a page, and the page does not import `src/data/mockPhones.js`.
6. No errors in the browser console.
7. Screenshots at phone size and desktop size are attached to the pull request.
8. Matches the image at 1280px.

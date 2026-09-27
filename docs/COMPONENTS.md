# Components

Ibrahim, Osakue, this file lists the reusable components, who owns each one and which pages use it. The shared ones are mine and already built. Yours are stubs: one comment line and an empty function, waiting for you.

## Shared components (owner Gerald, used on every page)

They live in `client/src/components/shared/`. Import them with a relative path, for example `import PhoneCard from '../../components/shared/PhoneCard.jsx'`.

| Component | What it does | Props |
| --- | --- | --- |
| Layout | The shell around every page: Navbar, the page content, Footer, ChatLauncher and ChatWindow. `App.jsx` puts every route inside it. You never render it yourself. | none |
| Navbar | The top bar: the logo mark and "CellSense AI", the links Browse, Compare, Recommend, Assistant and Dashboard, "Log in" or the user's name with the account menu. Under 768px it collapses to the logo, a search icon and a menu icon. | none |
| AccountMenu | The small dropdown under the user's name with Dashboard and Log out. | `onClose` |
| Footer | The five column footer with the three bottom lines and "Nigeria / English". | none |
| ChatLauncher | The fixed button at the bottom right that opens ChatWindow, the small floating chat, over the page. It is a button, not a link: it calls `openWindow()` and never changes the page. Hidden on the Assistant page and while the window is open. Focus comes back to it when the window closes. | none |
| ChatWindow | The small floating chat window, 380 by 560, fixed at the bottom right over the page without moving anything under it. Under 768px it takes the full width less a small margin on each side and most of the height. The header has "CellSense assistant", an "Open full page" link to `/assistant` that also closes the window, and an x. The thread scrolls inside the window: the bubbles, a compact row for each phone under a reply (picture, name, price, "See details"), the typing dots, the error bubble, and the three suggestion chips before the first message. The text field and the square send button sit at the bottom. It opens from ChatLauncher, shows nothing on `/assistant`, closes on Escape and reads everything from `useChat()`. Layout renders it; you never render it yourself. | none |
| PhoneImage | The phone picture when `imageUrl` is set, otherwise a plain grey box with the phone name as its label. | `phone`, `className` |
| PhoneCard | The product card: rank (optional), picture, name, one spec line, price with the optional Estimated label, the optional reason line, the Compare checkbox wired to `useCompare`, and the "See details" link to `/phones/<slug>`. | `phone` (required), `reason`, `estimated`, `rank`, `compare` (default true; pass `false` to hide the checkbox, as on Recommend and the dashboard recommendations) |
| Loader | A spinner with a label. | `label` (default "Loading") |
| EmptyState | A centred grey box with a title, a message and an optional action. | `title`, `message`, `action` (a node, for example a Link or a button) |
| ProtectedRoute | Shows Loader while login is checked, sends a logged out person to `/login?next=<page>`, otherwise shows the page. `App.jsx` wraps Dashboard in it. | `children` |

One context goes with the chat. ChatContext (mine, `client/src/context/ChatContext.jsx`) holds the messages, the loading flag, the error of the last failed send and the open state of the chat window, plus `send(text)`, which calls `chat(messages)` with the full history and appends the reply with its phones. `send(text)` returns true when the reply came back and false when the call failed; after a failure the thread goes back to what it was before the send and `error` holds the reason. `useChat()` returns `{ messages, loading, error, open, openWindow, closeWindow, send }`. ChatWindow and the Assistant page both read from it, so the conversation survives moving between pages and the Assistant page shows the same messages as the window.

Two helpers are exported next to the components: `phoneName(phone)` from `PhoneImage.jsx` gives "Brand Model" (or just the model when it already starts with the brand, as with "OnePlus 12"), and `specLine(phone)` from `PhoneCard.jsx` gives "8 GB, 256 GB, 50 MP, 4000 mAh". Use them wherever you show a phone name or a spec line, so every page writes them the same way.

## Ibrahim's components

Ibrahim, you own eight. They live in `client/src/components/ibrahim/`.

| Component | Owner | Used on | What it does |
| --- | --- | --- | --- |
| SearchBar | Ibrahim | Home, Search results | The big search field with the Search button. On submit it goes to `/search?q=<words>`. Takes an optional `initialValue` so Search results can show the current query. |
| UnderstoodChips | Ibrahim | Search results | The "Understood as" label and one chip per filter, each with an x that removes that filter. Takes `filters` and `onRemove(key)`. |
| FilterStrip | Ibrahim | Search results, Browse | The brand checkboxes, the price min and max inputs, the feature checkboxes (5G, 120Hz display, 8GB RAM or more, 5000mAh or more) and the Apply button, with vertical hairlines between the groups. Takes `value`, `onChange` and `onApply`. |
| BrandTabs | Ibrahim | Browse | The tabs All, Samsung, Apple, OnePlus, Xiaomi, Vivo. The active tab is bold with an ink underline. Each tab is a link to `/browse` or `/browse/<brand>`. |
| SortSelect | Ibrahim | Search results, Browse | The "Sort by:" select. Options newest, priceAsc and priceDesc, shown as Newest, Price low to high, Price high to low. Takes `value` and `onChange`. |
| SpecTable | Ibrahim | Phone detail | The two column Tech specs table: Processor, RAM, Storage, Main camera, Front camera on the left; Battery, Display, Refresh rate, Operating system, 5G on the right. Takes `specs`. |
| PriceHistoryChart | Ibrahim | Phone detail | The recharts line chart of `priceHistory` with the months on the x axis, the prices on the y axis and the caption "Sample data. Real points come from the nightly price check." Takes `history`. |
| NoticeBar | Ibrahim | Search results | The full width grey bar with the info icon, shown when the assistant added a phone. Takes `children` for the text. |

## Osakue's components

Osakue, you own eight. They live in `client/src/components/osakue/`.

| Component | Owner | Used on | What it does |
| --- | --- | --- | --- |
| CompareTable | Osakue | Compare | The spec table with one column per phone and the rows Price, Processor, RAM, Storage, Main camera, Front camera, Battery, Display, Refresh rate, Operating system. The best cell in each row uses `cs-cell-best`. Takes `phones` and `best`. |
| CompareSlots | Osakue | Compare | The row of slots above the table: picture, model name and Remove for each phone, and the dashed "Add a phone" slot with the plus. Takes `phones`, `onRemove(slug)` and `onAdd()`. |
| AddPhoneDialog | Osakue | Compare | The "Add a phone" dialog over the overlay: the x, the text field "Type a phone name", and the result rows with an Add button. Searches with `listPhones({ q })`. Takes `open`, `onClose` and `onAdd(slug)`. |
| RecommendForm | Osakue | Recommend | The white form card: Budget (US dollars), Brand, Purpose, Performance, the three checkboxes and "Show my top 3". Takes `onSubmit(needs)` and `loading`. |
| ChatThread | Osakue | Assistant | The bubbles (user on the right in ink, replies on the left in band bg), the PhoneCards under a reply, the typing dots, and the empty state text with the three suggestion chips. Takes `messages`, `loading` and `onSuggestion(text)`. |
| ChatInput | Osakue | Assistant | The text field "Ask about a phone, a price or a budget" with the square send button. Takes `onSend(text)` and `disabled`. |
| ReviewsSection | Osakue | Phone detail (Ibrahim places `<ReviewsSection slug={slug} />`) | The Summary card with "Based on N reviews", the Write a review form (Rating select, the text area, Post review), the review rows (author, "5 of 5", date, text), and the "No reviews yet. Be the first to write one." state. Loads its own data with `getReviews` and `getReviewSummary`. Takes `slug`. |
| AuthCard | Osakue | Log in, Create account, Forgot password, Reset password | The centred white card (auth card width) with a heading, a sub line and whatever form or message the page puts inside. Takes `title`, `subtitle` and `children`. |

## Cross owner cases

* PhoneCard (mine) is used on Home, Search results, Browse, Recommend, Assistant and Dashboard.
* SearchBar (Ibrahim) is used on Home and Search results.
* FilterStrip and SortSelect (Ibrahim) are used on Search results and Browse.
* ReviewsSection (Osakue) sits inside Phone detail (Ibrahim). Osakue builds it, Ibrahim places it.
* AuthCard (Osakue) is used on all four account pages.
* ChatWindow (mine) and the Assistant page (Osakue) show the same conversation. Both read it from `useChat()`, and neither keeps its own copy of the messages.

When you use a component the other one owns, use it as it is. If it needs a change, tell its owner, do not edit it on your branch.

## The rule

Use the shared component, never copy it. If it needs a new prop, ask me and I add it on `backend`.

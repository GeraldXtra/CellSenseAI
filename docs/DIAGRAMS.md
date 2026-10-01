# Diagrams

This file lists the diagrams for the CellSense AI report. Each diagram has a file name and a one line caption. The flows they show are the same flows we describe in words in [ARCHITECTURE.md](ARCHITECTURE.md), and each caption follows the code as it runs.

## The diagrams

| No. | File | Caption |
| --- | --- | --- |
| 1 | `docs/diagrams/system-overview.png` | The browser (React), the backend (Express), MongoDB Atlas, the model, the mail sender and the nightly price check, and which part talks to which. |
| 2 | `docs/diagrams/dfd-level-0.png` | Level 0 data flow diagram: the whole system as one process, with the data that flows between the user, the system, the database and the model. |
| 3 | `docs/diagrams/dfd-level-1.png` | Level 1 data flow diagram: the main processes (login, password reset, search, recommendation, comparison, the assistant, phone pages, reviews, dashboard, price check) and the data stores they read and write (phones, users, reviews, searchlogs, and the price list file). |
| 4 | `docs/diagrams/flow-login.png` | Register and login: email and password, the bcrypt hash, the JWT token that expires after seven days, and the `Authorization: Bearer <token>` header on protected requests. |
| 5 | `docs/diagrams/flow-search.png` | The direct match on brand and model, the sentence rule, the filters the model returns as JSON and the same database search, then the lookup that saves a phone we do not have with source `ai`, and the writes to `searchlogs` and to the search history of a logged in user. |
| 6 | `docs/diagrams/flow-recommendation.png` | The shortlist from MongoDB inside the budget and the brand (widened by 15 percent when fewer than three phones fit), scored by our own rules, the ranking of the top three by the model with a reason each, our own reasons when the model is not set up, and the save to the user's dashboard when logged in. |
| 7 | `docs/diagrams/flow-compare.png` | Two or three phones fetched by slug in the order of the link, the eight number rows (price, RAM, storage, main camera, front camera, battery, display size, refresh rate) checked for the best value with every tied winner marked, and the text rows (processor, display type, operating system) shown without a winner. |
| 8 | `docs/diagrams/flow-assistant.png` | The assistant: the last 12 messages, the related phones pulled from MongoDB, the prompt built from our rules, the phone data and the conversation, the call to the model, and the reply returned with at most three of the phones it names. |
| 9 | `docs/diagrams/flow-price-updater.png` | The nightly `node-cron` job at 02:00 Lagos time: read the price list in `server/data/prices.json`, skip phones already checked on or after its date, append `{ price, date, source }` to `priceHistory`, update `price.current` and `price.updatedAt`, and print a summary. |
| 10 | `docs/diagrams/sitemap.png` | All pages and their routes: Home, Search results, Browse, Browse by brand, Phone detail, Compare, Recommend, Assistant, Dashboard, Log in, Create account, Forgot password, Reset password, About and Page not found, plus the assistant button that opens the floating chat window on every page but the Assistant page. |
| 11 | `docs/diagrams/flow-password-reset.png` | Password reset: the request with the email, the token hash and the one hour expiry stored on the user, the email with the link (or the link printed in the terminal when mail is not set up), the new password posted with the token, the check of the hash and the expiry, the new bcrypt hash, and the reset removed so the link works once. |

## How we draw and store them

1. We draw every diagram in a diagram editor.
2. We export each diagram as a PNG into `docs/diagrams/`.
3. We keep the source `.drawio` file next to its PNG in the same folder.
4. When a diagram changes, we edit the `.drawio` file and export the PNG again, so the two files always match.

## Where they are used

These diagrams fill the Diagrams section of the final report. The order of the report is in [REPORT-OUTLINE.md](REPORT-OUTLINE.md). The page list behind `sitemap.png` is in [DESIGN-SPECIFICATIONS.md](DESIGN-SPECIFICATIONS.md). The collections behind the data stores in `dfd-level-1.png` are in [DATA-MODEL.md](DATA-MODEL.md).

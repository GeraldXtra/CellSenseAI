# Diagrams

This file lists the diagrams we will include in the CellSense AI report. Each diagram has a file name and a one line caption. The flows they show are the same flows we describe in words in [ARCHITECTURE.md](ARCHITECTURE.md).

## The diagrams

| No. | File | Caption |
| --- | --- | --- |
| 1 | `docs/diagrams/system-overview.png` | The browser (React), the backend (Express), MongoDB Atlas, the model, the mail sender and the nightly price updater, and which part talks to which. |
| 2 | `docs/diagrams/dfd-level-0.png` | Level 0 data flow diagram: the whole system as one process, with the data that flows between the user, the system, the database and the model. |
| 3 | `docs/diagrams/dfd-level-1.png` | Level 1 data flow diagram: the main processes (login, password reset, search, recommendation, comparison, the assistant, phone pages, reviews, dashboard, price updater) and the data stores they read and write (phones, users, reviews, searchlogs). |
| 4 | `docs/diagrams/flow-login.png` | Register and login: email and password, the bcrypt hash, the JWT token that expires after seven days, and the `Authorization: Bearer <token>` header on protected requests. |
| 5 | `docs/diagrams/flow-search.png` | Direct match on brand and model, then the filters the model returns as JSON, then the fallback that saves a phone with source `ai`, and the write to `searchlogs`. |
| 6 | `docs/diagrams/flow-recommendation.png` | The shortlist from MongoDB inside the budget (widened by 15 percent when fewer than three phones fit), the ranking of the top three by the model with a reason each, and the save to the user's dashboard when logged in. |
| 7 | `docs/diagrams/flow-compare.png` | Two or three phones fetched by slug, the rows built for price, processor, RAM, storage, main camera, front camera, battery, display size, refresh rate and operating system, the best value marked in each row, and the optional verdict from the model under the table. |
| 8 | `docs/diagrams/flow-assistant.png` | The assistant: the backend pulls related phones from MongoDB, builds a prompt with rules, phone data and chat history, sends it to the model, and returns the reply with the phones it mentioned. |
| 9 | `docs/diagrams/flow-price-updater.png` | The nightly `node-cron` job: load all phones, ask the price source for today's price, append to `priceHistory`, update `price.current` and `price.updatedAt`, and log a summary. |
| 10 | `docs/diagrams/sitemap.png` | All pages and their routes: Home, Search results, Browse, Browse by brand, Phone detail, Compare, Recommend, Assistant, Dashboard, Log in, Create account, Forgot password, Reset password, About and Page not found, plus the launcher button that opens the Assistant page from every screen. |
| 11 | `docs/diagrams/flow-password-reset.png` | Password reset: the request with the email, the token hash and the one hour expiry stored on the user, the email with the link, the new password posted with the token, the check of the hash and the expiry, and the new bcrypt hash. |

## How we draw and store them

1. We draw every diagram in a diagram editor.
2. We export each diagram as a PNG into `docs/diagrams/`.
3. We keep the source `.drawio` file next to its PNG in the same folder.
4. When a diagram changes, we edit the `.drawio` file and export the PNG again, so the two files always match.

## Where they are used

These diagrams fill the Diagrams section of the final report. The order of the report is in [REPORT-OUTLINE.md](REPORT-OUTLINE.md). The page list behind `sitemap.png` is in [DESIGN-SPECIFICATIONS.md](DESIGN-SPECIFICATIONS.md). The collections behind the data stores in `dfd-level-1.png` are in [DATA-MODEL.md](DATA-MODEL.md).

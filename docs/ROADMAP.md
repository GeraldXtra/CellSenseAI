# Roadmap

This file says what is done, what is next and what comes later, with the owner of each item. It matches the code as it is today. We build the backend and the pages at the same time: a page runs on the sample data in `client/src/data/mockPhones.js` until the matching endpoint is ready, then switches to the real service call. [API.md](API.md) marks every endpoint as Built or Planned.

## Done

| Item | What it means | Owner |
| --- | --- | --- |
| The designs | Every page and every state is drawn in `docs/ui/`, 26 images. The pages are built against them. | Gerald |
| The project structure | The client has its routes, theme, services, contexts, hooks, sample data, and one folder per page with a README. The server has its folders, its settings file, its middleware and its models. | Gerald |
| The shared frontend | The layout, the top bar with the account menu, the footer, the assistant launcher and the chat window, the phone card, the phone image, the loader, the empty state, the login guard, the three contexts, the services, `useAsync` and the Page not found page. | Gerald |
| Login | `POST /auth/register`, `POST /auth/login` and `GET /auth/me`, the User model, bcrypt hashes and JWT tokens. In the client, AuthContext saves the token and sets the user. | Gerald |
| The phone data | The Phone model, six sample phones in `server/data/phones.json`, the seed script, `GET /phones` with filters, sorting and pages, and `GET /phones/:slug`. | Gerald |
| Search | `POST /ai/search`: direct first, the sentence rule, the model turning a sentence into filters, the same database search, the search log, and the search history of a logged in user. | Gerald |
| Comparison | `GET /phones/compare` for two or three phones, with the best value in each row. | Gerald |
| Reviews | Posting and listing reviews and the star based summary, with one review per person per phone. | Gerald |
| The price trend | `GET /phones/:slug/price-trend`: falling, rising or stable from the stored price history, with a suggestion. | Gerald |
| The documents | The problem definition, the architecture, the backend guide, the API, the data model, the routes, the components, the ownership, the styling guide, the data flow guide, the team guide, the design specifications, the test cases, the installation steps, the assumptions, the report outline, the deliverables and this roadmap. | Gerald |

## Next, in order

| No. | Item | What gets done | Owner |
| --- | --- | --- | --- |
| 1 | Log in and Create account pages | AuthCard and the two pages against the designs, connected to the live login and register endpoints through `useAuth`. | Osakue |
| 2 | Browsing pages | Home, Search results, Browse, Phone detail and About against the designs, first on sample data, then switched to the live phone list, phone detail, price trend and search. | Ibrahim |
| 3 | Compare page and the reviews block | The Compare page and ReviewsSection against the designs, then switched to the live compare and review endpoints. | Osakue |
| 4 | Recommend, Assistant and Dashboard pages | The three pages against the designs, on sample data until their endpoints are built. | Osakue |
| 5 | The search fallback | When nothing matches and the query names a real phone we do not have, the model supplies its specifications and we save the phone with source `ai`. | Gerald |
| 6 | The assistant | `POST /ai/chat` with the related phones from the database. The chat window and the Assistant page switch to the real call. | Gerald |
| 7 | Recommendations | `POST /ai/recommend`: the shortlist from our own rules, ranked by the model with a reason for each phone. The Recommend page switches to the real call. | Gerald |
| 8 | The dashboard | `GET /users/me/dashboard`, the favourites, and recently viewed phones recorded on the phone route, capped at 20. The Dashboard page and "Save to favourites" switch to the real calls. | Gerald |

Items 1 to 4 run next to items 5 to 8.

## Later

| No. | Item | What gets done | Owner |
| --- | --- | --- | --- |
| 9 | Password reset | The two endpoints, the email through Nodemailer, the `passwordReset` field. Forgot password and Reset password switch to the real calls. | Gerald and Osakue |
| 10 | Price updater | The nightly job, the price source and `npm run prices`. | Gerald |
| 11 | Summaries by the model | The plain English summary of a phone, and the review summary and sentiment from the review texts. | Gerald |
| 12 | Input checks in one place | The checks that the controllers do today move into `validate.js`. | Gerald |
| 13 | More phones | More phones collected into `server/data/phones.json`, toward about 60. | All three |
| 14 | Mobile layouts | Every page checked at 375px and 768px, the collapsed top bar, tables that scroll inside their own box. | Ibrahim and Osakue on their pages, Gerald on the shared parts |
| 15 | The report | The sections in [REPORT-OUTLINE.md](REPORT-OUTLINE.md), the diagrams exported to `docs/diagrams/`, the screenshots of the built pages. | Gerald, with screenshots from Ibrahim and Osakue |
| 16 | Test data | The test cases in [TEST-DATA.md](TEST-DATA.md) run and recorded, with at least two per feature. | All three |
| 17 | Demo video | Five to eight minutes, recorded once every item above is done. | Osakue records, Ibrahim writes the script, Gerald prepares the data |

What we hand in and who prepares it is in [DELIVERABLES.md](DELIVERABLES.md).
